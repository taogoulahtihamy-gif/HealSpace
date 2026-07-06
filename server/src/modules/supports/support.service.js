import { AppError } from "../../../core/errors/AppError.js";
import { createNotification } from
  "../notifications/notification.service.js";
import {
  mapSupportRequest,
  mapSupportRequestList,
} from "./support.mapper.js";
import * as supportRepository from "./support.repository.js";
import {
  listAvailableSupportsQuerySchema,
  listMySupportsQuerySchema,
} from "./support.validator.js";
import {
  SUPPORT_LIMITS,
  SUPPORT_MESSAGES,
  SUPPORT_NOTIFICATION,
  SUPPORT_ROLES,
  SUPPORT_STATUSES,
} from "./support.constants.js";

function parseOrThrow(schema, input) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const message =
      result.error.issues?.[0]?.message ||
      "Les filtres fournis sont invalides.";

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
      : SUPPORT_LIMITS.DEFAULT_PAGE;

  const requestedLimit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : SUPPORT_LIMITS.DEFAULT_LIMIT;

  const limit = Math.min(
    requestedLimit,
    SUPPORT_LIMITS.MAX_LIMIT,
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

async function getRequiredSupportRequest(supportRequestId) {
  const supportRequest =
    await supportRepository.findSupportRequestById(
      supportRequestId,
    );

  if (!supportRequest) {
    throw new AppError(
      SUPPORT_MESSAGES.NOT_FOUND,
      404,
    );
  }

  return supportRequest;
}

function isParticipant(supportRequest, userId) {
  return (
    supportRequest.requesterId === userId ||
    supportRequest.supporterId === userId
  );
}

export async function createSupportRequest(
  userId,
  input,
) {
  const supportRequest =
    await supportRepository.createSupportRequest({
      requesterId: userId,
      supporterId: null,
      type: input.type,
      message: input.message,
      isAnonymous: input.isAnonymous ?? false,
      status: SUPPORT_STATUSES.OPEN,
    });

  return mapSupportRequest(
    supportRequest,
    userId,
  );
}

export async function listAvailableSupportRequests(
  userId,
  query = {},
) {
  const filters = parseOrThrow(
    listAvailableSupportsQuerySchema,
    query,
  );

  const { page, limit, skip } =
    normalizePagination(filters);

  const { items, total } =
    await supportRepository.listAvailableSupportRequests({
      currentUserId: userId,
      skip,
      take: limit,
      type: filters.type,
    });

  return createPaginatedResult(
    mapSupportRequestList(items, userId),
    total,
    page,
    limit,
  );
}

export async function listMySupportRequests(
  userId,
  query = {},
) {
  const filters = parseOrThrow(
    listMySupportsQuerySchema,
    query,
  );

  const { page, limit, skip } =
    normalizePagination(filters);

  const { items, total } =
    await supportRepository.listMySupportRequests({
      userId,
      skip,
      take: limit,
      role: filters.role ?? SUPPORT_ROLES.ALL,
      status: filters.status,
      type: filters.type,
    });

  return createPaginatedResult(
    mapSupportRequestList(items, userId),
    total,
    page,
    limit,
  );
}

export async function getSupportRequestById(
  userId,
  supportRequestId,
) {
  const supportRequest =
    await getRequiredSupportRequest(supportRequestId);

  const isOpen =
    supportRequest.status === SUPPORT_STATUSES.OPEN;

  if (!isOpen && !isParticipant(supportRequest, userId)) {
    throw new AppError(
      SUPPORT_MESSAGES.FORBIDDEN,
      403,
    );
  }

  return mapSupportRequest(
    supportRequest,
    userId,
  );
}

export async function acceptSupportRequest(
  userId,
  supportRequestId,
) {
  const supportRequest =
    await getRequiredSupportRequest(supportRequestId);

  if (supportRequest.requesterId === userId) {
    throw new AppError(
      SUPPORT_MESSAGES.CANNOT_ACCEPT_OWN_REQUEST,
      400,
    );
  }

  if (supportRequest.status !== SUPPORT_STATUSES.OPEN) {
    throw new AppError(
      SUPPORT_MESSAGES.ALREADY_HANDLED,
      409,
    );
  }

  const acceptedSupport =
    await supportRepository.acceptSupportRequest(
      supportRequestId,
      userId,
    );

  if (!acceptedSupport) {
    throw new AppError(
      SUPPORT_MESSAGES.ALREADY_HANDLED,
      409,
    );
  }

  await createNotification({
    userId: acceptedSupport.requesterId,
    actorId: userId,
    type: "SUPPORT_ACCEPTED",
    title: SUPPORT_NOTIFICATION.ACCEPTED_TITLE,
    message: SUPPORT_NOTIFICATION.ACCEPTED_MESSAGE,
    data: {
      supportRequestId: acceptedSupport.id,
      supportType: acceptedSupport.type,
    },
  });

  return mapSupportRequest(
    acceptedSupport,
    userId,
  );
}

export async function completeSupportRequest(
  userId,
  supportRequestId,
) {
  const supportRequest =
    await getRequiredSupportRequest(supportRequestId);

  if (supportRequest.status !== SUPPORT_STATUSES.ACCEPTED) {
    throw new AppError(
      SUPPORT_MESSAGES.INVALID_STATUS,
      409,
    );
  }

  if (!isParticipant(supportRequest, userId)) {
    throw new AppError(
      SUPPORT_MESSAGES.FORBIDDEN,
      403,
    );
  }

  const completedSupport =
    await supportRepository.completeSupportRequest(
      supportRequestId,
    );

  const recipientId =
    userId === completedSupport.requesterId
      ? completedSupport.supporterId
      : completedSupport.requesterId;

  if (recipientId) {
    await createNotification({
      userId: recipientId,
      actorId: userId,
      type: "SUPPORT_COMPLETED",
      title: SUPPORT_NOTIFICATION.COMPLETED_TITLE,
      message: SUPPORT_NOTIFICATION.COMPLETED_MESSAGE,
      data: {
        supportRequestId: completedSupport.id,
        supportType: completedSupport.type,
      },
    });
  }

  return mapSupportRequest(
    completedSupport,
    userId,
  );
}

export async function cancelSupportRequest(
  userId,
  supportRequestId,
) {
  const supportRequest =
    await getRequiredSupportRequest(supportRequestId);

  if (supportRequest.requesterId !== userId) {
    throw new AppError(
      SUPPORT_MESSAGES.FORBIDDEN,
      403,
    );
  }

  if (
    ![
      SUPPORT_STATUSES.OPEN,
      SUPPORT_STATUSES.ACCEPTED,
    ].includes(supportRequest.status)
  ) {
    throw new AppError(
      SUPPORT_MESSAGES.INVALID_STATUS,
      409,
    );
  }

  const cancelledSupport =
    await supportRepository.cancelSupportRequest(
      supportRequestId,
    );

  if (cancelledSupport.supporterId) {
    await createNotification({
      userId: cancelledSupport.supporterId,
      actorId: userId,
      type: "SUPPORT_CANCELLED",
      title: SUPPORT_NOTIFICATION.CANCELLED_TITLE,
      message: SUPPORT_NOTIFICATION.CANCELLED_MESSAGE,
      data: {
        supportRequestId: cancelledSupport.id,
        supportType: cancelledSupport.type,
      },
    });
  }

  return mapSupportRequest(
    cancelledSupport,
    userId,
  );
}
