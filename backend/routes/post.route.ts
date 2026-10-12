import { Router } from "express";
import { createPost, getPost, updatePost, getUserPosts, deletePost } from "../controllers/post.controller";
import authorize from "../middlewares/auth.middleware";
import upload from "../middlewares/uploade.middleware.ts";
const postRouter = Router();
postRouter.get("/", authorize, getPost);
postRouter.get("/user",authorize, getUserPosts)
postRouter.post("/",authorize,upload.single("image"), createPost);
postRouter.put("/:id",authorize,upload.single("image"), updatePost)
postRouter.delete("/:id",authorize, deletePost)
export default postRouter;
