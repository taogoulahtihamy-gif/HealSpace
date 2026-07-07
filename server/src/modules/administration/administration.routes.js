import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  deleteGroup,
  getStatistics,
  getUser,
  listActions,
  listGroups,
  listPosts,
  listReports,
  listUsers,
  updatePostStatus,
  updateUserRole,
  updateUserStatus,
} from "./administration.controller.js";
import {
  updateAdminPostStatusSchema,
  updateAdminUserRoleSchema,
  updateAdminUserStatusSchema,
} from "./administration.validator.js";

const router = Router();

router.use(authMiddleware);

router.get("/statistics", getStatistics);

router.get("/users", listUsers);
router.get("/users/:userId", getUser);
router.patch(
  "/users/:userId/role",
  validate(updateAdminUserRoleSchema),
  updateUserRole,
);
router.patch(
  "/users/:userId/status",
  validate(updateAdminUserStatusSchema),
  updateUserStatus,
);

router.get("/posts", listPosts);
router.patch(
  "/posts/:postId/status",
  validate(updateAdminPostStatusSchema),
  updatePostStatus,
);

router.get("/groups", listGroups);
router.delete("/groups/:groupId", deleteGroup);

router.get("/reports", listReports);
router.get("/moderation-actions", listActions);

export default router;
