import type { Request, Response } from "express";
import mongoose, { type QueryFilter } from "mongoose";
import User from "../models/user.model";
import Post, { type PostType } from "../models/post.model";
import Comment from "../models/comment.model";
import Like from "../models/like.model";
import Bookmark from "../models/bookmark.model";
import Report from "../models/report.model";
import cloudinary from "../config/cloudinary";
import { HttpError } from "../middlewares/error.middleware";
import {
  banUpdateSchema,
  listCommentsQuerySchema,
  listPostsQuerySchema,
  listReportsQuerySchema,
  listUsersQuerySchema,
  reportUpdateSchema,
  roleUpdateSchema,
  statusUpdateSchema,
} from "../validators/admin.validator";

// Last 14 days, format { date: "YYYY-MM-DD", count }
const dailySeries = async (
  model: mongoose.Model<any>,
  days: number,
): Promise<{ date: string; count: number }[]> => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  const rows = (await model.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
  ])) as { _id: string; count: number }[];

  const byDate = new Map(rows.map((row) => [row._id, row.count]));

  const series: { date: string; count: number }[] = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    series.push({ date: key, count: byDate.get(key) ?? 0 });
  }
  return series;
};

// GET /api/admin/stats -> totals + daily series (14 days) + latest entries
export const getAdminStats = async (_req: Request, res: Response) => {
  const [users, posts, comments, openReports, dailyUsers, dailyPosts, latestUsers, latestPosts] =
    await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      Report.countDocuments({ status: "open" }),
      dailySeries(User, 14),
      dailySeries(Post, 14),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role avatar createdAt"),
      Post.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title status createdAt author")
        .populate("author", "name avatar"),
    ]);

  return res.status(200).json({
    success: true,
    data: {
      totals: { users, posts, comments, openReports },
      daily: { users: dailyUsers, posts: dailyPosts },
      latestUsers,
      latestPosts,
    },
  });
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertValidId = (
  id: string | string[] | undefined,
  entity = "user",
): string => {
  if (!id || typeof id !== "string" || !mongoose.isValidObjectId(id)) {
    throw new HttpError(400, `Invalid ${entity} id`);
  }
  return id;
};

// GET /api/admin/users -> searchable, filterable, paginated user list
export const getAdminUsers = async (req: Request, res: Response) => {
  const parsed = listUsersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid query");
  }
  const { page, limit, q, role, status, sort } = parsed.data;

  const filter: QueryFilter<any> = {};
  if (q) {
    const rx = new RegExp(escapeRegExp(q), "i");
    filter.$or = [{ name: rx }, { email: rx }];
  }
  if (role) filter.role = role;
  if (status) filter.isBanned = status === "banned";

  const sortDir = sort === "oldest" ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("name email role isBanned avatar createdAt"),
    User.countDocuments(filter),
  ]);

  const ids = users.map((user) => user._id);
  const postCounts = await Post.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
    { $match: { author: { $in: ids } } },
    { $group: { _id: "$author", count: { $sum: 1 } } },
  ]);
  const countByUser = new Map(
    postCounts.map((row) => [row._id.toString(), row.count]),
  );

  const data = users.map((user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isBanned: user.isBanned,
    avatar: user.avatar ?? null,
    createdAt: user.createdAt,
    postsCount: countByUser.get(user._id.toString()) ?? 0,
  }));

  return res.status(200).json({
    success: true,
    data: {
      users: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

// PATCH /api/admin/users/:id/role -> promote or demote
export const updateAdminUserRole = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) throw new HttpError(401, "You are not logged in (unauthorized)");

  const id = assertValidId(req.params.id);
  const parsed = roleUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid data");
  }
  const { role } = parsed.data;

  const target = await User.findById(id);
  if (!target) throw new HttpError(404, "User not found");

  if (target._id.toString() === currentUser._id.toString()) {
    throw new HttpError(400, "You cannot change your own role");
  }
  if (target.role === "admin" && role === "user") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      throw new HttpError(400, "Cannot demote the last admin");
    }
  }

  target.role = role;
  await target.save();

  return res.status(200).json({
    success: true,
    message: role === "admin" ? "User promoted to admin" : "User demoted to user",
  });
};

// PATCH /api/admin/users/:id/ban -> suspend or unsuspend
export const updateAdminUserBan = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) throw new HttpError(401, "You are not logged in (unauthorized)");

  const id = assertValidId(req.params.id);
  const parsed = banUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid data");
  }
  const { isBanned } = parsed.data;

  const target = await User.findById(id);
  if (!target) throw new HttpError(404, "User not found");

  if (target._id.toString() === currentUser._id.toString()) {
    throw new HttpError(400, "You cannot ban yourself");
  }

  target.isBanned = isBanned;
  await target.save();

  return res.status(200).json({
    success: true,
    message: isBanned ? "User suspended" : "User unsuspended",
  });
};

