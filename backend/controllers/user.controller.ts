import type { Request, Response } from "express";

// Soo celi isticmaalaha hadda (furaha sirta ah lama soo celiyo)
export const getMe = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Ma aad soo galin (unauthorized)" });
  }

  return res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role ?? "user",
        avatar: user.avatar,
        bio: user.bio,
      },
    },
  });
};
