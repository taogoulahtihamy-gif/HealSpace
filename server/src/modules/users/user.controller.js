import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { USER_MESSAGES } from "./user.constants.js";
import * as userService from "./user.service.js";

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getMyProfile(req.user.id);

  return ApiResponse.success(
    res,
    profile,
    USER_MESSAGES.PROFILE_FETCHED,
  );
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getPublicProfile(
    req.user.id,
    req.params.userId,
  );

  return ApiResponse.success(
    res,
    profile,
    USER_MESSAGES.PUBLIC_PROFILE_FETCHED,
  );
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await userService.updateMyProfile(
    req.user.id,
    req.body,
  );

  return ApiResponse.success(
    res,
    profile,
    USER_MESSAGES.PROFILE_UPDATED,
  );
});

export const updatePrivacy = asyncHandler(async (req, res) => {
  const profile = await userService.updatePrivacy(
    req.user.id,
    req.body,
  );

  return ApiResponse.success(
    res,
    profile,
    USER_MESSAGES.PRIVACY_UPDATED,
  );
});

export const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user.id, req.body);

  return ApiResponse.success(
    res,
    null,
    USER_MESSAGES.PASSWORD_UPDATED,
  );
});

export const deactivateAccount = asyncHandler(async (req, res) => {
  await userService.deactivateAccount(
    req.user.id,
    req.body.password,
  );

  return ApiResponse.success(
    res,
    null,
    USER_MESSAGES.ACCOUNT_DEACTIVATED,
  );
});
