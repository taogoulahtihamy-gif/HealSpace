import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  acceptSupportRequest,
  cancelSupportRequest,
  completeSupportRequest,
  createSupportRequest,
  getSupportRequestById,
  listAvailableSupportRequests,
  listMySupportRequests,
} from "./support.controller.js";
import { createSupportSchema } from "./support.validator.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  validate(createSupportSchema),
  createSupportRequest,
);

router.get("/", listAvailableSupportRequests);

// Cette route statique doit rester avant "/:supportRequestId".
router.get("/mine", listMySupportRequests);

router.get(
  "/:supportRequestId",
  getSupportRequestById,
);

router.patch(
  "/:supportRequestId/accept",
  acceptSupportRequest,
);

router.patch(
  "/:supportRequestId/complete",
  completeSupportRequest,
);

router.patch(
  "/:supportRequestId/cancel",
  cancelSupportRequest,
);

export default router;
