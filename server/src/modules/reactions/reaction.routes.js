import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { reactionSchema } from "./reaction.validator.js";
import {
  reactToPost,
  getPostReactions,
  getPostReactionSummary,
  removeReaction,
} from "./reaction.controller.js";

const router = Router();

router.post(
  "/posts/:postId/reactions",
  authMiddleware,
  (req, res, next) => {
    console.log("REACTION BODY:", req.body);
    next();
  },
  validate(reactionSchema),
  reactToPost
);

router.get(
  "/posts/:postId/reactions",
  authMiddleware,
  getPostReactions
);

router.get(
  "/posts/:postId/reactions/summary",
  authMiddleware,
  getPostReactionSummary
);

router.delete(
  "/posts/:postId/reactions",
  authMiddleware,
  removeReaction
);

export default router;
