import { prisma } from "../../config/prisma.js";

const friendshipInclude = {
  userOne: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
      role: true,
      status: true,
    },
  },
  userTwo: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
      role: true,
      status: true,
    },
  },
};

export async function findActiveUserById(userId) {
  return prisma.user.findFirst({
    where: {
      id: userId,
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });
}

export async function findFriendshipBetweenUsers(userOneId, userTwoId) {
  return prisma.friendship.findUnique({
    where: {
      userOneId_userTwoId: {
        userOneId,
        userTwoId,
      },
    },
    include: friendshipInclude,
  });
}

export async function findFriendshipById(friendshipId) {
  return prisma.friendship.findUnique({
    where: {
      id: friendshipId,
    },
    include: friendshipInclude,
  });
}

export async function createFriendshipRequest({
  userOneId,
  userTwoId,
  requestedById,
}) {
  return prisma.friendship.create({
    data: {
      userOneId,
      userTwoId,
      requestedById,
      status: "PENDING",
      respondedAt: null,
    },
    include: friendshipInclude,
  });
}

export async function reopenFriendshipRequest({
  friendshipId,
  requestedById,
}) {
  return prisma.friendship.update({
    where: {
      id: friendshipId,
    },
    data: {
      requestedById,
      status: "PENDING",
      respondedAt: null,
    },
    include: friendshipInclude,
  });
}

export async function listIncomingRequests({ userId, skip, take }) {
  const where = {
    status: "PENDING",
    requestedById: {
      not: userId,
    },
    OR: [{ userOneId: userId }, { userTwoId: userId }],
  };

  const [items, total] = await prisma.$transaction([
    prisma.friendship.findMany({
      where,
      skip,
      take,
      include: friendshipInclude,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.friendship.count({
      where,
    }),
  ]);

  return { items, total };
}

export async function listOutgoingRequests({ userId, skip, take }) {
  const where = {
    status: "PENDING",
    requestedById: userId,
  };

  const [items, total] = await prisma.$transaction([
    prisma.friendship.findMany({
      where,
      skip,
      take,
      include: friendshipInclude,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.friendship.count({
      where,
    }),
  ]);

  return { items, total };
}

export async function listAcceptedFriendships({ userId, skip, take }) {
  const where = {
    status: "ACCEPTED",
    OR: [{ userOneId: userId }, { userTwoId: userId }],
  };

  const [items, total] = await prisma.$transaction([
    prisma.friendship.findMany({
      where,
      skip,
      take,
      include: friendshipInclude,
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.friendship.count({
      where,
    }),
  ]);

  return { items, total };
}

export async function acceptFriendshipRequest({
  friendshipId,
  recipientId,
}) {
  const result = await prisma.friendship.updateMany({
    where: {
      id: friendshipId,
      status: "PENDING",
      requestedById: {
        not: recipientId,
      },
      OR: [{ userOneId: recipientId }, { userTwoId: recipientId }],
    },
    data: {
      status: "ACCEPTED",
      respondedAt: new Date(),
    },
  });

  if (result.count === 0) {
    return null;
  }

  return findFriendshipById(friendshipId);
}

export async function rejectFriendshipRequest({
  friendshipId,
  recipientId,
}) {
  const result = await prisma.friendship.updateMany({
    where: {
      id: friendshipId,
      status: "PENDING",
      requestedById: {
        not: recipientId,
      },
      OR: [{ userOneId: recipientId }, { userTwoId: recipientId }],
    },
    data: {
      status: "REJECTED",
      respondedAt: new Date(),
    },
  });

  if (result.count === 0) {
    return null;
  }

  return findFriendshipById(friendshipId);
}

export async function cancelOutgoingRequest({
  friendshipId,
  requesterId,
}) {
  return prisma.friendship.deleteMany({
    where: {
      id: friendshipId,
      status: "PENDING",
      requestedById: requesterId,
    },
  });
}

export async function removeAcceptedFriendship({
  friendshipId,
  userId,
}) {
  return prisma.friendship.deleteMany({
    where: {
      id: friendshipId,
      status: "ACCEPTED",
      OR: [{ userOneId: userId }, { userTwoId: userId }],
    },
  });
}

export async function areUsersFriends(firstUserId, secondUserId) {
  const [userOneId, userTwoId] = [firstUserId, secondUserId].sort();

  const friendship = await prisma.friendship.findUnique({
    where: {
      userOneId_userTwoId: {
        userOneId,
        userTwoId,
      },
    },
    select: {
      status: true,
    },
  });

  return friendship?.status === "ACCEPTED";
}
