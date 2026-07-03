import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  analyzeMoodSchema,
  generateSupportSchema,
} from "./ai.validator.js";
import {
  analyzeMood,
  generateSupportMessage,
} from "./ai.controller.js";

const router = Router();

router.post(
  "/analyze-mood",
  authMiddleware,
  validate(analyzeMoodSchema),
  analyzeMood
);

router.post(
  "/support-message",
  authMiddleware,
  validate(generateSupportSchema),
  generateSupportMessage
);

export default router;