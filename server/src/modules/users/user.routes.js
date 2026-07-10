import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  changePassword,
  deactivateAccount,
  getMyProfile,
  getPublicProfile,
  searchUsers,
  updateMyProfile,
  updatePrivacy,
} from "./user.controller.js";
import {
  changePasswordSchema,
  deactivateAccountSchema,
  updatePrivacySchema,
  updateProfileSchema,
} from "./user.validator.js";

const router = Router();

router.use(authMiddleware);

// Les routes statiques restent avant "/:userId".
router.get("/me", getMyProfile);
router.get("/search", searchUsers);
router.patch("/me", validate(updateProfileSchema), updateMyProfile);
router.patch(
  "/me/password",
  validate(changePasswordSchema),
  changePassword,
);
router.patch(
  "/me/privacy",
  validate(updatePrivacySchema),
  updatePrivacy,
);
router.delete(
  "/me",
  validate(deactivateAccountSchema),
  deactivateAccount,
);

router.get("/:userId", getPublicProfile);

export default router;
