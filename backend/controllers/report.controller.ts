import type { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../models/post.model";
import Report, { type ReportReason } from "../models/report.model";
import { HttpError } from "../middlewares/error.middleware";

// POST /api/post/:id/report -> user reports a post
// (only one report per user + post; second -> 409)
export const reportPost = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) throw new HttpError(401, "You are not logged in (unauthorized)");

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "Post not found");

  const post = await Post.findOne({ _id: id, status: "published" }).select(
    "_id author",
  );
  if (!post) throw new HttpError(404, "Post not found");

  if (post.author.toString() === currentUser._id.toString()) {
    throw new HttpError(404, "Post not found");
  }

  const existing = await Report.findOne({
    reporter: currentUser._id,
    post: post._id,
  });
  if (existing) {
    throw new HttpError(
      409,
      "You have already reported this post",
    );
  }

  const { reason, details } = req.body as { reason: string; details?: string };

  const report = await Report.create({
    reporter: currentUser._id,
    post: post._id,
    reason: reason as ReportReason,
    details: details ?? "",
  });

  return res.status(201).json({
    success: true,
    message: "Post reported",
    data: { report: { _id: report._id, reason, status: report.status } },
  });
};