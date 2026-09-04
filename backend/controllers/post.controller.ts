import type { NextFunction, Request, Response } from "express";
import Post from "../models/post.model";

export const getPost = async (req: Request, res: Response) => {
  try {
    const post = await Post.find();
    res.status(200).json({ success: true, data: { post } });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error,
    });
  }
};

// create post

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const post = new Post({ title, description });
    await post.save();
    res.status(200).json({
      success: true,
      data: { post },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error,
    });
  }
};
