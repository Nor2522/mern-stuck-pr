import { Router } from "express";
import {
  createPost,
  deletePost,
  getPostById,
  getPosts,
  getUserPosts,
  updatePost,
} from "../controllers/post.controller";
import authorize from "../middlewares/auth.middleware";
import upload from "../middlewares/uploade.middleware.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

const postRouter = Router();

// Public: liiska iyo faahfaahinta post-ka
postRouter.get("/", asyncHandler(getPosts));
// Authorized: posts-ka isticmaalaha hadda (waa inuu ka horreeyaa "/:id")
postRouter.get("/user", authorize, asyncHandler(getUserPosts));
postRouter.get("/:id", asyncHandler(getPostById));

postRouter.post("/", authorize, upload.single("image"), asyncHandler(createPost));
postRouter.put("/:id", authorize, upload.single("image"), asyncHandler(updatePost));
postRouter.delete("/:id", authorize, asyncHandler(deletePost));

export default postRouter;
