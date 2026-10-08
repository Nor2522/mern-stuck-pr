import { Router } from "express";
import { createPost, getPost, updatePost } from "../controllers/post.controller";
import authorize from "../middlewares/auth.middleware";
import upload from "../middlewares/uploade.middleware.ts";
const postRouter = Router();
postRouter.get("/", authorize, getPost);
postRouter.post("/",authorize,upload.single("image"), createPost);
postRouter.put("/",authorize, updatePost)
export default postRouter;
