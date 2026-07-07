import { AppError } from "../../../core/errors/AppError.js";
import { createNotification } from
  "../notifications/notification.service.js";
import {
  mapFriendship,
  mapFriendshipList,
} from "./friendship.mapper.js";
import * as friendshipRepository from "./friendship.repository.js";
import { listFriendshipsQuerySchema } from "./friendship.validator.js";
import {
  FRIENDSHIP_LIMITS,
  FRIENDSHIP_MESSAGES,
  FRIENDSHIP_NOTIFICATION,
  FRIENDSHIP_STATUSES,
} from "./friendship.constants.js";

function normalizePair(firstUserId, secondUserId) {
  return [firstUserId, secondUserId].sort();
}

function parseOrThrow(schema, input) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const message =
      result.error.issues?.[0]?.message ||
      FRIENDSHIP_MESSAGES.INVALID_FILTERS;

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
      : FRIENDSHIP_LIMITS.DEFAULT_PAGE;

  const requestedLimit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : FRIENDSHIP_LIMITS.DEFAULT_LIMIT;

  const limit = Math.min(
    requestedLimit,
    FRIENDSHIP_LIMITS.MAX_LIMIT,
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

function ensureParticipant(friendship, userId) {
  const isParticipant =
    friendship.userOneId === userId ||
    friendship.userTwoId === userId;

  if (!isParticipant) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.FORBIDDEN,
      403,
    );
  }
}

export async function sendFriendRequest(
  requesterId,
  targetUserId,
) {
  if (requesterId === targetUserId) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.SELF_REQUEST_FORBIDDEN,
      400,
    );
  }

  const targetUser =
    await friendshipRepository.findActiveUserById(
      targetUserId,
    );

  if (!targetUser) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.USER_NOT_FOUND,
      404,
    );
  }

  const [userOneId, userTwoId] = normalizePair(
    requesterId,
    targetUserId,
  );

  const existingFriendship =
    await friendshipRepository.findFriendshipBetweenUsers(
      userOneId,
      userTwoId,
    );

  if (
    existingFriendship?.status ===
    FRIENDSHIP_STATUSES.ACCEPTED
  ) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.ALREADY_FRIENDS,
      409,
    );
  }

  if (
    existingFriendship?.status ===
    FRIENDSHIP_STATUSES.PENDING
  ) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.REQUEST_ALREADY_PENDING,
      409,
    );
  }

  const friendship = existingFriendship
    ? await friendshipRepository.reopenFriendshipRequest({
        friendshipId: existingFriendship.id,
        requestedById: requesterId,
      })
    : await friendshipRepository.createFriendshipRequest({
        userOneId,
        userTwoId,
        requestedById: requesterId,
      });

  await createNotification({
    userId: targetUserId,
    actorId: requesterId,
    type: "FRIEND_REQUEST",
    title: FRIENDSHIP_NOTIFICATION.REQUEST_TITLE,
    message: FRIENDSHIP_NOTIFICATION.REQUEST_MESSAGE,
    data: {
      friendshipId: friendship.id,
      requesterId,
    },
  });

  return mapFriendship(friendship, requesterId);
}

export async function listIncomingRequests(
  userId,
  query = {},
) {
  const filters = parseOrThrow(
    listFriendshipsQuerySchema,
    query,
  );

  const { page, limit, skip } =
    normalizePagination(filters);

  const { items, total } =
    await friendshipRepository.listIncomingRequests({
      userId,
      skip,
      take: limit,
    });

  return createPaginatedResult(
    mapFriendshipList(items, userId),
    total,
    page,
    limit,
  );
}

export async function listOutgoingRequests(
  userId,
  query = {},
) {
  const filters = parseOrThrow(
    listFriendshipsQuerySchema,
    query,
  );

  const { page, limit, skip } =
    normalizePagination(filters);

  const { items, total } =
    await friendshipRepository.listOutgoingRequests({
      userId,
      skip,
      take: limit,
    });

  return createPaginatedResult(
    mapFriendshipList(items, userId),
    total,
    page,
    limit,
  );
}

