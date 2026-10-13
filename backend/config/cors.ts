import type { CorsOptions } from "cors";
import { CLIENT_ORIGINS } from "./env.ts";

// Any http://localhost:<port> or http://127.0.0.1:<port> (port optional).
const LOCAL_ORIGIN = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;

const isProduction = process.env.NODE_ENV === "production";

// Credentials are enabled, so never allow "*". In production only the exact
// origins from CLIENT_URL pass; in development localhost on any port is also
// allowed (Vite may fall back to 5174+ when 5173 is taken).
export const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return false;
  if (CLIENT_ORIGINS.includes(origin)) return true;
  return !isProduction && LOCAL_ORIGIN.test(origin);
};

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    callback(null, isOriginAllowed(origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};
