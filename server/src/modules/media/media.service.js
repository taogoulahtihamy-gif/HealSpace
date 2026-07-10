import { AppError } from "../../../core/errors/AppError.js";
import {
  createMedia,
  deleteMedia,
  findMediaById,
  findMediaByOwner,
  findPostById,
} from "./media.repository.js";
import {
  toMediaListResponse,
  toMediaResponse,
} from "./media.mapper.js";
import { MEDIA_MESSAGES, MEDIA_TYPES } from "./media.constants.js";
import {
  deleteCloudinaryAsset,
  isCloudinaryMediaUrl,
  uploadBufferToCloudinary,
} from "./media.cloudinary.js";

export function detectMediaType(mimeType) {
  if (mimeType.startsWith("image/")) {
    return MEDIA_TYPES.IMAGE;
  }

  if (mimeType.startsWith("video/")) {
    return MEDIA_TYPES.VIDEO;
  }

  if (mimeType.startsWith("audio/")) {
    return MEDIA_TYPES.AUDIO;
  }

  return MEDIA_TYPES.FILE;
}

async function ensureOwnedPost(userId, postId) {
  if (!postId) {
    return null;
  }

  const post = await findPostById(postId);

  if (!post || post.deletedAt) {
    throw new AppError(MEDIA_MESSAGES.POST_NOT_FOUND, 404);
  }

  if (post.authorId !== userId) {
    throw new AppError(MEDIA_MESSAGES.POST_FORBIDDEN, 403);
  }

  return post;
}

export async function createMediaService(userId, payload) {
  await ensureOwnedPost(userId, payload.postId);

  const media = await createMedia({
    ownerId: userId,
    postId: payload.postId ?? null,
    publicId: payload.publicId ?? payload.filename,
    type: payload.type ?? detectMediaType(payload.mimeType),
    url: payload.url,
    mimeType: payload.mimeType,
    size: payload.size,
  });

  return toMediaResponse(media);
}

export async function uploadMediaService({ userId, file, postId }) {
  if (!file?.buffer) {
    throw new AppError(MEDIA_MESSAGES.FILE_REQUIRED, 400);
  }

  await ensureOwnedPost(userId, postId);

  const mediaType = detectMediaType(file.mimetype);

  const uploadedAsset = await uploadBufferToCloudinary({
    buffer: file.buffer,
    ownerId: userId,
    mediaType,
    originalName: file.originalname,
  });

  try {
    const media = await createMedia({
      ownerId: userId,
      postId: postId ?? null,
      publicId: uploadedAsset.public_id,
      type: mediaType,
      url: uploadedAsset.secure_url,
      mimeType: file.mimetype,
      size: uploadedAsset.bytes ?? file.size,
    });

    return toMediaResponse(media);
  } catch (error) {
    try {
      await deleteCloudinaryAsset({
        publicId: uploadedAsset.public_id,
        mediaType,
      });
    } catch {
      // L'erreur Prisma originale reste prioritaire.
    }

    throw error;
  }
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

  if (media.publicId && isCloudinaryMediaUrl(media.url)) {
    await deleteCloudinaryAsset({
      publicId: media.publicId,
      mediaType: media.type,
    });
  }

  await deleteMedia(mediaId);

  return null;
}
