import type { Request, Response } from "express";
import mongoose from "mongoose";
import Like from "../models/like.model";
import Post from "../models/post.model";
import { HttpError } from "../middlewares/error.middleware";

// POST /api/post/:id/like -> toggle (sameynta). Waa idempotent marka la eego
// natiijta: riixid labaad waxay noqoneysaa unlike, mana dheeraado tiradu.
export const toggleLike = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) {
    throw new HttpError(401, "Ma aad soo galin (unauthorized)");
  }

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Post lama helin");
  }

  const post = await Post.findOne({ _id: id, status: "published" }).select(
    "_id",
  );
  if (!post) throw new HttpError(404, "Post lama helin");

  const existing = await Like.findOneAndDelete({
    user: currentUser._id,
    post: post._id,
  });

  let liked: boolean;
  if (existing) {
    // Unlike: hoos u dhig counts-ka laakiin ha noqon mid taban
    await Post.updateOne(
      { _id: post._id, likesCount: { $gt: 0 } },
      { $inc: { likesCount: -1 } },
    );
    liked = false;
  } else {
    try {
      await Like.create({ user: currentUser._id, post: post._id });
      await Post.updateOne({ _id: post._id }, { $inc: { likesCount: 1 } });
      liked = true;
    } catch (error) {
      // unique index: haddii riixid degdeg ah laba jeer sameyso, hal like
      if ((error as { code?: number }).code === 11000) {
        liked = true;
      } else {
        throw error;
      }
    }
  }

  const fresh = await Post.findById(post._id).select("likesCount");
  res.status(200).json({
    success: true,
    data: { liked, likesCount: fresh?.likesCount ?? 0 },
  });
};
