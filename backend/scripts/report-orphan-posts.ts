import dotenv from "dotenv";
import mongoose from "mongoose";
import Post from "../models/post.model";
import { DB_URI } from "../config/env";

dotenv.config();

// Kaliya liis (ma tirtiro wax) — posts aan lahayn author
const run = async () => {
  await mongoose.connect(DB_URI, { retryWrites: false });

  const orphans = await Post.find({
    $or: [{ author: { $exists: false } }, { author: null }],
  }).select("title createdAt");

  console.log(`Posts aan lahayn author: ${orphans.length}`);
  for (const post of orphans) {
    const createdAt = post.createdAt
      ? post.createdAt.toISOString()
      : "(ma jiro taariikh)";
    console.log(` - ${post._id} | ${post.title} | ${createdAt}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error(`Khalad: ${(error as Error).message}`);
  process.exit(1);
});
