import { AppError } from "../../../core/errors/AppError.js";
import {
  mapAdminActionList,
  mapAdminGroup,
  mapAdminGroupList,
  mapAdminPost,
  mapAdminPostList,
  mapAdminReportList,
  mapAdminUser,
  mapAdminUserList,
} from "./administration.mapper.js";
import * as administrationRepository from "./administration.repository.js";
import {
  listAdminActionsQuerySchema,
  listAdminGroupsQuerySchema,
  listAdminPostsQuerySchema,
  listAdminReportsQuerySchema,
  listAdminUsersQuerySchema,
} from "./administration.validator.js";
import {
  ADMIN_ALLOWED_ROLE,
  ADMIN_LIMITS,
  ADMIN_MESSAGES,
} from "./administration.constants.js";

function assertAdministrator(actor) {
  if (!actor || actor.role !== ADMIN_ALLOWED_ROLE) {
    throw new AppError(ADMIN_MESSAGES.FORBIDDEN, 403);
  }
}

function parseOrThrow(schema, input) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const message =
      result.error.issues?.[0]?.message ||
      ADMIN_MESSAGES.INVALID_FILTERS;

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
      : ADMIN_LIMITS.DEFAULT_PAGE;

  const requestedLimit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : ADMIN_LIMITS.DEFAULT_LIMIT;

  const limit = Math.min(requestedLimit, ADMIN_LIMITS.MAX_LIMIT);

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

async function getRequiredUser(userId) {
  const user = await administrationRepository.findAdminUserById(userId);

  if (!user) {
    throw new AppError(ADMIN_MESSAGES.USER_NOT_FOUND, 404);
  }

  return user;
}

async function ensureAnotherActiveAdminRemains(user) {
  if (user.role !== "ADMIN" || user.status !== "ACTIVE") {
    return;
  }

  const otherActiveAdmins =
    await administrationRepository.countOtherActiveAdmins(user.id);

  if (otherActiveAdmins === 0) {
    throw new AppError(ADMIN_MESSAGES.LAST_ACTIVE_ADMIN, 409);
  }
}

export async function getStatistics(actor) {
  assertAdministrator(actor);

  return administrationRepository.getAdminStatistics();
}

export async function listUsers(actor, query = {}) {
  assertAdministrator(actor);

  const filters = parseOrThrow(listAdminUsersQuerySchema, query);

  const { page, limit, skip } = normalizePagination(filters);

  const { items, total } =
    await administrationRepository.listAdminUsers({
      skip,
      take: limit,
      search: filters.search,
      role: filters.role,
      status: filters.status,
    });

  return createPaginatedResult(
    mapAdminUserList(items),
    total,
    page,
    limit,
  );
}

export async function getUser(actor, userId) {
  assertAdministrator(actor);

  const user = await getRequiredUser(userId);

  return mapAdminUser(user);
}

export async function updateUserRole(actor, userId, role, note) {
  assertAdministrator(actor);

  if (actor.id === userId) {
    throw new AppError(ADMIN_MESSAGES.CANNOT_MODIFY_SELF, 400);
  }

  const user = await getRequiredUser(userId);

  if (user.role === role) {
    return mapAdminUser(user);
  }

  if (user.role === "ADMIN" && role !== "ADMIN") {
    await ensureAnotherActiveAdminRemains(user);
  }

  const updatedUser =
    await administrationRepository.updateAdminUserRole({
      administratorId: actor.id,
      targetUserId: userId,
      role,
      note,
      previousRole: user.role,
    });

  return mapAdminUser(updatedUser);
}

export async function updateUserStatus(actor, userId, status, note) {
  assertAdministrator(actor);

  if (actor.id === userId) {
    throw new AppError(ADMIN_MESSAGES.CANNOT_MODIFY_SELF, 400);
  }

  const user = await getRequiredUser(userId);

  if (user.status === status) {
    return mapAdminUser(user);
  }

  if (
    user.role === "ADMIN" &&
    user.status === "ACTIVE" &&
    status !== "ACTIVE"
  ) {
    await ensureAnotherActiveAdminRemains(user);
  }

  const updatedUser =
    await administrationRepository.updateAdminUserStatus({
      administratorId: actor.id,
      targetUserId: userId,
      status,
      note,
      previousStatus: user.status,
    });

  return mapAdminUser(updatedUser);
}

export async function listPosts(actor, query = {}) {
  assertAdministrator(actor);

  const filters = parseOrThrow(listAdminPostsQuerySchema, query);

  const { page, limit, skip } = normalizePagination(filters);

  const { items, total } =
    await administrationRepository.listAdminPosts({
      skip,
      take: limit,
      search: filters.search,
      status: filters.status,
      visibility: filters.visibility,
      authorId: filters.authorId,
    });

  return createPaginatedResult(
    mapAdminPostList(items),
    total,
    page,
    limit,
  );
}

export async function updatePostStatus(actor, postId, status, note) {
  assertAdministrator(actor);

  const post = await administrationRepository.findAdminPostById(postId);

  if (!post) {
    throw new AppError(ADMIN_MESSAGES.POST_NOT_FOUND, 404);
  }

  if (post.status === status) {
    return mapAdminPost(post);
  }

  const updatedPost =
    await administrationRepository.updateAdminPostStatus({
      administratorId: actor.id,
      postId,
      status,
      note,
      previousStatus: post.status,
    });

  return mapAdminPost(updatedPost);
}

export async function listGroups(actor, query = {}) {
  assertAdministrator(actor);

  const filters = parseOrThrow(listAdminGroupsQuerySchema, query);

  const { page, limit, skip } = normalizePagination(filters);

  const { items, total } =
    await administrationRepository.listAdminGroups({
      skip,
      take: limit,
      search: filters.search,
      visibility: filters.visibility,
      ownerId: filters.ownerId,
    });

  return createPaginatedResult(
    mapAdminGroupList(items),
    total,
    page,
    limit,
  );
}

export async function deleteGroup(actor, groupId) {
  assertAdministrator(actor);

  const group =
    await administrationRepository.findAdminGroupById(groupId);

  if (!group) {
    throw new AppError(ADMIN_MESSAGES.GROUP_NOT_FOUND, 404);
  }

  const deletedGroup = await administrationRepository.deleteAdminGroup({
    administratorId: actor.id,
    group,
  });

  return mapAdminGroup(deletedGroup);
}

export async function listReports(actor, query = {}) {
  assertAdministrator(actor);

  const filters = parseOrThrow(listAdminReportsQuerySchema, query);

  const { page, limit, skip } = normalizePagination(filters);

  const { items, total } =
    await administrationRepository.listAdminReports({
      skip,
      take: limit,
      status: filters.status,
      targetType: filters.targetType,
      reason: filters.reason,
      reporterId: filters.reporterId,
      reviewerId: filters.reviewerId,
    });

  return createPaginatedResult(
    mapAdminReportList(items),
    total,
    page,
    limit,
  );
}

export async function listActions(actor, query = {}) {
  assertAdministrator(actor);

  const filters = parseOrThrow(listAdminActionsQuerySchema, query);

  const { page, limit, skip } = normalizePagination(filters);

  const { items, total } =
    await administrationRepository.listAdminActions({
      skip,
      take: limit,
      action: filters.action,
      moderatorId: filters.moderatorId,
      targetUserId: filters.targetUserId,
      reportId: filters.reportId,
    });

  return createPaginatedResult(
    mapAdminActionList(items),
    total,
    page,
    limit,
  );
}
