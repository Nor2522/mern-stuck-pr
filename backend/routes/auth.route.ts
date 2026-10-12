import { register, signIn, signOut } from "../controllers/auth.controller.ts";
import { getMe } from "../controllers/user.controller.ts";
import {
  loginLimiter,
  signUpLimiter,
} from "../middlewares/rateLimit.middleware.ts";
import authorize from "../middlewares/auth.middleware.ts";
import { validateBody } from "../middlewares/validate.middleware.ts";
import { loginSchema, registerSchema } from "../validators/auth.validator.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import Router from "express";

const authrouter = Router();

authrouter.post("/sign-up", signUpLimiter, validateBody(registerSchema), register);
authrouter.post("/login", loginLimiter, validateBody(loginSchema), signIn);
authrouter.post("/sign-out", signOut);
authrouter.get("/me", authorize, asyncHandler(getMe));

export default authrouter;
