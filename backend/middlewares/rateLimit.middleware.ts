import rateLimit from "express-rate-limit";

const authLimiterOptions = {
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7" as const,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
};

// Separate limits: login and sign-up each have their own counters
export const loginLimiter = rateLimit(authLimiterOptions);
export const signUpLimiter = rateLimit(authLimiterOptions);
