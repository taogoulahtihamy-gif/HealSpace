import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import {
  reactToPostService,
  getPostReactionsService,
  getPostReactionSummaryService,
  removeReactionService,
} from "./reaction.service.js";
import { REACTION_MESSAGES } from "./reaction.constants.js";

export const reactToPost = asyncHandler(async (req, res) => {
  const result = await reactToPostService(
    req.user.id,
    req.params.postId,
    req.body
  );

  return ApiResponse.success(
    res,
    result,
    REACTION_MESSAGES.CREATED
  );
});

export const getPostReactions = asyncHandler(async (req, res) => {
  const result = await getPostReactionsService(req.params.postId);

  return ApiResponse.success(
    res,
    result,
    REACTION_MESSAGES.LIST_FETCHED
  );
});

export const getPostReactionSummary = asyncHandler(async (req, res) => {
  const result = await getPostReactionSummaryService(req.params.postId);

  return ApiResponse.success(
    res,
    result,
    REACTION_MESSAGES.SUMMARY_FETCHED
  );
});

export const removeReaction = asyncHandler(async (req, res) => {
  await removeReactionService(req.user.id, req.params.postId);

  return ApiResponse.success(
    res,
    null,
    REACTION_MESSAGES.DELETED
  );
});
