import rateLimit from "express-rate-limit";

const authLimiterOptions = {
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7" as const,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Codsiyo badan ayaa la sameeyay, fadlan wax yar sug",
  },
};

// Xaddidayaal gaar ah: login iyo sign-up mid kastaa leeyahay xisaabtiisa
export const loginLimiter = rateLimit(authLimiterOptions);
export const signUpLimiter = rateLimit(authLimiterOptions);
