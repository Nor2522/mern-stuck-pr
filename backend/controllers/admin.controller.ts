import type { Request, Response } from "express";
import mongoose, { type QueryFilter } from "mongoose";
import User from "../models/user.model";
import Post from "../models/post.model";
import Comment from "../models/comment.model";
import Like from "../models/like.model";
import Bookmark from "../models/bookmark.model";
import Report from "../models/report.model";
import cloudinary from "../config/cloudinary";
import { HttpError } from "../middlewares/error.middleware";
import {
  banUpdateSchema,
  listUsersQuerySchema,
  roleUpdateSchema,
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

const assertValidId = (id: string | string[] | undefined): string => {
  if (!id || typeof id !== "string" || !mongoose.isValidObjectId(id)) {
    throw new HttpError(400, "Invalid user id");
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