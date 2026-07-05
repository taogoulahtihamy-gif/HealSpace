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

router.post(
  "/conversations/:conversationId/messages",
  authMiddleware,
  validate(createMessageSchema),
  createMessage
);

router.get(
  "/conversations/:conversationId/messages",
  authMiddleware,
  getConversationMessages
);

router.patch(
  "/messages/:id",
  authMiddleware,
  validate(updateMessageSchema),
  updateMessage
);

router.patch(
  "/messages/:id/read",
  authMiddleware,
  markMessageAsRead
);

router.delete(
  "/messages/:id",
  authMiddleware,
  deleteMessage
);

export default router;
