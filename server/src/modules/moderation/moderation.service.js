import { AppError } from "../../../core/errors/AppError.js";
import {
  mapModeratedUser,
  mapModerationReport,
  mapModerationReportList,
} from "./moderation.mapper.js";
import * as moderationRepository from "./moderation.repository.js";
import { listModerationReportsQuerySchema } from "./moderation.validator.js";
import {
  MODERATION_ACTION_TYPES,
  MODERATION_ALLOWED_ROLES,
  MODERATION_LIMITS,
  MODERATION_MESSAGES,
} from "./moderation.constants.js";

function assertModerator(actor) {
  const allowedRoles = Object.values(MODERATION_ALLOWED_ROLES);

  if (!actor || !allowedRoles.includes(actor.role)) {
    throw new AppError(MODERATION_MESSAGES.FORBIDDEN, 403);
  }
}

function parseOrThrow(schema, input) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const message =
      result.error.issues?.[0]?.message ||
      MODERATION_MESSAGES.INVALID_FILTERS;

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
      : MODERATION_LIMITS.DEFAULT_PAGE;

  const requestedLimit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : MODERATION_LIMITS.DEFAULT_LIMIT;

  const limit = Math.min(requestedLimit, MODERATION_LIMITS.MAX_LIMIT);

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

async function getRequiredReport(reportId) {
  const report =
    await moderationRepository.findModerationReportById(reportId);

  if (!report) {
    throw new AppError(MODERATION_MESSAGES.REPORT_NOT_FOUND, 404);
  }

  return report;
}

function ensureReportCanBeClosed(report, actor) {
  if (["RESOLVED", "REJECTED"].includes(report.status)) {
    throw new AppError(MODERATION_MESSAGES.REPORT_ALREADY_CLOSED, 409);
  }

  if (
    report.status === "UNDER_REVIEW" &&
    report.reviewerId !== actor.id &&
    actor.role !== MODERATION_ALLOWED_ROLES.ADMIN
  ) {
    throw new AppError(
      MODERATION_MESSAGES.REPORT_ALREADY_ASSIGNED,
      409,
    );
  }
}

export async function listReports(actor, query = {}) {
  assertModerator(actor);

  const filters = parseOrThrow(listModerationReportsQuerySchema, query);

  const { page, limit, skip } = normalizePagination(filters);

  const { items, total } =
    await moderationRepository.listModerationReports({
      skip,
      take: limit,
      status: filters.status,
      targetType: filters.targetType,
      reason: filters.reason,
      reviewerId: filters.reviewerId,
    });

  return createPaginatedResult(
    mapModerationReportList(items),
    total,
    page,
    limit,
  );
}

export async function getReport(actor, reportId) {
  assertModerator(actor);

  const report = await getRequiredReport(reportId);

  return mapModerationReport(report);
}

export async function startReview(actor, reportId) {
  assertModerator(actor);

  const report = await getRequiredReport(reportId);

  if (["RESOLVED", "REJECTED"].includes(report.status)) {
    throw new AppError(MODERATION_MESSAGES.REPORT_ALREADY_CLOSED, 409);
  }

  if (report.status === "UNDER_REVIEW") {
    if (
      report.reviewerId === actor.id ||
      actor.role === MODERATION_ALLOWED_ROLES.ADMIN
    ) {
      return mapModerationReport(report);
    }

    throw new AppError(
      MODERATION_MESSAGES.REPORT_ALREADY_ASSIGNED,
      409,
    );
  }

  const reviewedReport = await moderationRepository.startReportReview({
    reportId,
    moderatorId: actor.id,
  });

  if (!reviewedReport) {
    throw new AppError(
      MODERATION_MESSAGES.REPORT_ALREADY_ASSIGNED,
      409,
    );
  }

  return mapModerationReport(reviewedReport);
}

export async function resolveReport(actor, reportId, resolutionNote) {
  assertModerator(actor);

  const report = await getRequiredReport(reportId);

  ensureReportCanBeClosed(report, actor);

  const resolvedReport = await moderationRepository.closeReport({
    reportId,
    moderatorId: actor.id,
    status: "RESOLVED",
    resolutionNote,
    action: MODERATION_ACTION_TYPES.REPORT_RESOLVED,
    allowReviewerOverride:
      actor.role === MODERATION_ALLOWED_ROLES.ADMIN,
  });

  if (!resolvedReport) {
    throw new AppError(
      MODERATION_MESSAGES.REPORT_ALREADY_ASSIGNED,
      409,
    );
  }

  return mapModerationReport(resolvedReport);
}

export async function rejectReport(actor, reportId, resolutionNote) {
  assertModerator(actor);

  const report = await getRequiredReport(reportId);

  ensureReportCanBeClosed(report, actor);

  const rejectedReport = await moderationRepository.closeReport({
    reportId,
    moderatorId: actor.id,
    status: "REJECTED",
    resolutionNote,
    action: MODERATION_ACTION_TYPES.REPORT_REJECTED,
    allowReviewerOverride:
      actor.role === MODERATION_ALLOWED_ROLES.ADMIN,
  });

  if (!rejectedReport) {
    throw new AppError(
      MODERATION_MESSAGES.REPORT_ALREADY_ASSIGNED,
      409,
    );
  }

  return mapModerationReport(rejectedReport);
}

export async function updateUserStatus(
  actor,
  targetUserId,
  status,
  note,
) {
  assertModerator(actor);

  if (actor.id === targetUserId) {
    throw new AppError(MODERATION_MESSAGES.CANNOT_MODERATE_SELF, 400);
  }

  const targetUser =
    await moderationRepository.findUserForModeration(targetUserId);

  if (!targetUser) {
    throw new AppError(MODERATION_MESSAGES.USER_NOT_FOUND, 404);
  }

  if (
    actor.role === MODERATION_ALLOWED_ROLES.MODERATOR &&
    [
      MODERATION_ALLOWED_ROLES.MODERATOR,
      MODERATION_ALLOWED_ROLES.ADMIN,
    ].includes(targetUser.role)
  ) {
    throw new AppError(
      MODERATION_MESSAGES.MODERATOR_CANNOT_MODERATE_PRIVILEGED_USER,
      403,
    );
  }

  const updatedUser = await moderationRepository.updateUserStatus({
    moderatorId: actor.id,
    targetUserId,
    status,
    note,
    previousStatus: targetUser.status,
  });

  return mapModeratedUser(updatedUser);
}
