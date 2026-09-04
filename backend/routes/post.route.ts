import { Router } from "express";
import { createPost, getPost } from "../controllers/post.controller";
import authorize from "../middlewares/auth.middleware";

const postRouter = Router();
postRouter.get("/", authorize, getPost);
postRouter.post("/",authorize, createPost);

export default postRouter;
