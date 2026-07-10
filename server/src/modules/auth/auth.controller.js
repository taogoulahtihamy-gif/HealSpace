import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { buildSessionContextFromRequest } from "../sessions/session.mapper.js";

import { AUTH_MESSAGES } from "./auth.constants.js";
import {
  getCurrentUser,
  loginUser,
  logoutAllUser,
  logoutUser,
  refreshSession,
  registerUser,
} from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(
    req.body,
    buildSessionContextFromRequest(req),
  );

  return ApiResponse.created(
    res,
    result,
    AUTH_MESSAGES.REGISTER_SUCCESS,
  );
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(
    req.body,
    buildSessionContextFromRequest(req),
  );

  return ApiResponse.success(res, result, AUTH_MESSAGES.LOGIN_SUCCESS);
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await refreshSession(
    req.body.refreshToken,
    buildSessionContextFromRequest(req),
  );

  return ApiResponse.success(
    res,
    result,
    AUTH_MESSAGES.REFRESH_SUCCESS,
  );
});

export const logout = asyncHandler(async (req, res) => {
  const result = await logoutUser(req.user.id, req.user.sessionId);

  return ApiResponse.success(res, result, AUTH_MESSAGES.LOGOUT_SUCCESS);
});

export const logoutAll = asyncHandler(async (req, res) => {
  const result = await logoutAllUser(req.user.id);

  return ApiResponse.success(
    res,
    result,
    AUTH_MESSAGES.LOGOUT_ALL_SUCCESS,
  );
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  return ApiResponse.success(res, user, AUTH_MESSAGES.PROFILE_SUCCESS);
});
