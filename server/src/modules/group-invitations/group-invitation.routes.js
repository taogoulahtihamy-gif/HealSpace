import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  acceptGroupInvitation,
  cancelGroupInvitation,
  createGroupInvitation,
  listMyGroupInvitations,
  rejectGroupInvitation,
} from "./group-invitation.controller.js";
import { createGroupInvitationSchema } from "./group-invitation.validator.js";

const router = Router();

router.use(authMiddleware);

router.get("/invitations/mine", listMyGroupInvitations);

router.patch(
  "/invitations/:invitationId/accept",
  acceptGroupInvitation,
);

router.patch(
  "/invitations/:invitationId/reject",
  rejectGroupInvitation,
);

router.post(
  "/:groupId/invitations",
  validate(createGroupInvitationSchema),
  createGroupInvitation,
);

router.delete(
  "/:groupId/invitations/:invitationId",
  cancelGroupInvitation,
);

export default router;
