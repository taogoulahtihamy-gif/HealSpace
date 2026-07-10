import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import sessionRoutes from "../modules/sessions/session.routes.js";
import passwordResetRoutes from "../modules/password-resets/password-reset.routes.js";
import emailVerificationRoutes from "../modules/email-verifications/email-verification.routes.js";
import postRoutes from "../modules/posts/post.routes.js";
import commentRoutes from "../modules/comments/comment.routes.js";
import aiRoutes from "../modules/ai/ai.routes.js";
import reactionRoutes from "../modules/reactions/reaction.routes.js";
import conversationRoutes from "../modules/conversations/conversation.routes.js";
import messageRoutes from "../modules/messages/message.routes.js";
import mediaRoutes from "../modules/media/media.routes.js";
import groupInvitationRoutes from "../modules/group-invitations/group-invitation.routes.js";
import groupRoutes from "../modules/groups/group.routes.js";
import journalRoutes from "../modules/journal/journal.routes.js";
import notificationRoutes from "../modules/notifications/notification.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import supportRoutes from "../modules/supports/support.routes.js";
import reportRoutes from "../modules/reports/report.routes.js";
import moderationRoutes from "../modules/moderation/moderation.routes.js";
import friendshipRoutes from "../modules/friendships/friendship.routes.js";
import administrationRoutes from "../modules/administration/administration.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HealSpace API is running",
  });
});

router.use("/auth", authRoutes);
router.use("/auth", sessionRoutes);
router.use("/auth", passwordResetRoutes);
router.use("/auth", emailVerificationRoutes);

router.use("/posts", postRoutes);
router.use("/", commentRoutes);
router.use("/ai", aiRoutes);
router.use("/", reactionRoutes);

router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/media", mediaRoutes);

/*
|--------------------------------------------------------------------------
| Groups
|--------------------------------------------------------------------------
| Les invitations doivent être montées avant groupRoutes.
| Sinon /groups/:groupId peut intercepter /groups/invitations/mine.
*/
router.use("/groups", groupInvitationRoutes);
router.use("/groups", groupRoutes);

router.use("/journal", journalRoutes);
router.use("/notifications", notificationRoutes);
router.use("/users", userRoutes);
router.use("/supports", supportRoutes);
router.use("/reports", reportRoutes);
router.use("/moderation", moderationRoutes);
router.use("/friendships", friendshipRoutes);
router.use("/admin", administrationRoutes);

export default router;
