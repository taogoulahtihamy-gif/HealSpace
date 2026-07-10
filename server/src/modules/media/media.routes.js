import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createMediaSchema,
  uploadMediaSchema,
} from "./media.validator.js";
import {
  createMedia,
  deleteMedia,
  getMediaById,
  getUserMedia,
  uploadMedia,
} from "./media.controller.js";
import { uploadSingleMedia } from "./media.upload.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/upload",
  uploadSingleMedia,
  validate(uploadMediaSchema),
  uploadMedia,
);

// Route historique conservée pour éviter une régression.
router.post("/", validate(createMediaSchema), createMedia);

router.get("/", getUserMedia);
router.get("/:id", getMediaById);
router.delete("/:id", deleteMedia);

export default router;
