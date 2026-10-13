import type { Request, Response } from "express";
import mongoose from "mongoose";
import Comment from "../models/comment.model";
import Post from "../models/post.model";
import { HttpError } from "../middlewares/error.middleware";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// GET /api/post/:id/comments -> list (public, paginated)
export const getComments = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Post not found");
  }

  const parsedPage = Number.parseInt(String(req.query.page ?? "1"), 10);
  const parsedLimit = Number.parseInt(String(req.query.limit ?? DEFAULT_LIMIT), 10);
  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.isNaN(parsedLimit) ? DEFAULT_LIMIT : parsedLimit),
  );

  const filter = { post: id };
  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .populate("author", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Comment.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      comments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
};

// POST /api/post/:id/comments -> add comment (auth)
export const addComment = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new HttpError(401, "You are not logged in (unauthorized)");
  }

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Post not found");
  }

  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (text.length < 1) {
    throw new HttpError(400, "Comment cannot be empty");
  }
  if (text.length > 500) {
    throw new HttpError(400, "Comment must be at most 500 characters");
  }

  const post = await Post.findOne({ _id: id, status: "published" }).select(
    "_id",
  );
  if (!post) throw new HttpError(404, "Post not found");

  const comment = await Comment.create({
    post: post._id,
    author: currentUser._id,
    text,
  });
  await Post.updateOne({ _id: post._id }, { $inc: { commentsCount: 1 } });
  await comment.populate("author", "name avatar");

  const fresh = await Post.findById(post._id).select("commentsCount");

  res.status(201).json({
    success: true,
    data: { comment, commentsCount: fresh?.commentsCount ?? 0 },
  });
};

// DELETE /api/comment/:id -> owner or admin
export const deleteComment = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new HttpError(401, "You are not logged in (unauthorized)");
  }

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Comment not found");
  }

  const comment = await Comment.findById(id);
  if (!comment) throw new HttpError(404, "Comment not found");

  const isOwner = comment.author.toString() === currentUser._id.toString();
  const isAdmin = currentUser.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new HttpError(403, "You do not have permission to delete this comment");
  }

  await comment.deleteOne();
  await Post.updateOne(
    { _id: comment.post, commentsCount: { $gt: 0 } },
    { $inc: { commentsCount: -1 } },
  );

  const fresh = await Post.findById(comment.post).select("commentsCount");

  res.status(200).json({
    success: true,
    message: "Comment deleted",
    data: { commentsCount: fresh?.commentsCount ?? 0 },
  });
};
