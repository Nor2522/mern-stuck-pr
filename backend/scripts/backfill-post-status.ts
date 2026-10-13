import dotenv from "dotenv";
import mongoose from "mongoose";
import Post from "../models/post.model";
import { DB_URI } from "../config/env";

dotenv.config();

// Non-destructive: only posts without a status are set to "published".
// Nothing is deleted, posts that already had a status are not touched.
const run = async () => {
  await mongoose.connect(DB_URI, { retryWrites: false });

  const before = await Post.countDocuments({
    $or: [{ status: { $exists: false } }, { status: null }],
  });

  const result = await Post.updateMany(
    { $or: [{ status: { $exists: false } }, { status: null }] },
    { $set: { status: "published" } },
  );

  console.log(`Posts without a status: ${before}`);
  console.log(`Updated posts: ${result.modifiedCount}`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error(`Error: ${(error as Error).message}`);
  process.exit(1);
});
