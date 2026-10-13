import { Router } from "express";
import authorize from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import {
  deleteAdminUser,
  getAdminStats,
  getAdminUsers,
  updateAdminUserBan,
  updateAdminUserRole,
} from "../controllers/admin.controller";
import {
  banUpdateSchema,
  roleUpdateSchema,
} from "../validators/admin.validator";
import { asyncHandler } from "../utils/asyncHandler";

// All /api/admin/* routes require admin
const adminRouter = Router();

adminRouter.use(authorize, requireRole("admin"));

adminRouter.get("/stats", asyncHandler(getAdminStats));
adminRouter.get("/users", asyncHandler(getAdminUsers));
adminRouter.patch(
  "/users/:id/role",
  validateBody(roleUpdateSchema),
  asyncHandler(updateAdminUserRole),
);
adminRouter.patch(
  "/users/:id/ban",
  validateBody(banUpdateSchema),
  asyncHandler(updateAdminUserBan),
);
adminRouter.delete("/users/:id", asyncHandler(deleteAdminUser));

export default adminRouter;