import dotenv from "dotenv";
import mongoose from "mongoose";
import Post from "../models/post.model";
import { DB_URI } from "../config/env";

dotenv.config();

// Non-destructive: kaliya posts-ka aan lahayn status ayaa la siiyaa "published".
// Waxba lama tirtiro, posts-ka horey u lahaa status lama taabto.
const run = async () => {
  await mongoose.connect(DB_URI, { retryWrites: false });

  const before = await Post.countDocuments({
    $or: [{ status: { $exists: false } }, { status: null }],
  });

  const result = await Post.updateMany(
    { $or: [{ status: { $exists: false } }, { status: null }] },
    { $set: { status: "published" } },
  );

  console.log(`Posts-ka status la'aanta ah: ${before}`);
  console.log(`Posts-ka la cusboonaysiiyay: ${result.modifiedCount}`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error(`Khalad: ${(error as Error).message}`);
  process.exit(1);
});
