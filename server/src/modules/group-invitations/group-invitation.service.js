import { AppError } from "../../../core/errors/AppError.js";
import { env } from "../../config/env.js";
import { createNotification } from "../notifications/notification.service.js";
import {
  GROUP_INVITATION_LIMITS,
  GROUP_INVITATION_MESSAGES,
  GROUP_INVITATION_NOTIFICATIONS,
  GROUP_INVITATION_STATUSES,
} from "./group-invitation.constants.js";
import {
  mapGroupInvitation,
  mapGroupInvitationList,
} from "./group-invitation.mapper.js";
import * as repository from "./group-invitation.repository.js";

const GROUP_ADMIN_ROLES = ["OWNER", "ADMIN"];

function normalizePagination(query = {}) {
  const parsedPage = Number.parseInt(query.page, 10);

  const parsedLimit = Number.parseInt(query.limit, 10);

  const page =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : GROUP_INVITATION_LIMITS.DEFAULT_PAGE;

  const requestedLimit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : GROUP_INVITATION_LIMITS.DEFAULT_LIMIT;

  const limit = Math.min(
    requestedLimit,
    GROUP_INVITATION_LIMITS.MAX_LIMIT,
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

function getMembership(group, userId) {
  return group.members.find((member) => member.userId === userId);
}

function requireInvitationManagementAccess(group, userId) {
  const membership = getMembership(group, userId);

  if (!membership || !GROUP_ADMIN_ROLES.includes(membership.role)) {
    throw new AppError(GROUP_INVITATION_MESSAGES.FORBIDDEN, 403);
  }

  return membership;
}

async function getRequiredGroup(groupId) {
  const group = await repository.findGroupById(groupId);

  if (!group) {
    throw new AppError(GROUP_INVITATION_MESSAGES.GROUP_NOT_FOUND, 404);
  }

  return group;
}

async function getRequiredInvitation(invitationId) {
  const invitation = await repository.findInvitationById(invitationId);

  if (!invitation) {
    throw new AppError(GROUP_INVITATION_MESSAGES.NOT_FOUND, 404);
  }

  return invitation;
}

async function expireInvitationIfNecessary(invitation) {
  if (
    invitation.status !== GROUP_INVITATION_STATUSES.PENDING ||
    new Date(invitation.expiresAt).getTime() > Date.now()
  ) {
    return invitation;
  }

  const expired = await repository.updateInvitationStatus(
    invitation.id,
    {
      status: GROUP_INVITATION_STATUSES.EXPIRED,
      activeKey: null,
      respondedAt: new Date(),
    },
  );

  throw new AppError(
    GROUP_INVITATION_MESSAGES.INVITATION_EXPIRED,
    410,
    {
      invitation: mapGroupInvitation(expired),
    },
  );
}

async function notifyInvitationAccepted({
  invitation,
  membership,
  actorId,
}) {
  const recipientIds = new Set([
    invitation.inviterId,
    invitation.group.ownerId,
  ]);

  recipientIds.delete(actorId);

  await Promise.all(
    [...recipientIds].map((userId) =>
      createNotification({
        userId,
        actorId,
        type: "GROUP_INVITATION_ACCEPTED",
        title: GROUP_INVITATION_NOTIFICATIONS.ACCEPTED_TITLE,
        message: GROUP_INVITATION_NOTIFICATIONS.ACCEPTED_MESSAGE,
        data: {
          invitationId: invitation.id,
          groupId: invitation.groupId,
          groupName: invitation.group.name,
          memberId: membership.id,
          memberUserId: actorId,
        },
      }),
    ),
  );
}

export async function createGroupInvitation(userId, groupId, input) {
  const group = await getRequiredGroup(groupId);

  requireInvitationManagementAccess(group, userId);

  if (group.visibility !== "PRIVATE") {
    throw new AppError(
      GROUP_INVITATION_MESSAGES.PRIVATE_GROUP_REQUIRED,
      422,
    );
  }

  const invitee = await repository.findUserById(input.inviteeId);

  if (!invitee) {
    throw new AppError(GROUP_INVITATION_MESSAGES.USER_NOT_FOUND, 404);
  }

  if (invitee.status !== "ACTIVE") {
    throw new AppError(
      GROUP_INVITATION_MESSAGES.INVITEE_UNAVAILABLE,
      422,
    );
  }

  const membership = await repository.findMembership(
    groupId,
    input.inviteeId,
  );

  if (membership) {
    throw new AppError(GROUP_INVITATION_MESSAGES.ALREADY_MEMBER, 409);
  }

  const now = new Date();

  await repository.expirePendingInvitationByPair(
    groupId,
    input.inviteeId,
    now,
  );

  const activeInvitation = await repository.findActiveInvitation(
    groupId,
    input.inviteeId,
  );

  if (activeInvitation) {
    throw new AppError(GROUP_INVITATION_MESSAGES.DUPLICATE_ACTIVE, 409);
  }

  const expiresAt = new Date(
    now.getTime() + env.GROUP_INVITATION_TTL_HOURS * 60 * 60 * 1000,
  );

  let invitation;

  try {
    invitation = await repository.createInvitation({
      groupId,
      inviterId: userId,
      inviteeId: input.inviteeId,
      expiresAt,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new AppError(
        GROUP_INVITATION_MESSAGES.DUPLICATE_ACTIVE,
        409,
      );
    }

    throw error;
  }

  await createNotification({
    userId: input.inviteeId,
    actorId: userId,
    type: "GROUP_INVITATION",
    title: GROUP_INVITATION_NOTIFICATIONS.INVITATION_TITLE,
    message: GROUP_INVITATION_NOTIFICATIONS.INVITATION_MESSAGE,
    data: {
      invitationId: invitation.id,
      groupId: group.id,
      groupName: group.name,
      expiresAt: invitation.expiresAt,
    },
  });

  return mapGroupInvitation(invitation);
}

export async function listMyGroupInvitations(userId, query = {}) {
  const status =
    typeof query.status === "string"
      ? query.status.trim().toUpperCase()
      : undefined;

  if (
    status &&
    !Object.values(GROUP_INVITATION_STATUSES).includes(status)
  ) {
    throw new AppError(GROUP_INVITATION_MESSAGES.INVALID_STATUS, 422);
  }

  const now = new Date();

  await repository.expirePendingInvitationsForUser(userId, now);

  const { page, limit, skip } = normalizePagination(query);

  const { items, total } = await repository.listReceivedInvitations({
    inviteeId: userId,
    status,
    skip,
    take: limit,
  });

  return createPaginatedResult(
    mapGroupInvitationList(items),
    total,
    page,
    limit,
  );
}

export async function acceptGroupInvitation(userId, invitationId) {
  let invitation = await getRequiredInvitation(invitationId);

  if (invitation.inviteeId !== userId) {
    throw new AppError(GROUP_INVITATION_MESSAGES.NOT_RECIPIENT, 403);
  }

  invitation = await expireInvitationIfNecessary(invitation);

  if (invitation.status !== GROUP_INVITATION_STATUSES.PENDING) {
    throw new AppError(
      GROUP_INVITATION_MESSAGES.INVITATION_NOT_PENDING,
      409,
    );
  }

  const membership = await repository.findMembership(
    invitation.groupId,
    userId,
  );

  if (membership) {
    throw new AppError(GROUP_INVITATION_MESSAGES.ALREADY_MEMBER, 409);
  }

  let result;

  try {
    result = await repository.acceptInvitation({
      invitationId: invitation.id,
      groupId: invitation.groupId,
      inviteeId: userId,
      respondedAt: new Date(),
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new AppError(GROUP_INVITATION_MESSAGES.ALREADY_MEMBER, 409);
    }

    throw error;
  }

  await notifyInvitationAccepted({
    invitation: result.invitation,
    membership: result.membership,
    actorId: userId,
  });

  return mapGroupInvitation(result.invitation, result.membership);
}

export async function rejectGroupInvitation(userId, invitationId) {
  let invitation = await getRequiredInvitation(invitationId);

  if (invitation.inviteeId !== userId) {
    throw new AppError(GROUP_INVITATION_MESSAGES.NOT_RECIPIENT, 403);
  }

  invitation = await expireInvitationIfNecessary(invitation);

  if (invitation.status !== GROUP_INVITATION_STATUSES.PENDING) {
    throw new AppError(
      GROUP_INVITATION_MESSAGES.INVITATION_NOT_PENDING,
      409,
    );
  }

  const rejected = await repository.updateInvitationStatus(
    invitation.id,
    {
      status: GROUP_INVITATION_STATUSES.REJECTED,
      activeKey: null,
      respondedAt: new Date(),
    },
  );

  return mapGroupInvitation(rejected);
}

export async function cancelGroupInvitation(
  userId,
  groupId,
  invitationId,
) {
  const group = await getRequiredGroup(groupId);

  requireInvitationManagementAccess(group, userId);

  let invitation = await getRequiredInvitation(invitationId);

  if (invitation.groupId !== groupId) {
    throw new AppError(GROUP_INVITATION_MESSAGES.NOT_FOUND, 404);
  }

  invitation = await expireInvitationIfNecessary(invitation);

  if (invitation.status !== GROUP_INVITATION_STATUSES.PENDING) {
    throw new AppError(
      GROUP_INVITATION_MESSAGES.INVITATION_NOT_PENDING,
      409,
    );
  }

  const cancelled = await repository.updateInvitationStatus(
    invitation.id,
    {
      status: GROUP_INVITATION_STATUSES.CANCELLED,
      activeKey: null,
      cancelledAt: new Date(),
    },
  );

  return mapGroupInvitation(cancelled);
}
