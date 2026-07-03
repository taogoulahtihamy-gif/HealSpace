import { AppError } from "../../../core/errors/AppError.js";
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
import { REACTION_MESSAGES } from "./reaction.constants.js";

async function ensurePostExists(postId) {
  const post = await findPostById(postId);

  if (!post || post.deletedAt) {
    throw new AppError(REACTION_MESSAGES.POST_NOT_FOUND, 404);
  }

  return post;
}

export async function reactToPostService(userId, postId, payload) {
  await ensurePostExists(postId);

  const reaction = await upsertReaction({
    userId,
    postId,
    type: payload.type,
  });

  return toReactionResponse(reaction);
}

export async function getPostReactionsService(postId) {
  await ensurePostExists(postId);

  const reactions = await findReactionsByPostId(postId);

  return toReactionListResponse(reactions);
}

export async function getPostReactionSummaryService(postId) {
  await ensurePostExists(postId);

  const reactions = await findReactionsByPostId(postId);

  return toReactionSummaryResponse(reactions);
}

export async function removeReactionService(userId, postId) {
  await ensurePostExists(postId);

  const reaction = await findReactionByUserAndPost(userId, postId);

  if (!reaction) {
    throw new AppError(REACTION_MESSAGES.NOT_FOUND, 404);
  }

  await deleteReactionByUserAndPost(userId, postId);

  return null;
}
