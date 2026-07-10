import { getCloudinaryClient } from "../../config/cloudinary.js";
import { env } from "../../config/env.js";
import { AppError } from "../../../core/errors/AppError.js";
import {
  CLOUDINARY_DELETE_RESULTS,
  CLOUDINARY_RESOURCE_TYPES,
  DEFAULT_CLOUDINARY_FOLDER,
  MEDIA_MESSAGES,
} from "./media.constants.js";

function getCloudinaryFolder(ownerId) {
  const baseFolder =
    env.CLOUDINARY_MEDIA_FOLDER?.trim() || DEFAULT_CLOUDINARY_FOLDER;

  const normalizedFolder = baseFolder
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  return `${normalizedFolder}/${ownerId}`;
}

export function getCloudinaryResourceType(mediaType) {
  return (
    CLOUDINARY_RESOURCE_TYPES[mediaType] ??
    CLOUDINARY_RESOURCE_TYPES.FILE
  );
}

export function uploadBufferToCloudinary({
  buffer,
  ownerId,
  mediaType,
  originalName,
}) {
  if (!buffer) {
    throw new AppError(MEDIA_MESSAGES.FILE_REQUIRED, 400);
  }

  if (!ownerId) {
    throw new AppError(MEDIA_MESSAGES.UPLOAD_FAILED, 400);
  }

  const cloudinary = getCloudinaryClient();

  const resourceType = getCloudinaryResourceType(mediaType);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: getCloudinaryFolder(ownerId),
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        filename_override: originalName || "healspace-media",
        tags: ["healspace", `healspace_${mediaType.toLowerCase()}`],
      },
      (error, result) => {
        if (error || !result) {
          reject(new AppError(MEDIA_MESSAGES.UPLOAD_FAILED, 502));

          return;
        }

        resolve(result);
      },
    );

    uploadStream.on("error", () => {
      reject(new AppError(MEDIA_MESSAGES.UPLOAD_FAILED, 502));
    });

    uploadStream.end(buffer);
  });
}

export async function deleteCloudinaryAsset({ publicId, mediaType }) {
  if (!publicId) {
    return null;
  }

  const cloudinary = getCloudinaryClient();

  const resourceType = getCloudinaryResourceType(mediaType);

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    if (!CLOUDINARY_DELETE_RESULTS.includes(result?.result)) {
      throw new AppError(MEDIA_MESSAGES.CLOUD_DELETE_FAILED, 502);
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(MEDIA_MESSAGES.CLOUD_DELETE_FAILED, 502);
  }
}

export function isCloudinaryMediaUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const parsedUrl = new URL(url);

    return (
      parsedUrl.protocol === "https:" &&
      parsedUrl.hostname === "res.cloudinary.com"
    );
  } catch {
    return false;
  }
}
