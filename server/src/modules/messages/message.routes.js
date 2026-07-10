import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createMessageSchema,
  updateMessageSchema,
} from "./message.validator.js";
import {
  createMessage,
  deleteMessage,
  getConversationMessages,
  markMessageAsRead,
  updateMessage,
} from "./message.controller.js";

const router = Router();

// POST /api/messages/conversations/:conversationId
router.post(
  "/conversations/:conversationId",
  authMiddleware,
  validate(createMessageSchema),
  createMessage,
);

// GET /api/messages/conversations/:conversationId
router.get(
  "/conversations/:conversationId",
  authMiddleware,
  getConversationMessages,
);

// PATCH /api/messages/:id
router.patch(
  "/:id",
  authMiddleware,
  validate(updateMessageSchema),
  updateMessage,
);

// PATCH /api/messages/:id/read
router.patch("/:id/read", authMiddleware, markMessageAsRead);

// DELETE /api/messages/:id
router.delete("/:id", authMiddleware, deleteMessage);

export default router;
