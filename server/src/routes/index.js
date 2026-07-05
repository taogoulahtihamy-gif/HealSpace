import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import postRoutes from "../modules/posts/post.routes.js";
import commentRoutes from "../modules/comments/comment.routes.js";
import aiRoutes from "../modules/ai/ai.routes.js";
import reactionRoutes from "../modules/reactions/reaction.routes.js";
import conversationRoutes from "../modules/conversations/conversation.routes.js";
import messageRoutes from "../modules/messages/message.routes.js";
import mediaRoutes from "../modules/media/media.routes.js";
import groupRoutes from "../modules/groups/group.routes.js";
import journalRoutes from "../modules/journal/journal.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HealSpace API is running",
  });
});

router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/", commentRoutes);
router.use("/ai", aiRoutes);
router.use("/", reactionRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/media", mediaRoutes);
router.use("/groups", groupRoutes);
router.use("/journal", journalRoutes);

export default router;