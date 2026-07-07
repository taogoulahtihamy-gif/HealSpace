import { AppError } from "../../../core/errors/AppError.js";
import {
  mapReport,
  mapReportList,
} from "./report.mapper.js";
import * as reportRepository from "./report.repository.js";
import { listMyReportsQuerySchema } from "./report.validator.js";
import {
  REPORT_LIMITS,
  REPORT_MESSAGES,
  REPORT_STATUSES,
  REPORT_TARGET_TYPES,
} from "./report.constants.js";

function parseOrThrow(schema, input) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const message =
      result.error.issues?.[0]?.message ||
      REPORT_MESSAGES.INVALID_FILTERS;

    throw new AppError(message, 400);
  }

  return result.data;
}

function normalizePagination(query = {}) {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);

  const page =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : REPORT_LIMITS.DEFAULT_PAGE;

  const requestedLimit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : REPORT_LIMITS.DEFAULT_LIMIT;

  const limit = Math.min(
    requestedLimit,
    REPORT_LIMITS.MAX_LIMIT,
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function createPaginatedResult(items, total, page, limit) {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function targetExists({
  reporterId,
  targetType,
  targetId,
}) {
  switch (targetType) {
    case REPORT_TARGET_TYPES.USER:
      if (targetId === reporterId) {
        throw new AppError(
          REPORT_MESSAGES.SELF_REPORT_FORBIDDEN,
          400,
        );
      }

      return reportRepository.findReportableUserById(
        targetId,
      );

    case REPORT_TARGET_TYPES.POST:
      return reportRepository.findReportablePostById(
        targetId,
      );

    case REPORT_TARGET_TYPES.COMMENT:
      return reportRepository.findReportableCommentById(
        targetId,
      );

    case REPORT_TARGET_TYPES.MESSAGE:
      return reportRepository.findReportableMessageById(
        targetId,
        reporterId,
      );

    case REPORT_TARGET_TYPES.GROUP:
      return reportRepository.findReportableGroupById(
        targetId,
        reporterId,
      );

    default:
      return null;
  }
}

async function ensureTargetExists(input) {
  const target = await targetExists(input);

  if (!target) {
    throw new AppError(
      REPORT_MESSAGES.TARGET_NOT_FOUND,
      404,
    );
  }

  return target;
}

export async function createReport(reporterId, input) {
  await ensureTargetExists({
    reporterId,
    targetType: input.targetType,
    targetId: input.targetId,
  });

  const existingReport =
    await reportRepository.findActiveReport({
      reporterId,
      targetType: input.targetType,
      targetId: input.targetId,
    });

  if (existingReport) {
    throw new AppError(
      REPORT_MESSAGES.DUPLICATE_ACTIVE_REPORT,
      409,
    );
  }

  const report = await reportRepository.createReport({
    reporterId,
    reviewerId: null,
    targetType: input.targetType,
    targetId: input.targetId,
    reason: input.reason,
    description: input.description ?? null,
    status: REPORT_STATUSES.PENDING,
    resolutionNote: null,
    reviewedAt: null,
  });

  return mapReport(report);
}

export async function listMyReports(
  reporterId,
  query = {},
) {
  const filters = parseOrThrow(
    listMyReportsQuerySchema,
    query,
  );

  const { page, limit, skip } =
    normalizePagination(filters);

  const { items, total } =
    await reportRepository.listReportsByReporter({
      reporterId,
      skip,
      take: limit,
      status: filters.status,
      targetType: filters.targetType,
      reason: filters.reason,
    });

  return createPaginatedResult(
    mapReportList(items),
    total,
    page,
    limit,
  );
}

export async function getMyReportById(
  reporterId,
  reportId,
) {
  const report =
    await reportRepository.findReportByIdForReporter(
      reportId,
      reporterId,
    );

  if (!report) {
    throw new AppError(
      REPORT_MESSAGES.NOT_FOUND,
      404,
    );
  }

  return mapReport(report);
}
