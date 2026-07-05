import { AppError } from "../../../core/errors/AppError.js";
import {
  createMedia,
  deleteMedia,
  findMediaById,
  findMediaByOwner,
} from "./media.repository.js";
import {
  toMediaListResponse,
  toMediaResponse,
} from "./media.mapper.js";
import { MEDIA_MESSAGES } from "./media.constants.js";

export async function createMediaService(userId, payload) {
  const media = await createMedia({
    ownerId: userId,
    filename: payload.filename,
    originalName: payload.originalName,
    mimeType: payload.mimeType,
    size: payload.size,
    url: payload.url,
    postId: payload.postId || null,
    conversationId: payload.conversationId || null,
  });

  return toMediaResponse(media);
}

export async function getUserMediaService(userId) {
  const mediaList = await findMediaByOwner(userId);

  return toMediaListResponse(mediaList);
}

export async function getMediaByIdService(userId, mediaId) {
  const media = await findMediaById(mediaId);

  if (!media) {
    throw new AppError(MEDIA_MESSAGES.NOT_FOUND, 404);
  }

  if (media.ownerId !== userId) {
    throw new AppError(MEDIA_MESSAGES.FORBIDDEN, 403);
  }

  return toMediaResponse(media);
}

export async function deleteMediaService(userId, mediaId) {
  const media = await findMediaById(mediaId);

  if (!media) {
    throw new AppError(MEDIA_MESSAGES.NOT_FOUND, 404);
  }

  if (media.ownerId !== userId) {
    throw new AppError(MEDIA_MESSAGES.FORBIDDEN, 403);
  }

  await deleteMedia(mediaId);

  return null;
}
