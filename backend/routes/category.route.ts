import { Router } from "express";
import { getCategories } from "../controllers/category.controller";
import { asyncHandler } from "../utils/asyncHandler";

const categoryRouter = Router();

categoryRouter.get("/", asyncHandler(getCategories));

export default categoryRouter;
