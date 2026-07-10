import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import { ApiResponse } from "../../../core/responses/ApiResponse.js";

import { EMAIL_VERIFICATION_MESSAGES } from "./email-verification.constants.js";
import {
  requestEmailVerificationService,
  verifyEmailService,
} from "./email-verification.service.js";

export const sendEmailVerification = asyncHandler(async (req, res) => {
  const result = await requestEmailVerificationService(req.user.id);

  return ApiResponse.success(
    res,
    result,
    EMAIL_VERIFICATION_MESSAGES.REQUEST_ACCEPTED,
  );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await verifyEmailService(req.body);

  return ApiResponse.success(
    res,
    result,
    EMAIL_VERIFICATION_MESSAGES.VERIFY_SUCCESS,
  );
});
