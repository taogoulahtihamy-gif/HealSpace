import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import { ApiResponse } from "../../../core/responses/ApiResponse.js";

import { PASSWORD_RESET_MESSAGES } from "./password-reset.constants.js";
import {
  requestPasswordResetService,
  resetPasswordService,
} from "./password-reset.service.js";

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await requestPasswordResetService(req.body.email);

  return ApiResponse.success(
    res,
    result,
    PASSWORD_RESET_MESSAGES.REQUEST_ACCEPTED,
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await resetPasswordService(req.body);

  return ApiResponse.success(
    res,
    result,
    PASSWORD_RESET_MESSAGES.RESET_SUCCESS,
  );
});
