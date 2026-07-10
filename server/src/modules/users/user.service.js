import bcrypt from "bcrypt";
import { AppError } from "../../../core/errors/AppError.js";
import {
  toPrivateUserProfile,
  toPublicUserProfile,
  toUserSearchList,
} from "./user.mapper.js";
import * as userRepository from "./user.repository.js";
import {
  USER_LIMITS,
  USER_MESSAGES,
  USER_VISIBILITIES,
} from "./user.constants.js";
import { searchUsersQuerySchema } from "./user.validator.js";

async function getRequiredUser(userId) {
  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new AppError(USER_MESSAGES.NOT_FOUND, 404);
  }

  return user;
}

function parseSearchQuery(query) {
  const result = searchUsersQuerySchema.safeParse(query);

  if (!result.success) {
    throw new AppError(
      result.error.issues?.[0]?.message || USER_MESSAGES.INVALID_SEARCH,
      400,
      result.error.flatten(),
    );
  }

  return result.data;
}

function normalizeSearchPagination(query) {
  const page = Number.parseInt(
    query.page || String(USER_LIMITS.SEARCH_DEFAULT_PAGE),
    10,
  );

  const requestedLimit = Number.parseInt(
    query.limit || String(USER_LIMITS.SEARCH_DEFAULT_LIMIT),
    10,
  );

  const limit = Math.min(requestedLimit, USER_LIMITS.SEARCH_MAX_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export async function getMyProfile(userId) {
  const user = await userRepository.findPrivateProfileById(userId);

  if (!user) {
    throw new AppError(USER_MESSAGES.NOT_FOUND, 404);
  }

  return toPrivateUserProfile(user);
}

export async function searchUsers(currentUserId, query = {}) {
  const filters = parseSearchQuery(query);
  const { page, limit, skip } = normalizeSearchPagination(filters);

  const { items, total } = await userRepository.searchVisibleUsers({
    currentUserId,
    query: filters.q,
    skip,
    take: limit,
  });

  return {
    items: toUserSearchList(items, currentUserId),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getPublicProfile(currentUserId, targetUserId) {
  const user = await userRepository.findPublicProfileById(targetUserId);

  if (!user || user.status !== "ACTIVE") {
    throw new AppError(USER_MESSAGES.NOT_FOUND, 404);
  }

  const isOwner = currentUserId === targetUserId;

  if (isOwner) {
    return toPublicUserProfile(user);
  }

  if (user.isPrivate) {
    throw new AppError(USER_MESSAGES.PRIVATE_PROFILE, 403);
  }

  if (user.visibility === USER_VISIBILITIES.PUBLIC) {
    return toPublicUserProfile(user);
  }

  if (user.visibility === USER_VISIBILITIES.FRIENDS) {
    const areFriends = await userRepository.areUsersFriends(
      currentUserId,
      targetUserId,
    );

    if (areFriends) {
      return toPublicUserProfile(user);
    }
  }

  throw new AppError(USER_MESSAGES.PRIVATE_PROFILE, 403);
}

export async function updateMyProfile(userId, input) {
  await getRequiredUser(userId);

  if (input.username) {
    const existingUser = await userRepository.findUserByUsername(
      input.username,
    );

    if (existingUser && existingUser.id !== userId) {
      throw new AppError(USER_MESSAGES.USERNAME_ALREADY_EXISTS, 409);
    }
  }

  const data = {
    ...input,
    ...(Object.prototype.hasOwnProperty.call(input, "birthDate") && {
      birthDate: input.birthDate ? new Date(input.birthDate) : null,
    }),
  };

  const updatedUser = await userRepository.updateUserProfile(
    userId,
    data,
  );

  return toPrivateUserProfile(updatedUser);
}

export async function updatePrivacy(userId, input) {
  await getRequiredUser(userId);

  const updatedUser = await userRepository.updateUserPrivacy(
    userId,
    input,
  );

  return toPrivateUserProfile(updatedUser);
}

export async function changePassword(userId, input) {
  const user = await getRequiredUser(userId);

  const passwordMatches = await bcrypt.compare(
    input.currentPassword,
    user.password,
  );

  if (!passwordMatches) {
    throw new AppError(USER_MESSAGES.CURRENT_PASSWORD_INVALID, 401);
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, 12);

  await userRepository.updatePasswordAndRevokeSessions(
    userId,
    hashedPassword,
  );

  return null;
}

export async function deactivateAccount(userId, password) {
  const user = await getRequiredUser(userId);

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError(USER_MESSAGES.CURRENT_PASSWORD_INVALID, 401);
  }

  await userRepository.deactivateUserAndRevokeSessions(userId);

  return null;
}
