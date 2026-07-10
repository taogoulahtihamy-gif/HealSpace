import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  sendEmailVerification,
  verifyEmail,
} from "./email-verification.controller.js";
import {
  sendEmailVerificationSchema,
  verifyEmailSchema,
} from "./email-verification.validator.js";

const router = Router();

router.post(
  "/email-verification/send",
  authMiddleware,
  validate(sendEmailVerificationSchema),
  sendEmailVerification,
);

router.post(
  "/email-verification/verify",
  validate(verifyEmailSchema),
  verifyEmail,
);

export default router;
