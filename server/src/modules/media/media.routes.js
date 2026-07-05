import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createMediaSchema } from "./media.validator.js";
import {
  createMedia,
  deleteMedia,
  getMediaById,
  getUserMedia,
} from "./media.controller.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validate(createMediaSchema),
  createMedia
);

router.get(
  "/",
  authMiddleware,
  getUserMedia
);

router.get(
  "/:id",
  authMiddleware,
  getMediaById
);

router.delete(
  "/:id",
  authMiddleware,
  deleteMedia
);

export default router;
