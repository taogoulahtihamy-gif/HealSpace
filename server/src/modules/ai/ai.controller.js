import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import {
  analyzeMoodService,
  generateSupportMessageService,
} from "./ai.service.js";
import { AI_MESSAGES } from "./ai.constants.js";

export const analyzeMood = asyncHandler(async (req, res) => {
  const result = await analyzeMoodService(req.user.id, req.body);

  return ApiResponse.success(res, result, AI_MESSAGES.MOOD_ANALYZED);
});

export const generateSupportMessage = asyncHandler(async (req, res) => {
  const result = await generateSupportMessageService(
    req.user.id,
    req.body,
  );

  return ApiResponse.success(
    res,
    result,
    AI_MESSAGES.SUPPORT_GENERATED,
  );
});
