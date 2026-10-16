import type { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import cloudinary, { uploadToCloudinary } from "../config/cloudinary";
import { HttpError } from "../middlewares/error.middleware";

// Exclude password field from user shape
const meShape = (user: {
  _id: unknown;
  name: string;
  email: string;
  role?: string;
  avatar?: unknown;
  bio?: string | null;
}) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role ?? "user",
  avatar: user.avatar,
  bio: user.bio,
});

// Get current user (password not returned)
export const getMe = async (req: Request, res: Response) => {
  const user = req.user;

  // Anonymous session check: 200 with user null instead of 401, so logged-out
  // visitors don't produce console/network noise on every page load.
  if (!user) {
    return res.status(200).json({ success: true, data: { user: null } });
  }

  return res.status(200).json({ success: true, data: { user: meShape(user) } });
};

// Public profile: email/password not returned
export const getPublicProfile = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "User not found");
  }

  const user = await User.findById(id).select("name avatar bio createdAt");
  if (!user) throw new HttpError(404, "User not found");

  return res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    },
  });
};

// Update profile (name/bio/avatar). If new image uploaded, delete old one
export const updateMe = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) throw new HttpError(401, "You are not logged in (unauthorized)");

  const { name, bio } = req.body as { name?: string; bio?: string };

  if (name !== undefined && name !== currentUser.name) {
    const taken = await User.exists({ name, _id: { $ne: currentUser._id } });
    if (taken) {
      return res.status(400).json({
        success: false,
        message: "This name is already taken",
        errors: [{ field: "name", message: "This name is already taken" }],
      });
    }
  }

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, "avatars");
    if (currentUser.avatar?.publicId) {
      await cloudinary.uploader.destroy(currentUser.avatar.publicId);
    }
    currentUser.avatar = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  if (name !== undefined) currentUser.name = name;
  if (bio !== undefined) currentUser.bio = bio;

  await currentUser.save();

  return res
    .status(200)
    .json({ success: true, data: { user: meShape(currentUser) } });
};

// Change password (must verify current password)
export const changePassword = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) throw new HttpError(401, "You are not logged in (unauthorized)");

  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  const user = await User.findById(currentUser._id).select("+password");
  if (!user) throw new HttpError(401, "Unauthorized, this user does not exist");

  const isMatch = await bcrypt.compare(
    currentPassword,
    user.password as string,
  );
  if (!isMatch) throw new HttpError(400, "Current password is incorrect");

  const isSame = await bcrypt.compare(newPassword, user.password as string);
  if (isSame) throw new HttpError(400, "New password must be different from the current one");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "Password changed" });
};
