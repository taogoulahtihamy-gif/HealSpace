import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "./comment.validator.js";
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from "./comment.controller.js";

const router = Router();

router.post(
  "/posts/:postId/comments",
  authMiddleware,
  validate(createCommentSchema),
  createComment
);

router.get(
  "/posts/:postId/comments",
  authMiddleware,
  getCommentsByPost
);

router.patch(
  "/comments/:id",
  authMiddleware,
  validate(updateCommentSchema),
  updateComment
);

router.delete(
  "/comments/:id",
  authMiddleware,
  deleteComment
);

export default router;
