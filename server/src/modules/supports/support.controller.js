import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { SUPPORT_MESSAGES } from "./support.constants.js";
import * as supportService from "./support.service.js";

export const createSupportRequest = asyncHandler(async (req, res) => {
  const supportRequest = await supportService.createSupportRequest(
    req.user.id,
    req.body,
  );

  return ApiResponse.created(
    res,
    supportRequest,
    SUPPORT_MESSAGES.CREATED,
  );
});

export const listAvailableSupportRequests = asyncHandler(
  async (req, res) => {
    const result = await supportService.listAvailableSupportRequests(
      req.user.id,
      req.query,
    );

    return ApiResponse.success(res, result, SUPPORT_MESSAGES.LISTED);
  },
);

export const listMySupportRequests = asyncHandler(async (req, res) => {
  const result = await supportService.listMySupportRequests(
    req.user.id,
    req.query,
  );

  return ApiResponse.success(res, result, SUPPORT_MESSAGES.LISTED);
});

export const getSupportRequestById = asyncHandler(async (req, res) => {
  const supportRequest = await supportService.getSupportRequestById(
    req.user.id,
    req.params.supportRequestId,
  );

  return ApiResponse.success(
    res,
    supportRequest,
    SUPPORT_MESSAGES.RETRIEVED,
  );
});

export const acceptSupportRequest = asyncHandler(async (req, res) => {
  const supportRequest = await supportService.acceptSupportRequest(
    req.user.id,
    req.params.supportRequestId,
  );

  return ApiResponse.success(
    res,
    supportRequest,
    SUPPORT_MESSAGES.ACCEPTED,
  );
});

export const completeSupportRequest = asyncHandler(async (req, res) => {
  const supportRequest = await supportService.completeSupportRequest(
    req.user.id,
    req.params.supportRequestId,
  );

  return ApiResponse.success(
    res,
    supportRequest,
    SUPPORT_MESSAGES.COMPLETED,
  );
});

export const cancelSupportRequest = asyncHandler(async (req, res) => {
  const supportRequest = await supportService.cancelSupportRequest(
    req.user.id,
    req.params.supportRequestId,
  );

  return ApiResponse.success(
    res,
    supportRequest,
    SUPPORT_MESSAGES.CANCELLED,
  );
});
