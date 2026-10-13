import type { Request, Response } from "express";
import mongoose, { type QueryFilter } from "mongoose";
import Post, { type PostType } from "../models/post.model";
import Category from "../models/category.model";
import Like from "../models/like.model";
import Bookmark from "../models/bookmark.model";
import Comment from "../models/comment.model";
import Report from "../models/report.model";
import cloudinary, { uploadToCloudinary } from "../config/cloudinary";
import { HttpError } from "../middlewares/error.middleware";
import {
  createPostSchema,
  listPostsQuerySchema,
  updatePostSchema,
} from "../validators/post.validator";
import { paginationQuerySchema } from "../validators/query.validator";

// Populate author and category
const populate = [
  { path: "author", select: "name avatar" },
  { path: "category", select: "name slug" },
];

// Adds likedByMe/bookmarkedByMe when a user is logged in.
// Works with both documents and plain objects.
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

// category can be an ObjectId or slug -> ObjectId | null
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

// Public list of posts: pagination, search, filter, sort
export const getPosts = async (req: Request, res: Response) => {
  const parsed = listPostsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid query");
  }
  const { page, limit, q, category, author, sort: sortParam } = parsed.data;
  const filter: QueryFilter<PostType> = { status: "published" };

  if (q) filter.$text = { $search: q };

  if (category) {
    const categoryId = await findCategoryId(category);
    if (!categoryId) {
      return res.status(200).json(paginated([], page, limit, 0));
    }
    filter.category = new mongoose.Types.ObjectId(categoryId);
  }

  if (author) {
    if (!mongoose.isValidObjectId(author)) {
      throw new HttpError(400, "Invalid author");
    }
    filter.author = new mongoose.Types.ObjectId(author);
  }

  const sort: Record<string, -1 | 1> =
    sortParam === "popular"
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

// Single public post: published only
export const getPostById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Post not found");
  }

  const post = await Post.findOne({ _id: id, status: "published" }).populate(
    populate,
  );
  if (!post) throw new HttpError(404, "Post not found");

  const [withFlags] = await withReactions([post], req.user?._id);
  res.status(200).json({ success: true, data: { post: withFlags } });
};

// Current user's posts (includes hidden, requires auth)
export const getUserPosts = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new HttpError(401, "You are not logged in (unauthorized)");
  }

  const parsed = paginationQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid query");
  }
  const { page, limit } = parsed.data;
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

// Current user's post stats (dashboard stats row)
export const getUserStats = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new HttpError(401, "You are not logged in (unauthorized)");
  }

  const [result] = await Post.aggregate<{
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
  }>([
    { $match: { author: currentUser._id } },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        totalLikes: { $sum: "$likesCount" },
        totalComments: { $sum: "$commentsCount" },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalPosts: result?.totalPosts ?? 0,
      totalLikes: result?.totalLikes ?? 0,
      totalComments: result?.totalComments ?? 0,
    },
  });
};

// Create post (image is optional)
export const createPost = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new HttpError(401, "You are not logged in (unauthorized)");
  }

  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid data");
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
    if (!resolved) throw new HttpError(400, "Category not found");
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

// Update post (owner only)
export const updatePost = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new HttpError(401, "You are not logged in (unauthorized)");
  }

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Post not found");
  }

  const post = await Post.findById(id);
  if (!post) throw new HttpError(404, "Post not found");

  if (post.author.toString() !== currentUser._id.toString()) {
    throw new HttpError(403, "You do not have permission to update this post");
  }

  const parsed = updatePostSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid data");
  }
  const { title, description, category, tags } = parsed.data;

  // If a new image is uploaded, delete the old one from Cloudinary
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
    if (!resolved) throw new HttpError(400, "Category not found");
    post.category = new mongoose.Types.ObjectId(resolved);
  }

  await post.save();
  await post.populate(populate);

  res.status(200).json({ success: true, data: { post } });
};

// Delete post (owner only)
export const deletePost = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new HttpError(401, "You are not logged in (unauthorized)");
  }

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Post not found");
  }

  const post = await Post.findById(id);
  if (!post) throw new HttpError(404, "Post not found");

  if (post.author.toString() !== currentUser._id.toString()) {
    throw new HttpError(403, "You do not have permission to delete this post");
  }

  if (post.image?.publicId) {
    await cloudinary.uploader.destroy(post.image.publicId);
  }
  await post.deleteOne();

  // Clean up related data (likes, bookmarks, comments, reports)
  await Promise.all([
    Like.deleteMany({ post: post._id }),
    Bookmark.deleteMany({ post: post._id }),
    Comment.deleteMany({ post: post._id }),
    Report.deleteMany({ post: post._id }),
  ]);

  res.status(200).json({ success: true, message: "Post deleted" });
};
