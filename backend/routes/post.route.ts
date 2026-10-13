import { Router } from "express";
import {
  createPost,
  deletePost,
  getPostById,
  getPosts,
  getUserPosts,
  getUserStats,
  updatePost,
} from "../controllers/post.controller";
import { toggleLike } from "../controllers/like.controller";
import {
  addComment,
  getComments,
} from "../controllers/comment.controller";
import { toggleBookmark } from "../controllers/bookmark.controller";
import { reportPost } from "../controllers/report.controller";
import authorize from "../middlewares/auth.middleware";
import optionalAuth from "../middlewares/optionalAuth.middleware";
import upload from "../middlewares/uploade.middleware.ts";
import { validateBody } from "../middlewares/validate.middleware.ts";
import { reportSchema } from "../validators/report.validator.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

const postRouter = Router();

// Public: post list and details (optionalAuth -> likedByMe/bookmarkedByMe)
postRouter.get("/", optionalAuth, asyncHandler(getPosts));
// Authorized: current user's posts (must come before "/:id")
postRouter.get("/user", authorize, asyncHandler(getUserPosts));
postRouter.get("/user/stats", authorize, asyncHandler(getUserStats));
postRouter.get("/:id", optionalAuth, asyncHandler(getPostById));

// Like / bookmark / comments for the post
postRouter.post("/:id/like", authorize, asyncHandler(toggleLike));
postRouter.post("/:id/bookmark", authorize, asyncHandler(toggleBookmark));
postRouter.get("/:id/comments", asyncHandler(getComments));
postRouter.post("/:id/comments", authorize, asyncHandler(addComment));
postRouter.post(
  "/:id/report",
  authorize,
  validateBody(reportSchema),
  asyncHandler(reportPost),
);

postRouter.post("/", authorize, upload.single("image"), asyncHandler(createPost));
postRouter.put("/:id", authorize, upload.single("image"), asyncHandler(updatePost));
postRouter.delete("/:id", authorize, asyncHandler(deletePost));

export default postRouter;
