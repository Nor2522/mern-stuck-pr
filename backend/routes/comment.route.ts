import { Router } from "express";
import { deleteComment } from "../controllers/comment.controller";
import authorize from "../middlewares/auth.middleware";
import { writeLimiter } from "../middlewares/rateLimit.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const commentRouter = Router();

commentRouter.delete("/:id", authorize, writeLimiter, asyncHandler(deleteComment));

export default commentRouter;
