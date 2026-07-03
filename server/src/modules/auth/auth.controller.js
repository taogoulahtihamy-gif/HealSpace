import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import {
  getCurrentUser,
  loginUser,
  refreshSession,
  registerUser,
  logoutUser,
} from "./auth.service.js";
import { AUTH_MESSAGES } from "./auth.constants.js";

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);

  return ApiResponse.created(
    res,
    result,
    AUTH_MESSAGES.REGISTER_SUCCESS
  );
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  return ApiResponse.success(
    res,
    result,
    AUTH_MESSAGES.LOGIN_SUCCESS
  );
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await refreshSession(req.body.refreshToken);

  return ApiResponse.success(
    res,
    result,
    "Session renouvelée avec succès."
  );
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.body.refreshToken);

  return ApiResponse.success(
    res,
    null,
    "Déconnexion réussie."
  );
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  return ApiResponse.success(
    res,
    user,
    AUTH_MESSAGES.PROFILE_SUCCESS
  );
});