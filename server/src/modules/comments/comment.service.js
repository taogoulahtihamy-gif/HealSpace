import { AppError } from "../../../core/errors/AppError.js";
import { findPostById } from "../posts/post.repository.js";
import {
  createComment,
  findCommentById,
  findCommentsByPostId,
  updateComment,
  softDeleteComment,
} from "./comment.repository.js";
import {
  toCommentResponse,
  toCommentListResponse,
} from "./comment.mapper.js";
import { COMMENT_MESSAGES } from "./comment.constants.js";

export async function createCommentService(userId, postId, payload) {
  const post = await findPostById(postId);

  if (!post || post.deletedAt) {
    throw new AppError(COMMENT_MESSAGES.POST_NOT_FOUND, 404);
  }

  if (payload.parentId) {
    const parentComment = await findCommentById(payload.parentId);

    if (!parentComment || parentComment.deletedAt || parentComment.postId !== postId) {
      throw new AppError(COMMENT_MESSAGES.NOT_FOUND, 404);
    }
  }

  const comment = await createComment({
    postId,
    authorId: userId,
    parentId: payload.parentId || null,
    content: payload.content,
  });

  return toCommentResponse(comment);
}

export async function getCommentsByPostService(postId) {
  const post = await findPostById(postId);

  if (!post || post.deletedAt) {
    throw new AppError(COMMENT_MESSAGES.POST_NOT_FOUND, 404);
  }

  const comments = await findCommentsByPostId(postId);

  return toCommentListResponse(comments);
}

export async function updateCommentService(userId, commentId, payload) {
  const comment = await findCommentById(commentId);

  if (!comment || comment.deletedAt) {
    throw new AppError(COMMENT_MESSAGES.NOT_FOUND, 404);
  }

  if (comment.authorId !== userId) {
    throw new AppError(COMMENT_MESSAGES.FORBIDDEN, 403);
  }

  const updatedComment = await updateComment(commentId, {
    content: payload.content,
  });

  return toCommentResponse(updatedComment);
}

export async function deleteCommentService(userId, commentId) {
  const comment = await findCommentById(commentId);

  if (!comment || comment.deletedAt) {
    throw new AppError(COMMENT_MESSAGES.NOT_FOUND, 404);
  }

  if (comment.authorId !== userId) {
    throw new AppError(COMMENT_MESSAGES.FORBIDDEN, 403);
  }

  await softDeleteComment(commentId);

  return null;
}