export async function listFriends(
  userId,
  query = {},
) {
  const filters = parseOrThrow(
    listFriendshipsQuerySchema,
    query,
  );

  const { page, limit, skip } =
    normalizePagination(filters);

  const { items, total } =
    await friendshipRepository.listAcceptedFriendships({
      userId,
      skip,
      take: limit,
    });

  return createPaginatedResult(
    mapFriendshipList(items, userId),
    total,
    page,
    limit,
  );
}

export async function acceptFriendRequest(
  userId,
  friendshipId,
) {
  const friendship =
    await friendshipRepository.findFriendshipById(
      friendshipId,
    );

  if (!friendship) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.REQUEST_NOT_FOUND,
      404,
    );
  }

  ensureParticipant(friendship, userId);

  if (
    friendship.status !==
      FRIENDSHIP_STATUSES.PENDING ||
    friendship.requestedById === userId
  ) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.FORBIDDEN,
      403,
    );
  }

  const acceptedFriendship =
    await friendshipRepository.acceptFriendshipRequest({
      friendshipId,
      recipientId: userId,
    });

  if (!acceptedFriendship) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.REQUEST_NOT_FOUND,
      404,
    );
  }

  await createNotification({
    userId: acceptedFriendship.requestedById,
    actorId: userId,
    type: "FRIEND_ACCEPTED",
    title: FRIENDSHIP_NOTIFICATION.ACCEPTED_TITLE,
    message: FRIENDSHIP_NOTIFICATION.ACCEPTED_MESSAGE,
    data: {
      friendshipId: acceptedFriendship.id,
      acceptedById: userId,
    },
  });

  return mapFriendship(
    acceptedFriendship,
    userId,
  );
}

export async function rejectFriendRequest(
  userId,
  friendshipId,
) {
  const friendship =
    await friendshipRepository.findFriendshipById(
      friendshipId,
    );

  if (!friendship) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.REQUEST_NOT_FOUND,
      404,
    );
  }

  ensureParticipant(friendship, userId);

  if (
    friendship.status !==
      FRIENDSHIP_STATUSES.PENDING ||
    friendship.requestedById === userId
  ) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.FORBIDDEN,
      403,
    );
  }

  const rejectedFriendship =
    await friendshipRepository.rejectFriendshipRequest({
      friendshipId,
      recipientId: userId,
    });

  if (!rejectedFriendship) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.REQUEST_NOT_FOUND,
      404,
    );
  }

  return mapFriendship(
    rejectedFriendship,
    userId,
  );
}

export async function cancelFriendRequest(
  userId,
  friendshipId,
) {
  const friendship =
    await friendshipRepository.findFriendshipById(
      friendshipId,
    );

  if (!friendship) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.REQUEST_NOT_FOUND,
      404,
    );
  }

  if (
    friendship.status !==
      FRIENDSHIP_STATUSES.PENDING ||
    friendship.requestedById !== userId
  ) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.FORBIDDEN,
      403,
    );
  }

  const result =
    await friendshipRepository.cancelOutgoingRequest({
      friendshipId,
      requesterId: userId,
    });

  if (result.count === 0) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.REQUEST_NOT_FOUND,
      404,
    );
  }

  return null;
}

export async function removeFriendship(
  userId,
  friendshipId,
) {
  const friendship =
    await friendshipRepository.findFriendshipById(
      friendshipId,
    );

  if (!friendship) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.FRIENDSHIP_NOT_FOUND,
      404,
    );
  }

  ensureParticipant(friendship, userId);

  if (
    friendship.status !==
    FRIENDSHIP_STATUSES.ACCEPTED
  ) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.FRIENDSHIP_NOT_FOUND,
      404,
    );
  }

  const result =
    await friendshipRepository.removeAcceptedFriendship({
      friendshipId,
      userId,
    });

  if (result.count === 0) {
    throw new AppError(
      FRIENDSHIP_MESSAGES.FRIENDSHIP_NOT_FOUND,
      404,
    );
  }

  return null;
}
