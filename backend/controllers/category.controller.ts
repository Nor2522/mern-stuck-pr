import type { Request, Response } from "express";
import Category from "../models/category.model";

// Public list of categories
export const getCategories = async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });
  res.status(200).json({ success: true, data: { categories } });
};
