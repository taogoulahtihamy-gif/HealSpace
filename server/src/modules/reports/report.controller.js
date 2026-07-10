import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { REPORT_MESSAGES } from "./report.constants.js";
import * as reportService from "./report.service.js";

export const createReport = asyncHandler(async (req, res) => {
  const report = await reportService.createReport(
    req.user.id,
    req.body,
  );

  return ApiResponse.created(res, report, REPORT_MESSAGES.CREATED);
});

export const listMyReports = asyncHandler(async (req, res) => {
  const result = await reportService.listMyReports(
    req.user.id,
    req.query,
  );

  return ApiResponse.success(res, result, REPORT_MESSAGES.LISTED);
});

export const getMyReportById = asyncHandler(async (req, res) => {
  const report = await reportService.getMyReportById(
    req.user.id,
    req.params.reportId,
  );

  return ApiResponse.success(res, report, REPORT_MESSAGES.RETRIEVED);
});
