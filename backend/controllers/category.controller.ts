import type { Request, Response } from "express";
import Category from "../models/category.model";

// Liiska categories-ka oo furan (public)
export const getCategories = async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });
  res.status(200).json({ success: true, data: { categories } });
};
