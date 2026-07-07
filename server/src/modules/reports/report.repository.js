import { prisma } from "../../config/prisma.js";

const reportInclude = {
  reporter: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
    },
  },
  reviewer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
    },
  },
};

export async function createReport(data) {
  return prisma.report.create({
    data,
    include: reportInclude,
  });
}

export async function findReportByIdForReporter(
  reportId,
  reporterId,
) {
  return prisma.report.findFirst({
    where: {
      id: reportId,
      reporterId,
    },
    include: reportInclude,
  });
}

export async function findActiveReport({
  reporterId,
  targetType,
  targetId,
}) {
  return prisma.report.findFirst({
    where: {
      reporterId,
      targetType,
      targetId,
      status: {
        in: ["PENDING", "UNDER_REVIEW"],
      },
    },
    select: {
      id: true,
    },
  });
}

export async function listReportsByReporter({
  reporterId,
  skip,
  take,
  status,
  targetType,
  reason,
}) {
  const where = {
    reporterId,
    ...(status && { status }),
    ...(targetType && { targetType }),
    ...(reason && { reason }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.report.findMany({
      where,
      skip,
      take,
      include: reportInclude,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.report.count({
      where,
    }),
  ]);

  return {
    items,
    total,
  };
}

export async function findReportableUserById(userId) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });
}

export async function findReportablePostById(postId) {
  return prisma.post.findFirst({
    where: {
      id: postId,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });
}

export async function findReportableCommentById(commentId) {
  return prisma.comment.findFirst({
    where: {
      id: commentId,
      deletedAt: null,
      post: {
        is: {
          deletedAt: null,
        },
      },
    },
    select: {
      id: true,
    },
  });
}

export async function findReportableMessageById(
  messageId,
  reporterId,
) {
  return prisma.message.findFirst({
    where: {
      id: messageId,
      deletedAt: null,
      conversation: {
        is: {
          deletedAt: null,
          participants: {
            some: {
              userId: reporterId,
              leftAt: null,
            },
          },
        },
      },
    },
    select: {
      id: true,
    },
  });
}

export async function findReportableGroupById(
  groupId,
  reporterId,
) {
  return prisma.group.findFirst({
    where: {
      id: groupId,
      OR: [
        {
          visibility: "PUBLIC",
        },
        {
          ownerId: reporterId,
        },
        {
          members: {
            some: {
              userId: reporterId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });
}
