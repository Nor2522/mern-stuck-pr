import { Router } from "express";
import { deleteComment } from "../controllers/comment.controller";
import authorize from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const commentRouter = Router();

commentRouter.delete("/:id", authorize, asyncHandler(deleteComment));

export default commentRouter;
