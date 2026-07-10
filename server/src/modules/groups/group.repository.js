import { prisma } from "../../config/prisma.js";
import { GROUP_MEMBER_ROLES } from "./group.constants.js";

const groupListInclude = (currentUserId) => ({
  owner: true,
  members: {
    where: { userId: currentUserId },
    select: {
      id: true,
      userId: true,
      role: true,
      joinedAt: true,
    },
  },
  _count: {
    select: { members: true },
  },
});

const groupDetailsInclude = {
  owner: true,
  members: {
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    include: { user: true },
  },
  _count: {
    select: { members: true },
  },
};

export async function createGroup(data) {
  return prisma.group.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      coverUrl: data.coverUrl ?? null,
      visibility: data.visibility,
      ownerId: data.ownerId,
      members: {
        create: {
          userId: data.ownerId,
          role: GROUP_MEMBER_ROLES.OWNER,
        },
      },
    },
    include: groupDetailsInclude,
  });
}

export async function findGroupById(groupId) {
  return prisma.group.findUnique({
    where: { id: groupId },
    include: groupDetailsInclude,
  });
}

export async function findGroupBySlug(slug) {
  return prisma.group.findUnique({
    where: { slug },
    select: { id: true },
  });
}

export async function listGroups({
  currentUserId,
  skip,
  take,
  search,
}) {
  const where = {
    AND: [
      {
        OR: [
          { visibility: "PUBLIC" },
          { members: { some: { userId: currentUserId } } },
        ],
      },
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              {
                description: { contains: search, mode: "insensitive" },
              },
            ],
          }
        : {},
    ],
  };

  const [items, total] = await prisma.$transaction([
    prisma.group.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: groupListInclude(currentUserId),
    }),
    prisma.group.count({ where }),
  ]);

  return { items, total };
}

export async function listMyGroups({ currentUserId, skip, take }) {
  const where = {
    members: { some: { userId: currentUserId } },
  };

  const [items, total] = await prisma.$transaction([
    prisma.group.findMany({
      where,
      skip,
      take,
      orderBy: { updatedAt: "desc" },
      include: groupListInclude(currentUserId),
    }),
    prisma.group.count({ where }),
  ]);

  return { items, total };
}

export async function updateGroup(groupId, data) {
  return prisma.group.update({
    where: { id: groupId },
    data,
    include: groupDetailsInclude,
  });
}

export async function deleteGroup(groupId) {
  return prisma.group.delete({
    where: { id: groupId },
  });
}

export async function findMembership(groupId, userId) {
  return prisma.groupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId },
    },
    include: { user: true },
  });
}

export async function findMembershipById(groupId, memberId) {
  return prisma.groupMember.findFirst({
    where: {
      id: memberId,
      groupId,
    },
    include: { user: true },
  });
}

export async function addMember(groupId, userId) {
  return prisma.groupMember.create({
    data: {
      groupId,
      userId,
      role: GROUP_MEMBER_ROLES.MEMBER,
    },
    include: { user: true },
  });
}

export async function removeMembership(memberId) {
  return prisma.groupMember.delete({
    where: { id: memberId },
  });
}

export async function updateMembershipRole(memberId, role) {
  return prisma.groupMember.update({
    where: { id: memberId },
    data: { role },
    include: { user: true },
  });
}

export async function listMembers(groupId, { skip, take }) {
  const where = { groupId };

  const [items, total] = await prisma.$transaction([
    prisma.groupMember.findMany({
      where,
      skip,
      take,
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      include: { user: true },
    }),
    prisma.groupMember.count({ where }),
  ]);

  return { items, total };
}
