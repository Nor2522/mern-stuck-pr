import type { Request, Response } from "express";
import mongoose, { type QueryFilter } from "mongoose";
import Post, { type PostType } from "../models/post.model";
import Category from "../models/category.model";
import Like from "../models/like.model";
import Bookmark from "../models/bookmark.model";
import cloudinary, { uploadToCloudinary } from "../config/cloudinary";
import { HttpError } from "../middlewares/error.middleware";
import {
  createPostSchema,
  updatePostSchema,
} from "../validators/post.validator";

// author-ka iyo category-ga la soo buuxiyo
const populate = [
  { path: "author", select: "name avatar" },
  { path: "category", select: "name slug" },
];

const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 50;

// Ku dar likedByMe/bookmarkedByMe marka isticmaale soo galay.
// Wuxuu ku shaqeeyaa document-yo iyo objects labadaba.
const withReactions = async (
  posts: unknown[],
  userId?: string | mongoose.Types.ObjectId,
): Promise<Record<string, unknown>[]> => {
  const plain = posts.map((post) =>
    typeof (post as { toObject?: unknown }).toObject === "function"
      ? (post as { toObject: () => Record<string, unknown> }).toObject()
      : (post as Record<string, unknown>),
  );

  if (!userId || plain.length === 0) return plain;

  const ids = plain.map(
    (post) => post._id as string | mongoose.Types.ObjectId,
  );
  const [likes, bookmarks] = await Promise.all([
    Like.find({ user: userId, post: { $in: ids } })
      .select("post")
      .lean(),
    Bookmark.find({ user: userId, post: { $in: ids } })
      .select("post")
      .lean(),
  ]);

  const liked = new Set(likes.map((item) => String(item.post)));
  const saved = new Set(bookmarks.map((item) => String(item.post)));

  return plain.map((post) => ({
    ...post,
    likedByMe: liked.has(String(post._id)),
    bookmarkedByMe: saved.has(String(post._id)),
  }));
};

const parsePagination = (query: Request["query"]) => {
  const parsedPage = Number.parseInt(String(query.page ?? "1"), 10);
  const parsedLimit = Number.parseInt(String(query.limit ?? DEFAULT_LIMIT), 10);
  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.isNaN(parsedLimit) ? DEFAULT_LIMIT : parsedLimit),
  );
  return { page, limit };
};

// category wuxuu noqon karaa ObjectId ama slug -> ObjectId | null
const findCategoryId = async (value: string): Promise<string | null> => {
  if (mongoose.isValidObjectId(value)) return value;
  const category = await Category.findOne({
    slug: value.trim().toLowerCase(),
  }).select("_id");
  return category ? category._id.toString() : null;
};

const paginated = (
  posts: unknown[],
  page: number,
  limit: number,
  total: number,
) => ({
  success: true,
  data: {
    posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  },
});

// Liiska posts-ka oo furan (public): pagination, search, filter, sort
export const getPosts = async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const filter: QueryFilter<PostType> = { status: "published" };

  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (q) filter.$text = { $search: q };

  const category =
    typeof req.query.category === "string" ? req.query.category.trim() : "";
  if (category) {
    const categoryId = await findCategoryId(category);
    if (!categoryId) {
      return res.status(200).json(paginated([], page, limit, 0));
    }
    filter.category = new mongoose.Types.ObjectId(categoryId);
  }

  const author = typeof req.query.author === "string" ? req.query.author : "";
  if (author) {
    if (!mongoose.isValidObjectId(author)) {
      throw new HttpError(400, "author aan sax ahayn");
    }
    filter.author = new mongoose.Types.ObjectId(author);
  }

  const sort: Record<string, -1 | 1> =
    req.query.sort === "popular"
      ? { likesCount: -1, createdAt: -1 }
      : { createdAt: -1 };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate(populate)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  res
    .status(200)
    .json(paginated(await withReactions(posts, req.user?._id), page, limit, total));
};

// Hal post oo furan (public): kaliya published
export const getPostById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Post lama helin");
  }

  const post = await Post.findOne({ _id: id, status: "published" }).populate(
    populate,
  );
  if (!post) throw new HttpError(404, "Post lama helin");

  const [withFlags] = await withReactions([post], req.user?._id);
  res.status(200).json({ success: true, data: { post: withFlags } });
};

// Posts-ka isticmaalaha hadda (waxay ku jiraan hidden, waa authorized)
export const getUserPosts = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new HttpError(401, "Ma aad soo galin (unauthorized)");
  }

  const { page, limit } = parsePagination(req.query);
  const filter: QueryFilter<PostType> = { author: currentUser._id };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate(populate)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  res.status(200).json(paginated(posts, page, limit, total));
};

// Abuur post (image waa ikhtiyaari)
export const createPost = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new HttpError(401, "Ma aad soo galin (unauthorized)");
  }

  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Xog aan sax ahayn");
  }
  const { title, description, category, tags } = parsed.data;

  let image: { url: string; publicId: string } | undefined;
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);
    image = { url: result.secure_url, publicId: result.public_id };
  }

  let categoryId: mongoose.Types.ObjectId | undefined;
  if (category) {
    const resolved = await findCategoryId(category);
    if (!resolved) throw new HttpError(400, "Category lama helin");
    categoryId = new mongoose.Types.ObjectId(resolved);
  }

  const post = await Post.create({
    title,
    description,
    image,
    category: categoryId,
    tags: tags ?? [],
    author: currentUser._id,
  });
  await post.populate(populate);

  res.status(201).json({ success: true, data: { post } });
};

// Cusboonaysii post (kaliya milkiilaha)
export const updatePost = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new HttpError(401, "Ma aad soo galin (unauthorized)");
  }

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Post lama helin");
  }

  const post = await Post.findById(id);
  if (!post) throw new HttpError(404, "Post lama helin");

  if (post.author.toString() !== currentUser._id.toString()) {
    throw new HttpError(403, "Ma lihid fasax aad ku beddesho post-kan");
  }

  const parsed = updatePostSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Xog aan sax ahayn");
  }
  const { title, description, category, tags } = parsed.data;

  // Haddii sawir cusub la soo diray, kii hore Cloudinary ka tirtir
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);
    if (post.image?.publicId) {
      await cloudinary.uploader.destroy(post.image.publicId);
    }
    post.image = { url: result.secure_url, publicId: result.public_id };
  }

  if (title !== undefined) post.title = title;
  if (description !== undefined) post.description = description;
  if (tags !== undefined) post.tags = tags;
  if (category !== undefined) {
    const resolved = await findCategoryId(category);
    if (!resolved) throw new HttpError(400, "Category lama helin");
    post.category = new mongoose.Types.ObjectId(resolved);
  }

  await post.save();
  await post.populate(populate);

  res.status(200).json({ success: true, data: { post } });
};

// Tirtir post (kaliya milkiilaha)
export const deletePost = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new HttpError(401, "Ma aad soo galin (unauthorized)");
  }

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Post lama helin");
  }

  const post = await Post.findById(id);
  if (!post) throw new HttpError(404, "Post lama helin");

  if (post.author.toString() !== currentUser._id.toString()) {
    throw new HttpError(403, "Ma lihid fasax aad ku tirtirto post-kan");
  }

  if (post.image?.publicId) {
    await cloudinary.uploader.destroy(post.image.publicId);
  }
  await post.deleteOne();

  res.status(200).json({ success: true, message: "Post deleted" });
};
