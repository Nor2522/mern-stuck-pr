import { Router } from "express";
import { getBookmarks } from "../controllers/bookmark.controller";
import authorize from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const bookmarkRouter = Router();

bookmarkRouter.get("/", authorize, asyncHandler(getBookmarks));

export default bookmarkRouter;
