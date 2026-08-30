import dotenv from "dotenv";
import type { StringValue } from "ms";

dotenv.config();

export const { PORT, DB_URI, JWT_SECRET } = process.env;
export const EXPIRE_IN = (process.env.EXPIRE_IN || "30d") as StringValue;
