import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { MODERATION_MESSAGES } from "./moderation.constants.js";
import * as moderationService from "./moderation.service.js";

export const listReports = asyncHandler(
  async (req, res) => {
    const result =
      await moderationService.listReports(
        req.user,
        req.query,
      );

    return ApiResponse.success(
      res,
      result,
      MODERATION_MESSAGES.REPORTS_LISTED,
    );
  },
);

export const getReport = asyncHandler(
  async (req, res) => {
    const report =
      await moderationService.getReport(
        req.user,
        req.params.reportId,
      );

    return ApiResponse.success(
      res,
      report,
      MODERATION_MESSAGES.REPORT_RETRIEVED,
    );
  },
);

export const startReview = asyncHandler(
  async (req, res) => {
    const report =
      await moderationService.startReview(
        req.user,
        req.params.reportId,
      );

    return ApiResponse.success(
      res,
      report,
      MODERATION_MESSAGES.REPORT_REVIEW_STARTED,
    );
  },
);

export const resolveReport = asyncHandler(
  async (req, res) => {
    const report =
      await moderationService.resolveReport(
        req.user,
        req.params.reportId,
        req.body.resolutionNote,
      );

    return ApiResponse.success(
      res,
      report,
      MODERATION_MESSAGES.REPORT_RESOLVED,
    );
  },
);

export const rejectReport = asyncHandler(
  async (req, res) => {
    const report =
      await moderationService.rejectReport(
        req.user,
        req.params.reportId,
        req.body.resolutionNote,
      );

    return ApiResponse.success(
      res,
      report,
      MODERATION_MESSAGES.REPORT_REJECTED,
    );
  },
);

export const updateUserStatus = asyncHandler(
  async (req, res) => {
    const user =
      await moderationService.updateUserStatus(
        req.user,
        req.params.userId,
        req.body.status,
        req.body.note,
      );

    return ApiResponse.success(
      res,
      user,
      MODERATION_MESSAGES.USER_STATUS_UPDATED,
    );
  },
);
