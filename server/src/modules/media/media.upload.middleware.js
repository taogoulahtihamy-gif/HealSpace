import multer from "multer";
import { AppError } from "../../../core/errors/AppError.js";
import {
  ALLOWED_MEDIA_TYPES,
  MAX_MEDIA_SIZE,
  MEDIA_MESSAGES,
  MEDIA_UPLOAD_FIELD,
} from "./media.constants.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_MEDIA_SIZE,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_MEDIA_TYPES.includes(file.mimetype)) {
      callback(new AppError(MEDIA_MESSAGES.INVALID_TYPE, 415));
      return;
    }

    callback(null, true);
  },
});

export function uploadSingleMedia(req, res, next) {
  upload.single(MEDIA_UPLOAD_FIELD)(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (
      error instanceof multer.MulterError &&
      error.code === "LIMIT_FILE_SIZE"
    ) {
      next(new AppError(MEDIA_MESSAGES.FILE_TOO_LARGE, 413));
      return;
    }

    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError(MEDIA_MESSAGES.UPLOAD_FAILED, 400));
  });
}
