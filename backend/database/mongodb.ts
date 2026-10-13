import mongoose from "mongoose";
import { DB_URI } from "../config/env.ts";

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI, { retryWrites: false });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(
      `Error: MongoDB connection failed: ${(error as Error).message}`,
    );
    process.exit(1);
  }
};

export default connectDB;
