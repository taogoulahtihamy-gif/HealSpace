import { AppError } from "../../../core/errors/AppError.js";

import { createNotification } from
  "../notifications/notification.service.js";

import { findPostById } from
  "../posts/post.repository.js";

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

import {
  COMMENT_MESSAGES,
  COMMENT_NOTIFICATION,
} from "./comment.constants.js";

async function getRequiredPost(postId) {
  const post = await findPostById(postId);

  if (!post || post.deletedAt) {
    throw new AppError(
      COMMENT_MESSAGES.POST_NOT_FOUND,
      404,
    );
  }

  return post;
}

async function getParentComment(parentId, postId) {
  if (!parentId) {
    return null;
  }

  const parentComment = await findCommentById(parentId);

  if (
    !parentComment ||
    parentComment.deletedAt ||
    parentComment.postId !== postId
  ) {
    throw new AppError(
      COMMENT_MESSAGES.NOT_FOUND,
      404,
    );
  }

  return parentComment;
}

function getNotificationRecipient({
  userId,
  post,
  parentComment,
}) {
  /*
   * Pour une réponse, on notifie d'abord l'auteur
   * du commentaire parent.
   */
  if (
    parentComment &&
    parentComment.authorId !== userId
  ) {
    return {
      userId: parentComment.authorId,
      title: COMMENT_NOTIFICATION.REPLY_TITLE,
      message: COMMENT_NOTIFICATION.REPLY_MESSAGE,
    };
  }

  /*
   * Pour un commentaire principal, ou une réponse
   * à son propre commentaire, on notifie l'auteur
   * de la publication.
   */
  if (post.authorId !== userId) {
    return {
      userId: post.authorId,
      title: COMMENT_NOTIFICATION.POST_TITLE,
      message: COMMENT_NOTIFICATION.POST_MESSAGE,
    };
  }

  return null;
}

export async function createCommentService(
  userId,
  postId,
  payload,
) {
  const post = await getRequiredPost(postId);

  const parentComment = await getParentComment(
    payload.parentId,
    postId,
  );

  const comment = await createComment({
    postId,
    authorId: userId,
    parentId: parentComment?.id ?? null,
    content: payload.content,
  });

  const notificationRecipient =
    getNotificationRecipient({
      userId,
      post,
      parentComment,
    });

  /*
   * Aucune notification lorsque l'utilisateur
   * est lui-même le destinataire.
   */
  if (notificationRecipient) {
    await createNotification({
      userId: notificationRecipient.userId,
      actorId: userId,
      type: "COMMENT",
      title: notificationRecipient.title,
      message: notificationRecipient.message,
      data: {
        postId,
        commentId: comment.id,
        parentCommentId: parentComment?.id ?? null,
      },
    });
  }

  return toCommentResponse(comment);
}

export async function getCommentsByPostService(postId) {
  await getRequiredPost(postId);

  const comments = await findCommentsByPostId(postId);

  return toCommentListResponse(comments);
}

export async function updateCommentService(
  userId,
  commentId,
  payload,
) {
  const comment = await findCommentById(commentId);

  if (!comment || comment.deletedAt) {
    throw new AppError(
      COMMENT_MESSAGES.NOT_FOUND,
      404,
    );
  }

  if (comment.authorId !== userId) {
    throw new AppError(
      COMMENT_MESSAGES.FORBIDDEN,
      403,
    );
  }

  const updatedComment = await updateComment(
    commentId,
    {
      content: payload.content,
    },
  );

  return toCommentResponse(updatedComment);
}

export async function deleteCommentService(
  userId,
  commentId,
) {
  const comment = await findCommentById(commentId);

  if (!comment || comment.deletedAt) {
    throw new AppError(
      COMMENT_MESSAGES.NOT_FOUND,
      404,
    );
  }

  if (comment.authorId !== userId) {
    throw new AppError(
      COMMENT_MESSAGES.FORBIDDEN,
      403,
    );
  }

  await softDeleteComment(commentId);

  return null;
}