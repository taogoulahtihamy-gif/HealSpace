import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import {
  createMediaService,
  deleteMediaService,
  getMediaByIdService,
  getUserMediaService,
} from "./media.service.js";
import { MEDIA_MESSAGES } from "./media.constants.js";

export const createMedia = asyncHandler(async (req, res) => {
  const result = await createMediaService(req.user.id, req.body);

  return ApiResponse.created(
    res,
    result,
    MEDIA_MESSAGES.CREATED
  );
});

export const getUserMedia = asyncHandler(async (req, res) => {
  const result = await getUserMediaService(req.user.id);

  return ApiResponse.success(
    res,
    result,
    MEDIA_MESSAGES.LIST_FETCHED
  );
});

export const getMediaById = asyncHandler(async (req, res) => {
  const result = await getMediaByIdService(req.user.id, req.params.id);

  return ApiResponse.success(
    res,
    result,
    MEDIA_MESSAGES.FETCHED
  );
});

export const deleteMedia = asyncHandler(async (req, res) => {
  await deleteMediaService(req.user.id, req.params.id);

  return ApiResponse.success(
    res,
    null,
    MEDIA_MESSAGES.DELETED
  );
});
