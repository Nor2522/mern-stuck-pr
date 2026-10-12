import type { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { EXPIRE_IN, JWT_SECRET } from "../config/env";
import ms from "ms";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: ms(EXPIRE_IN),
});

const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExist = await User.findOne({ $or: [{ email }, { name }] });
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "User or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password as string,
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET as string,
      {
        expiresIn: EXPIRE_IN,
      },
    );

    res.cookie("token", token, cookieOptions());

    return res.status(200).json({
      success: true,
      message: "User signed in successfully",
      userData: {
        user: { _id: user._id, name: user.name, email: user.email },
      },
      expire: ms(EXPIRE_IN),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const signOut = (req: Request, res: Response) => {
  const { maxAge: _maxAge, ...clearOptions } = cookieOptions();
  res.clearCookie("token", clearOptions);
  return res.status(200).json({
    success: true,
    message: "User signed out successfully",
  });
};

export { register, signIn, signOut };
