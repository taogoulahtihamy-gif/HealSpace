import { prisma } from "../../config/prisma.js";

const supportInclude = {
  requester: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
    },
  },
  supporter: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
    },
  },
};

export async function createSupportRequest(data) {
  return prisma.supportRequest.create({
    data,
    include: supportInclude,
  });
}

export async function findSupportRequestById(id) {
  return prisma.supportRequest.findUnique({
    where: { id },
    include: supportInclude,
  });
}

export async function listAvailableSupportRequests({
  currentUserId,
  skip,
  take,
  type,
}) {
  const where = {
    status: "OPEN",
    requesterId: {
      not: currentUserId,
    },
    ...(type && { type }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.supportRequest.findMany({
      where,
      skip,
      take,
      include: supportInclude,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.supportRequest.count({
      where,
    }),
  ]);

  return {
    items,
    total,
  };
}

export async function listMySupportRequests({
  userId,
  skip,
  take,
  role,
  status,
  type,
}) {
  const participantFilter =
    role === "requester"
      ? { requesterId: userId }
      : role === "supporter"
        ? { supporterId: userId }
        : {
            OR: [
              { requesterId: userId },
              { supporterId: userId },
            ],
          };

  const where = {
    ...participantFilter,
    ...(status && { status }),
    ...(type && { type }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.supportRequest.findMany({
      where,
      skip,
      take,
      include: supportInclude,
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.supportRequest.count({
      where,
    }),
  ]);

  return {
    items,
    total,
  };
}

/**
 * L'updateMany rend l'acceptation atomique :
 * une seule personne peut accepter une demande OPEN.
 */
export async function acceptSupportRequest(
  supportRequestId,
  supporterId,
) {
  const acceptedAt = new Date();

  const result = await prisma.supportRequest.updateMany({
    where: {
      id: supportRequestId,
      status: "OPEN",
      supporterId: null,
      requesterId: {
        not: supporterId,
      },
    },
    data: {
      supporterId,
      status: "ACCEPTED",
      acceptedAt,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return findSupportRequestById(supportRequestId);
}

export async function completeSupportRequest(
  supportRequestId,
) {
  return prisma.supportRequest.update({
    where: {
      id: supportRequestId,
    },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
    include: supportInclude,
  });
}

export async function cancelSupportRequest(
  supportRequestId,
) {
  return prisma.supportRequest.update({
    where: {
      id: supportRequestId,
    },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
    include: supportInclude,
  });
}
