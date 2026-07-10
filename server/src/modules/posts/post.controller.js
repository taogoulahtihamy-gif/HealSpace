import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import {
  createPostService,
  getPostsService,
  getPostByIdService,
  updatePostService,
  deletePostService,
} from "./post.service.js";
import { POST_MESSAGES } from "./post.constants.js";

export const createPost = asyncHandler(async (req, res) => {
  const result = await createPostService(req.user.id, req.body);

  return ApiResponse.created(res, result, POST_MESSAGES.CREATED);
});

export const getPosts = asyncHandler(async (req, res) => {
  const result = await getPostsService();

  return ApiResponse.success(res, result, POST_MESSAGES.LIST_FETCHED);
});

export const getPostById = asyncHandler(async (req, res) => {
  const result = await getPostByIdService(req.params.id);

  return ApiResponse.success(res, result, POST_MESSAGES.FETCHED);
});

export const updatePost = asyncHandler(async (req, res) => {
  const result = await updatePostService(
    req.user.id,
    req.params.id,
    req.body,
  );

  return ApiResponse.success(res, result, POST_MESSAGES.UPDATED);
});

export const deletePost = asyncHandler(async (req, res) => {
  await deletePostService(req.user.id, req.params.id);

  return ApiResponse.success(res, null, POST_MESSAGES.DELETED);
});
