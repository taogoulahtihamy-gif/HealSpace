import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createPostSchema } from "./post.validator.js";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} from "./post.controller.js";

const router = Router();

router.get("/", authMiddleware, getPosts);
router.get("/:id", authMiddleware, getPostById);
router.post("/", authMiddleware, validate(createPostSchema), createPost);
router.patch("/:id", authMiddleware, validate(createPostSchema), updatePost);
router.delete("/:id", authMiddleware, deletePost);

export default router;