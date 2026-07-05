import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createDirectConversationSchema,
  createGroupConversationSchema,
} from "./conversation.validator.js";
import {
  createDirectConversation,
  createGroupConversation,
  getConversationById,
  getConversations,
  leaveConversation,
} from "./conversation.controller.js";

const router = Router();

router.post(
  "/direct",
  authMiddleware,
  validate(createDirectConversationSchema),
  createDirectConversation
);

router.post(
  "/group",
  authMiddleware,
  validate(createGroupConversationSchema),
  createGroupConversation
);

router.get("/", authMiddleware, getConversations);
router.get("/:id", authMiddleware, getConversationById);
router.delete("/:id", authMiddleware, leaveConversation);

export default router;