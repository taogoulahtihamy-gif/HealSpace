import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import {
  createCommentService,
  getCommentsByPostService,
  updateCommentService,
  deleteCommentService,
} from "./comment.service.js";
import { COMMENT_MESSAGES } from "./comment.constants.js";

export const createComment = asyncHandler(async (req, res) => {
  const result = await createCommentService(
    req.user.id,
    req.params.postId,
    req.body
  );

  return ApiResponse.created(
    res,
    result,
    COMMENT_MESSAGES.CREATED
  );
});

export const getCommentsByPost = asyncHandler(async (req, res) => {
  const result = await getCommentsByPostService(req.params.postId);

  return ApiResponse.success(
    res,
    result,
    COMMENT_MESSAGES.LIST_FETCHED
  );
});

export const updateComment = asyncHandler(async (req, res) => {
  const result = await updateCommentService(
    req.user.id,
    req.params.id,
    req.body
  );

  return ApiResponse.success(
    res,
    result,
    COMMENT_MESSAGES.UPDATED
  );
});

export const deleteComment = asyncHandler(async (req, res) => {
  await deleteCommentService(req.user.id, req.params.id);

  return ApiResponse.success(
    res,
    null,
    COMMENT_MESSAGES.DELETED
  );
});
