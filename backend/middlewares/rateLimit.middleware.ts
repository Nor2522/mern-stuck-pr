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

// General guard for authenticated write endpoints (posts, comments, likes,
// bookmarks, reports, profile edits, admin mutations). Keyed by IP by default.
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7" as const,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});
