import type { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import cloudinary, { uploadToCloudinary } from "../config/cloudinary";
import { HttpError } from "../middlewares/error.middleware";

// Qaabka furaha sirta ah waa la reebay
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

// Soo celi isticmaalaha hadda (furaha sirta ah lama soo celiyo)
export const getMe = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Ma aad soo galin (unauthorized)" });
  }

  return res.status(200).json({ success: true, data: { user: meShape(user) } });
};

// Profaylka dadweynaha (public): email/password lama soo celiyo
export const getPublicProfile = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, "Isticmaale lama helin");
  }

  const user = await User.findById(id).select("name avatar bio createdAt");
  if (!user) throw new HttpError(404, "Isticmaale lama helin");

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

// Cusboonaysii profaylka (name/bio/avatar). Sawir cusub -> kii hore la tirtiraa
export const updateMe = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) throw new HttpError(401, "Ma aad soo galin (unauthorized)");

  const { name, bio } = req.body as { name?: string; bio?: string };

  if (name !== undefined && name !== currentUser.name) {
    const taken = await User.exists({ name, _id: { $ne: currentUser._id } });
    if (taken) {
      return res.status(400).json({
        success: false,
        message: "Magacan hore waa loo isticmaalay",
        errors: [{ field: "name", message: "Magacan hore waa loo isticmaalay" }],
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

// Beddel password-ka (waa in la hubsadaa password-ka hadda)
export const changePassword = async (req: Request, res: Response) => {
  const currentUser = req.user;
  if (!currentUser) throw new HttpError(401, "Ma aad soo galin (unauthorized)");

  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  const user = await User.findById(currentUser._id).select("+password");
  if (!user) throw new HttpError(401, "Isticmaale lama helin");

  const isMatch = await bcrypt.compare(
    currentPassword,
    user.password as string,
  );
  if (!isMatch) throw new HttpError(400, "Password-ka hadda waa khalad");

  const isSame = await bcrypt.compare(newPassword, user.password as string);
  if (isSame) throw new HttpError(400, "Password cusub waa isla kii hore");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "Password-ka waa la beddelay" });
};
