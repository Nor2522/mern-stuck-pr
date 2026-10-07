import dotenv from "dotenv";
import type { StringValue } from "ms";

dotenv.config();

export const { PORT, DB_URI, JWT_SECRET } = process.env;
export const EXPIRE_IN = (process.env.EXPIRE_IN || "30d") as StringValue;

// cloudinary setup 

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME as string;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY as string;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET as string;
