import { Router } from "express";

import { validate } from "../../middlewares/validation.middleware.js";
import {
  forgotPassword,
  resetPassword,
} from "./password-reset.controller.js";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./password-reset.validator.js";

const router = Router();

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPassword,
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPassword,
);

export default router;
