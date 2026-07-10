import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import { ApiResponse } from "../../../core/responses/ApiResponse.js";

import { SESSION_MESSAGES } from "./session.constants.js";
import {
  getSessionsService,
  revokeOtherSessionsService,
  revokeSessionService,
} from "./session.service.js";

export const getSessions = asyncHandler(async (req, res) => {
  const result = await getSessionsService(
    req.user.id,
    req.user.sessionId,
  );

  return ApiResponse.success(
    res,
    result,
    SESSION_MESSAGES.SESSIONS_RETRIEVED,
  );
});

export const revokeSession = asyncHandler(async (req, res) => {
  const result = await revokeSessionService(
    req.user.id,
    req.params.sessionId,
    req.user.sessionId,
  );

  return ApiResponse.success(
    res,
    result,
    SESSION_MESSAGES.SESSION_REVOKED,
  );
});

export const revokeOtherSessions = asyncHandler(async (req, res) => {
  const result = await revokeOtherSessionsService(
    req.user.id,
    req.user.sessionId,
  );

  return ApiResponse.success(
    res,
    result,
    SESSION_MESSAGES.OTHER_SESSIONS_REVOKED,
  );
});
