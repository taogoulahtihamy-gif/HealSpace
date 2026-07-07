import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  getReport,
  listReports,
  rejectReport,
  resolveReport,
  startReview,
  updateUserStatus,
} from "./moderation.controller.js";
import {
  rejectReportSchema,
  resolveReportSchema,
  updateUserStatusSchema,
} from "./moderation.validator.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/reports",
  listReports,
);

router.get(
  "/reports/:reportId",
  getReport,
);

router.patch(
  "/reports/:reportId/review",
  startReview,
);

router.patch(
  "/reports/:reportId/resolve",
  validate(resolveReportSchema),
  resolveReport,
);

router.patch(
  "/reports/:reportId/reject",
  validate(rejectReportSchema),
  rejectReport,
);

router.patch(
  "/users/:userId/status",
  validate(updateUserStatusSchema),
  updateUserStatus,
);

export default router;
