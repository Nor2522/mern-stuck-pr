import dotenv from "dotenv";
import type { StringValue } from "ms";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().min(1).default("30d"),
  // Comma-separated list of allowed browser origins. In development any
  // http://localhost:<port> / http://127.0.0.1:<port> is also accepted (see
  // config/cors.ts); in production only these exact origins are allowed.
  CLIENT_URL: z
    .string()
    .default("http://localhost:5173")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    )
    .pipe(
      z
        .array(z.string().url())
        .min(1, "CLIENT_URL must contain at least one valid origin"),
    ),
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, "CLOUDINARY_API_SECRET is required"),
});

const parsed = envSchema.safeParse({
  ...process.env,
  // Legacy names (DB_URI / EXPIRE_IN) are still accepted so existing .env files keep working.
  MONGODB_URI: process.env.MONGODB_URI ?? process.env.DB_URI,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? process.env.EXPIRE_IN,
});

if (!parsed.success) {
  console.error("Error: environment (.env) is incomplete:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const {
  PORT,
  JWT_SECRET,
  CLIENT_URL: CLIENT_ORIGINS,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = parsed.data;

export const DB_URI = parsed.data.MONGODB_URI;
export const EXPIRE_IN = parsed.data.JWT_EXPIRES_IN as StringValue;
