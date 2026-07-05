import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createGroup,
  deleteGroup,
  getGroupById,
  joinGroup,
  leaveGroup,
  listGroupMembers,
  listGroups,
  listMyGroups,
  removeMember,
  updateGroup,
  updateMemberRole,
} from "./group.controller.js";
import {
  createGroupSchema,
  updateGroupMemberRoleSchema,
  updateGroupSchema,
} from "./group.validator.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createGroupSchema), createGroup);
router.get("/", listGroups);
router.get("/mine", listMyGroups);
router.get("/:groupId", getGroupById);
router.patch("/:groupId", validate(updateGroupSchema), updateGroup);
router.delete("/:groupId", deleteGroup);

router.post("/:groupId/join", joinGroup);
router.delete("/:groupId/leave", leaveGroup);

router.get("/:groupId/members", listGroupMembers);
router.patch(
  "/:groupId/members/:memberId/role",
  validate(updateGroupMemberRoleSchema),
  updateMemberRole,
);
router.delete("/:groupId/members/:memberId", removeMember);

export default router;
