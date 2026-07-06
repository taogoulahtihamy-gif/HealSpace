import { AppError } from "../../../core/errors/AppError.js";

import { createNotification } from
  "../notifications/notification.service.js";

import {
  GROUP_LIMITS,
  GROUP_MEMBER_ROLES,
  GROUP_MESSAGES,
  GROUP_NOTIFICATION,
  GROUP_VISIBILITIES,
} from "./group.constants.js";

import {
  mapGroup,
  mapGroupDetails,
  mapGroupMember,
} from "./group.mapper.js";

import * as groupRepository from "./group.repository.js";

function normalizePagination(query = {}) {
  const parsedPage = Number.parseInt(
    query.page,
    10,
  );

  const parsedLimit = Number.parseInt(
    query.limit,
    10,
  );

  const page =
    Number.isInteger(parsedPage) &&
    parsedPage > 0
      ? parsedPage
      : GROUP_LIMITS.DEFAULT_PAGE;

  const requestedLimit =
    Number.isInteger(parsedLimit) &&
    parsedLimit > 0
      ? parsedLimit
      : GROUP_LIMITS.DEFAULT_LIMIT;

  const limit = Math.min(
    requestedLimit,
    GROUP_LIMITS.MAX_LIMIT,
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function createPaginatedResult(
  items,
  total,
  page,
  limit,
) {
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

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

async function buildUniqueSlug(
  name,
  excludedGroupId = null,
) {
  const baseSlug = slugify(name) || "groupe";

  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const existing =
      await groupRepository.findGroupBySlug(
        candidate,
      );

    if (
      !existing ||
      existing.id === excludedGroupId
    ) {
      return candidate;
    }

    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

async function getRequiredGroup(groupId) {
  const group =
    await groupRepository.findGroupById(
      groupId,
    );

  if (!group) {
    throw new AppError(
      GROUP_MESSAGES.NOT_FOUND,
      404,
    );
  }

  return group;
}

function getMembership(group, userId) {
  return (
    group.members?.find(
      (member) => member.userId === userId,
    ) ?? null
  );
}

function requireAdminAccess(group, userId) {
  const membership = getMembership(
    group,
    userId,
  );

  const allowedRoles = [
    GROUP_MEMBER_ROLES.OWNER,
    GROUP_MEMBER_ROLES.ADMIN,
  ];

  if (
    !membership ||
    !allowedRoles.includes(membership.role)
  ) {
    throw new AppError(
      GROUP_MESSAGES.FORBIDDEN,
      403,
    );
  }

  return membership;
}

function requireOwnerAccess(group, userId) {
  const membership = getMembership(
    group,
    userId,
  );

  if (
    !membership ||
    membership.role !==
      GROUP_MEMBER_ROLES.OWNER
  ) {
    throw new AppError(
      GROUP_MESSAGES.FORBIDDEN,
      403,
    );
  }

  return membership;
}

async function notifyGroupOwnerOfNewMember({
  group,
  member,
  actorId,
}) {
  if (group.ownerId === actorId) {
    return;
  }

  await createNotification({
    userId: group.ownerId,
    actorId,
    type: "GROUP_JOIN",
    title: GROUP_NOTIFICATION.JOIN_TITLE,
    message: GROUP_NOTIFICATION.JOIN_MESSAGE,
    data: {
      groupId: group.id,
      groupName: group.name,
      memberId: member.id,
      memberUserId: actorId,
    },
  });
}

export async function createGroup(
  userId,
  input,
) {
  const slug = await buildUniqueSlug(
    input.name,
  );

  const group =
    await groupRepository.createGroup({
      ...input,
      description: input.description ?? null,
      coverUrl: input.coverUrl ?? null,
      visibility:
        input.visibility ??
        GROUP_VISIBILITIES.PUBLIC,
      ownerId: userId,
      slug,
    });

  return mapGroupDetails(group, userId);
}

export async function listGroups(
  userId,
  query = {},
) {
  const { page, limit, skip } =
    normalizePagination(query);

  const search =
    typeof query.search === "string"
      ? query.search.trim().slice(0, 100)
      : "";

  const { items, total } =
    await groupRepository.listGroups({
      currentUserId: userId,
      skip,
      take: limit,
      search,
    });

  return createPaginatedResult(
    items.map((group) =>
      mapGroup(group, userId),
    ),
    total,
    page,
    limit,
  );
}

export async function listMyGroups(
  userId,
  query = {},
) {
  const { page, limit, skip } =
    normalizePagination(query);

  const { items, total } =
    await groupRepository.listMyGroups({
      currentUserId: userId,
      skip,
      take: limit,
    });

  return createPaginatedResult(
    items.map((group) =>
      mapGroup(group, userId),
    ),
    total,
    page,
    limit,
  );
}

export async function getGroupById(
  userId,
  groupId,
) {
  const group = await getRequiredGroup(
    groupId,
  );

  const membership = getMembership(
    group,
    userId,
  );

  if (
    group.visibility ===
      GROUP_VISIBILITIES.PRIVATE &&
    !membership
  ) {
    throw new AppError(
      GROUP_MESSAGES.FORBIDDEN,
      403,
    );
  }

  return mapGroupDetails(group, userId);
}

export async function updateGroup(
  userId,
  groupId,
  input,
) {
  const group = await getRequiredGroup(
    groupId,
  );

  requireAdminAccess(group, userId);

  const data = { ...input };

  if (
    input.name &&
    input.name !== group.name
  ) {
    data.slug = await buildUniqueSlug(
      input.name,
      groupId,
    );
  }

  const updatedGroup =
    await groupRepository.updateGroup(
      groupId,
      data,
    );

  return mapGroupDetails(
    updatedGroup,
    userId,
  );
}

export async function deleteGroup(
  userId,
  groupId,
) {
  const group = await getRequiredGroup(
    groupId,
  );

  requireOwnerAccess(group, userId);

  await groupRepository.deleteGroup(groupId);

  return null;
}

export async function joinGroup(
  userId,
  groupId,
) {
  const group = await getRequiredGroup(
    groupId,
  );

  const currentMembership = getMembership(
    group,
    userId,
  );

  if (currentMembership) {
    throw new AppError(
      GROUP_MESSAGES.ALREADY_MEMBER,
      409,
    );
  }

  if (
    group.visibility ===
    GROUP_VISIBILITIES.PRIVATE
  ) {
    throw new AppError(
      GROUP_MESSAGES.PRIVATE_GROUP,
      403,
    );
  }

  const member =
    await groupRepository.addMember(
      groupId,
      userId,
    );

  await notifyGroupOwnerOfNewMember({
    group,
    member,
    actorId: userId,
  });

  return mapGroupMember(member);
}

export async function leaveGroup(
  userId,
  groupId,
) {
  const group = await getRequiredGroup(
    groupId,
  );

  const membership = getMembership(
    group,
    userId,
  );

  if (!membership) {
    throw new AppError(
      GROUP_MESSAGES.NOT_MEMBER,
      404,
    );
  }

  if (
    membership.role ===
    GROUP_MEMBER_ROLES.OWNER
  ) {
    throw new AppError(
      GROUP_MESSAGES.OWNER_CANNOT_LEAVE,
      409,
    );
  }

  await groupRepository.removeMembership(
    membership.id,
  );

  return null;
}

export async function listGroupMembers(
  userId,
  groupId,
  query = {},
) {
  const group = await getRequiredGroup(
    groupId,
  );

  const membership = getMembership(
    group,
    userId,
  );

  if (
    group.visibility ===
      GROUP_VISIBILITIES.PRIVATE &&
    !membership
  ) {
    throw new AppError(
      GROUP_MESSAGES.FORBIDDEN,
      403,
    );
  }

  const { page, limit, skip } =
    normalizePagination(query);

  const { items, total } =
    await groupRepository.listMembers(
      groupId,
      {
        skip,
        take: limit,
      },
    );

  return createPaginatedResult(
    items.map(mapGroupMember),
    total,
    page,
    limit,
  );
}

export async function updateMemberRole(
  userId,
  groupId,
  memberId,
  newRole,
) {
  const group = await getRequiredGroup(
    groupId,
  );

  const actorMembership =
    requireOwnerAccess(group, userId);

  const targetMembership =
    await groupRepository.findMembershipById(
      groupId,
      memberId,
    );

  if (!targetMembership) {
    throw new AppError(
      GROUP_MESSAGES.MEMBER_NOT_FOUND,
      404,
    );
  }

  if (
    targetMembership.id ===
    actorMembership.id
  ) {
    throw new AppError(
      GROUP_MESSAGES.OWNER_ROLE_IMMUTABLE,
      409,
    );
  }

  if (
    targetMembership.role ===
    GROUP_MEMBER_ROLES.OWNER
  ) {
    throw new AppError(
      GROUP_MESSAGES.OWNER_ROLE_IMMUTABLE,
      409,
    );
  }

  if (
    newRole ===
    GROUP_MEMBER_ROLES.OWNER
  ) {
    throw new AppError(
      GROUP_MESSAGES.CANNOT_PROMOTE_OWNER,
      422,
    );
  }

  const updatedMembership =
    await groupRepository.updateMembershipRole(
      memberId,
      newRole,
    );

  return mapGroupMember(updatedMembership);
}

export async function removeMember(
  userId,
  groupId,
  memberId,
) {
  const group = await getRequiredGroup(
    groupId,
  );

  const actorMembership =
    requireAdminAccess(group, userId);

  const targetMembership =
    await groupRepository.findMembershipById(
      groupId,
      memberId,
    );

  if (!targetMembership) {
    throw new AppError(
      GROUP_MESSAGES.MEMBER_NOT_FOUND,
      404,
    );
  }

  if (
    targetMembership.role ===
    GROUP_MEMBER_ROLES.OWNER
  ) {
    throw new AppError(
      GROUP_MESSAGES.OWNER_CANNOT_BE_REMOVED,
      409,
    );
  }

  if (
    actorMembership.role ===
      GROUP_MEMBER_ROLES.ADMIN &&
    targetMembership.role ===
      GROUP_MEMBER_ROLES.ADMIN
  ) {
    throw new AppError(
      GROUP_MESSAGES.FORBIDDEN,
      403,
    );
  }

  await groupRepository.removeMembership(
    memberId,
  );

  return null;
}