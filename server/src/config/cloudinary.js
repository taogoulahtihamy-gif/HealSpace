import { v2 as cloudinary } from "cloudinary";

import { AppError } from "../../core/errors/AppError.js";
import { env } from "./env.js";

let configured = false;

function getRequiredCloudinaryEnvironment() {
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(
      "La configuration Cloudinary est incomplète.",
      500,
    );
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  };
}

export function getCloudinaryClient() {
  if (!configured) {
    const { cloudName, apiKey, apiSecret } =
      getRequiredCloudinaryEnvironment();

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    configured = true;
  }

  return cloudinary;
}
