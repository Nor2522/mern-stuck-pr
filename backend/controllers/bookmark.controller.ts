import type { Request, Response } from "express";
import mongoose from "mongoose";
import Bookmark from "../models/bookmark.model";
import Post from "../models/post.model";
import { HttpError } from "../middlewares/error.middleware";

const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 50;

const populate = [
  { path: "author", select: "name avatar" },
  { path: "category", select: "name slug" },
];

// POST /api/post/:id/bookmark -> toggle (bookmark / remove)
export const toggleBookmark = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new HttpError(401, "You are not logged in (unauthorized)");
  }

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Post not found");
  }

  const post = await Post.findOne({ _id: id, status: "published" }).select(
    "_id",
  );
  if (!post) throw new HttpError(404, "Post not found");

  const existing = await Bookmark.findOneAndDelete({
    user: currentUser._id,
    post: post._id,
  });

  let bookmarked: boolean;
  if (existing) {
    bookmarked = false;
  } else {
    try {
      await Bookmark.create({ user: currentUser._id, post: post._id });
      bookmarked = true;
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        bookmarked = true;
      } else {
        throw error;
      }
    }
  }

  res.status(200).json({ success: true, data: { bookmarked } });
};

// GET /api/bookmarks -> posts bookmarked by the user (auth, paginated).
// Hidden/deleted posts are filtered out gracefully.
export const getBookmarks = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new HttpError(401, "You are not logged in (unauthorized)");
  }

  const parsedPage = Number.parseInt(String(req.query.page ?? "1"), 10);
  const parsedLimit = Number.parseInt(String(req.query.limit ?? DEFAULT_LIMIT), 10);
  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.isNaN(parsedLimit) ? DEFAULT_LIMIT : parsedLimit),
  );

  const bookmarks = await Bookmark.find({ user: currentUser._id })
    .sort({ createdAt: -1 })
    .populate({ path: "post", populate })
    .lean();

  const posts = bookmarks
    .map((bookmark) => bookmark.post)
    .filter(
      (post): post is NonNullable<typeof post> =>
        Boolean(post) &&
        (post as { status?: string }).status === "published",
    );

  const total = posts.length;
  const start = (page - 1) * limit;
  const paged = posts.slice(start, start + limit);

  res.status(200).json({
    success: true,
    data: {
      posts: paged,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
};
