import mongoose from "mongoose";
import { DB_URI } from "../config/env.ts";

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI, { retryWrites: false });
    console.log("MongoDB si guul leh ayaa loogu xirmay");
  } catch (error) {
    console.error(
      `Khalad: MongoDB lama xirmin: ${(error as Error).message}`,
    );
    process.exit(1);
  }
};

export default connectDB;