// DELETE /api/admin/users/:id -> hard delete the account and all of its content
export const deleteAdminUser = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) throw new HttpError(401, "You are not logged in (unauthorized)");

  const id = assertValidId(req.params.id);
  const target = await User.findById(id);
  if (!target) throw new HttpError(404, "User not found");

  if (target._id.toString() === currentUser._id.toString()) {
    throw new HttpError(400, "You cannot delete your own account");
  }
  if (target.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      throw new HttpError(400, "Cannot delete the last admin");
    }
  }

  const posts = await Post.find({ author: target._id }).select("image");
  const postIds = posts.map((post) => post._id);

  await Promise.all(posts.map((post) =>
    post.image?.publicId ? cloudinary.uploader.destroy(post.image.publicId) : null,
  ));
  if (target.avatar?.publicId) {
    await cloudinary.uploader.destroy(target.avatar.publicId);
  }

  await Promise.all([
    Post.deleteMany({ author: target._id }),
    Like.deleteMany({ $or: [{ post: { $in: postIds } }, { user: target._id }] }),
    Bookmark.deleteMany({ $or: [{ post: { $in: postIds } }, { user: target._id }] }),
    Comment.deleteMany({ $or: [{ post: { $in: postIds } }, { author: target._id }] }),
    Report.deleteMany({ $or: [{ post: { $in: postIds } }, { reporter: target._id }] }),
    target.deleteOne(),
  ]);

  return res.status(200).json({ success: true, message: "User deleted" });
};

// GET /api/admin/posts -> all posts (incl. hidden), filterable + paginated
export const getAdminPosts = async (req: Request, res: Response) => {
  const parsed = listPostsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid query");
  }
  const { page, limit, q, status, sort } = parsed.data;

  const filter: QueryFilter<PostType> = {};
  if (status) filter.status = status;
  if (q) {
    const rx = new RegExp(escapeRegExp(q), "i");
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const sortMap: Record<string, -1 | 1> =
    sort === "oldest"
      ? { createdAt: 1 }
      : sort === "popular"
        ? { likesCount: -1, createdAt: -1 }
        : { createdAt: -1 };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate([
        { path: "author", select: "name avatar email" },
        { path: "category", select: "name slug" },
      ])
      .sort(sortMap)
      .skip((page - 1) * limit)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

// PATCH /api/admin/posts/:id/status -> hide or publish a post
export const updateAdminPostStatus = async (req: Request, res: Response) => {
  const id = assertValidId(req.params.id, "post");
  const parsed = statusUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid data");
  }
  const { status } = parsed.data;

  const post = await Post.findById(id);
  if (!post) throw new HttpError(404, "Post not found");

  post.status = status;
  await post.save();

  return res.status(200).json({
    success: true,
    message: status === "hidden" ? "Post hidden" : "Post published",
  });
};

// DELETE /api/admin/posts/:id -> hard delete post + its Cloudinary image + related data
export const deleteAdminPost = async (req: Request, res: Response) => {
  const id = assertValidId(req.params.id, "post");

  const post = await Post.findById(id);
  if (!post) throw new HttpError(404, "Post not found");

  if (post.image?.publicId) {
    await cloudinary.uploader.destroy(post.image.publicId);
  }
  await post.deleteOne();

  await Promise.all([
    Like.deleteMany({ post: post._id }),
    Bookmark.deleteMany({ post: post._id }),
    Comment.deleteMany({ post: post._id }),
    Report.deleteMany({ post: post._id }),
  ]);

  return res.status(200).json({ success: true, message: "Post deleted" });
};

// GET /api/admin/reports -> reported posts, filterable by status + paginated
export const getAdminReports = async (req: Request, res: Response) => {
  const parsed = listReportsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid query");
  }
  const { page, limit, status } = parsed.data;

  const filter: QueryFilter<unknown> = {};
  if (status) filter.status = status;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate([
        { path: "post", select: "title status" },
        { path: "reporter", select: "name email avatar" },
        { path: "resolvedBy", select: "name" },
      ])
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Report.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

// PATCH /api/admin/reports/:id -> resolve or dismiss (records who/when)
export const updateAdminReport = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) throw new HttpError(401, "You are not logged in (unauthorized)");

  const id = assertValidId(req.params.id, "report");
  const parsed = reportUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid data");
  }
  const { status } = parsed.data;

  const report = await Report.findById(id);
  if (!report) throw new HttpError(404, "Report not found");

  report.status = status;
  report.resolvedBy = currentUser._id;
  report.resolvedAt = new Date();
  await report.save();

  return res.status(200).json({
    success: true,
    message: status === "resolved" ? "Report resolved" : "Report dismissed",
  });
};

// GET /api/admin/comments -> latest comments, searchable + paginated
export const getAdminComments = async (req: Request, res: Response) => {
  const parsed = listCommentsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid query");
  }
  const { page, limit, q } = parsed.data;

  const filter: QueryFilter<unknown> = {};
  if (q) filter.text = new RegExp(escapeRegExp(q), "i");

  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .populate([
        { path: "author", select: "name email avatar" },
        { path: "post", select: "title status" },
      ])
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Comment.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

// DELETE /api/admin/comments/:id -> remove comment + decrement post count
export const deleteAdminComment = async (req: Request, res: Response) => {
  const id = assertValidId(req.params.id, "comment");

  const comment = await Comment.findById(id);
  if (!comment) throw new HttpError(404, "Comment not found");

  await comment.deleteOne();
  await Post.updateOne(
    { _id: comment.post, commentsCount: { $gt: 0 } },
    { $inc: { commentsCount: -1 } },
  );

  return res.status(200).json({ success: true, message: "Comment deleted" });
};