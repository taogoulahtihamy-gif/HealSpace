import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createReport,
  getMyReportById,
  listMyReports,
} from "./report.controller.js";
import { createReportSchema } from "./report.validator.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createReportSchema), createReport);

// Cette route statique doit rester avant "/:reportId".
router.get("/mine", listMyReports);

router.get("/:reportId", getMyReportById);

export default router;
