import { prisma } from "../../config/prisma.js";

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  avatar: true,
  status: true,
};

const groupSelect = {
  id: true,
  name: true,
  slug: true,
  visibility: true,
  ownerId: true,
};

const invitationInclude = {
  group: {
    select: groupSelect,
  },
  inviter: {
    select: userSelect,
  },
  invitee: {
    select: userSelect,
  },
};

export async function findGroupById(groupId) {
  return prisma.group.findUnique({
    where: {
      id: groupId,
    },
    include: {
      members: {
        select: {
          id: true,
          userId: true,
          role: true,
        },
      },
    },
  });
}

export async function findUserById(userId) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: userSelect,
  });
}

export async function findMembership(groupId, userId) {
  return prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
    select: {
      id: true,
      groupId: true,
      userId: true,
      role: true,
      joinedAt: true,
    },
  });
}

export async function expirePendingInvitationByPair(
  groupId,
  inviteeId,
  now,
) {
  return prisma.groupInvitation.updateMany({
    where: {
      groupId,
      inviteeId,
      status: "PENDING",
      expiresAt: {
        lte: now,
      },
    },
    data: {
      status: "EXPIRED",
      activeKey: null,
      respondedAt: now,
    },
  });
}

export async function expirePendingInvitationsForUser(inviteeId, now) {
  return prisma.groupInvitation.updateMany({
    where: {
      inviteeId,
      status: "PENDING",
      expiresAt: {
        lte: now,
      },
    },
    data: {
      status: "EXPIRED",
      activeKey: null,
      respondedAt: now,
    },
  });
}

export async function findActiveInvitation(groupId, inviteeId) {
  return prisma.groupInvitation.findUnique({
    where: {
      activeKey: `${groupId}:${inviteeId}`,
    },
    include: invitationInclude,
  });
}

export async function createInvitation(data) {
  return prisma.groupInvitation.create({
    data: {
      groupId: data.groupId,
      inviterId: data.inviterId,
      inviteeId: data.inviteeId,
      expiresAt: data.expiresAt,
      activeKey: `${data.groupId}:${data.inviteeId}`,
    },
    include: invitationInclude,
  });
}

export async function listReceivedInvitations({
  inviteeId,
  status,
  skip,
  take,
}) {
  const where = {
    inviteeId,
    ...(status && {
      status,
    }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.groupInvitation.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: invitationInclude,
    }),
    prisma.groupInvitation.count({
      where,
    }),
  ]);

  return {
    items,
    total,
  };
}

export async function findInvitationById(invitationId) {
  return prisma.groupInvitation.findUnique({
    where: {
      id: invitationId,
    },
    include: invitationInclude,
  });
}

export async function acceptInvitation({
  invitationId,
  groupId,
  inviteeId,
  respondedAt,
}) {
  return prisma.$transaction(async (transaction) => {
    const membership = await transaction.groupMember.create({
      data: {
        groupId,
        userId: inviteeId,
        role: "MEMBER",
      },
      include: {
        user: {
          select: userSelect,
        },
      },
    });

    const invitation = await transaction.groupInvitation.update({
      where: {
        id: invitationId,
      },
      data: {
        status: "ACCEPTED",
        activeKey: null,
        respondedAt,
      },
      include: invitationInclude,
    });

    return {
      invitation,
      membership,
    };
  });
}

export async function updateInvitationStatus(invitationId, data) {
  return prisma.groupInvitation.update({
    where: {
      id: invitationId,
    },
    data,
    include: invitationInclude,
  });
}
