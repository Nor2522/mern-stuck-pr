import { register, signIn, signOut } from "../controllers/auth.controller.ts";
import {
  changePassword,
  getMe,
  getPublicProfile,
  updateMe,
} from "../controllers/user.controller.ts";
import {
  loginLimiter,
  signUpLimiter,
} from "../middlewares/rateLimit.middleware.ts";
import authorize from "../middlewares/auth.middleware.ts";
import upload from "../middlewares/uploade.middleware.ts";
import { validateBody } from "../middlewares/validate.middleware.ts";
import { loginSchema, registerSchema } from "../validators/auth.validator.ts";
import {
  changePasswordSchema,
  updateProfileSchema,
} from "../validators/user.validator.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import Router from "express";

const authrouter = Router();

authrouter.post("/sign-up", signUpLimiter, validateBody(registerSchema), register);
authrouter.post("/login", loginLimiter, validateBody(loginSchema), signIn);
authrouter.post("/sign-out", signOut);

// "/me" waa inuu ka horreeyaa "/:id" si looga fogaado in "me" loo arko id
authrouter.get("/me", authorize, asyncHandler(getMe));
authrouter.put(
  "/me",
  authorize,
  upload.single("avatar"),
  validateBody(updateProfileSchema),
  asyncHandler(updateMe),
);
authrouter.put(
  "/me/password",
  authorize,
  validateBody(changePasswordSchema),
  asyncHandler(changePassword),
);

// Profaylka dadweynaha
authrouter.get("/:id", asyncHandler(getPublicProfile));

export default authrouter;
