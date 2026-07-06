import { AppError } from "../../../core/errors/AppError.js";
import { createNotification } from "../notifications/notification.service.js";

import {
  findPostById,
  upsertReaction,
  findReactionByUserAndPost,
  findReactionsByPostId,
  deleteReactionByUserAndPost,
} from "./reaction.repository.js";

import {
  toReactionResponse,
  toReactionListResponse,
  toReactionSummaryResponse,
} from "./reaction.mapper.js";

import {
  REACTION_MESSAGES,
  REACTION_NOTIFICATION,
} from "./reaction.constants.js";

async function ensurePostExists(postId) {
  const post = await findPostById(postId);

  if (!post || post.deletedAt) {
    throw new AppError(
      REACTION_MESSAGES.POST_NOT_FOUND,
      404,
    );
  }

  return post;
}

export async function reactToPostService(
  userId,
  postId,
  payload,
) {
  const post = await ensurePostExists(postId);

  /*
   * On vérifie si une réaction existe déjà avant l'upsert.
   * Une modification de réaction ne doit pas créer une nouvelle
   * notification à chaque changement de type.
   */
  const existingReaction =
    await findReactionByUserAndPost(userId, postId);

  const reaction = await upsertReaction({
    userId,
    postId,
    type: payload.type,
  });

  /*
   * Notification uniquement lors de la première réaction.
   * Aucune notification lorsque l'auteur réagit à son propre post.
   */
  if (
    !existingReaction &&
    post.authorId !== userId
  ) {
    await createNotification({
      userId: post.authorId,
      actorId: userId,
      type: "REACTION",
      title: REACTION_NOTIFICATION.TITLE,
      message: REACTION_NOTIFICATION.MESSAGE,
      data: {
        postId: post.id,
        reactionId: reaction.id,
        reactionType: reaction.type,
      },
    });
  }

  return toReactionResponse(reaction);
}

export async function getPostReactionsService(postId) {
  await ensurePostExists(postId);

  const reactions =
    await findReactionsByPostId(postId);

  return toReactionListResponse(reactions);
}

export async function getPostReactionSummaryService(
  postId,
) {
  await ensurePostExists(postId);

  const reactions =
    await findReactionsByPostId(postId);

  return toReactionSummaryResponse(reactions);
}

export async function removeReactionService(
  userId,
  postId,
) {
  await ensurePostExists(postId);

  const reaction =
    await findReactionByUserAndPost(userId, postId);

  if (!reaction) {
    throw new AppError(
      REACTION_MESSAGES.NOT_FOUND,
      404,
    );
  }

  await deleteReactionByUserAndPost(
    userId,
    postId,
  );

  return null;
}