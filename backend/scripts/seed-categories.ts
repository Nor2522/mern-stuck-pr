import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "../models/category.model";
import { DB_URI } from "../config/env";

dotenv.config();

// Base category list (the slug is derived from the name)
const categories = [
  "Web",
  "Mobile",
  "AI",
  "Security",
  "DevOps",
  "Career",
  "Learning",
  "Projects",
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Non-destructive: only add (upsert) categories that do not already exist
const run = async () => {
  await mongoose.connect(DB_URI, { retryWrites: false });

  for (const name of categories) {
    const slug = slugify(name);
    await Category.updateOne(
      { slug },
      { $setOnInsert: { name, slug } },
      { upsert: true },
    );
  }

  const total = await Category.countDocuments();
  console.log(`Saved categories: ${total}`);
  console.log("Categories added, nothing deleted or changed.");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error(`Error: ${(error as Error).message}`);
  process.exit(1);
});
