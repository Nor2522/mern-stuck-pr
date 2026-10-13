import { Router } from "express";
import authorize from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import {
  createAdminCategory,
  deleteAdminCategory,
  deleteAdminComment,
  deleteAdminPost,
  deleteAdminUser,
  getAdminCategories,
  getAdminComments,
  getAdminPosts,
  getAdminReports,
  getAdminStats,
  getAdminUsers,
  updateAdminCategory,
  updateAdminPostStatus,
  updateAdminReport,
  updateAdminUserBan,
  updateAdminUserRole,
} from "../controllers/admin.controller";
import {
  banUpdateSchema,
  categoryWriteSchema,
  reportUpdateSchema,
  roleUpdateSchema,
  statusUpdateSchema,
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

adminRouter.get("/posts", asyncHandler(getAdminPosts));
adminRouter.patch(
  "/posts/:id/status",
  validateBody(statusUpdateSchema),
  asyncHandler(updateAdminPostStatus),
);
adminRouter.delete("/posts/:id", asyncHandler(deleteAdminPost));

adminRouter.get("/reports", asyncHandler(getAdminReports));
adminRouter.patch(
  "/reports/:id",
  validateBody(reportUpdateSchema),
  asyncHandler(updateAdminReport),
);

adminRouter.get("/comments", asyncHandler(getAdminComments));
adminRouter.delete("/comments/:id", asyncHandler(deleteAdminComment));

adminRouter.get("/categories", asyncHandler(getAdminCategories));
adminRouter.post(
  "/categories",
  validateBody(categoryWriteSchema),
  asyncHandler(createAdminCategory),
);
adminRouter.patch(
  "/categories/:id",
  validateBody(categoryWriteSchema),
  asyncHandler(updateAdminCategory),
);
adminRouter.delete("/categories/:id", asyncHandler(deleteAdminCategory));

export default adminRouter;