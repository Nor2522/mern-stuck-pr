import dotenv from "dotenv";
import type { StringValue } from "ms";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI waa loo baahan yahay"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET waa loo baahan yahay"),
  JWT_EXPIRES_IN: z.string().min(1).default("30d"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, "CLOUDINARY_CLOUD_NAME waa loo baahan yahay"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY waa loo baahan yahay"),
  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, "CLOUDINARY_API_SECRET waa loo baahan yahay"),
});

const parsed = envSchema.safeParse({
  ...process.env,
  // Legacy names (DB_URI / EXPIRE_IN) are still accepted so existing .env files keep working.
  MONGODB_URI: process.env.MONGODB_URI ?? process.env.DB_URI,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? process.env.EXPIRE_IN,
});

if (!parsed.success) {
  console.error("Khalad: deegaanka (.env) ma dhamaystirna:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const {
  PORT,
  JWT_SECRET,
  CLIENT_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = parsed.data;

export const DB_URI = parsed.data.MONGODB_URI;
export const EXPIRE_IN = parsed.data.JWT_EXPIRES_IN as StringValue;
