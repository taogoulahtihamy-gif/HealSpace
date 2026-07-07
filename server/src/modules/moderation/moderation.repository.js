import { prisma } from "../../config/prisma.js";

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  email: true,
  avatar: true,
  role: true,
  status: true,
};

const moderationActionInclude = {
  moderator: {
    select: userSelect,
  },
  targetUser: {
    select: userSelect,
  },
};

const moderationReportInclude = {
  reporter: {
    select: userSelect,
  },
  reviewer: {
    select: userSelect,
  },
  moderationActions: {
    include: moderationActionInclude,
    orderBy: {
      createdAt: "asc",
    },
  },
};

export async function listModerationReports({
  skip,
  take,
  status,
  targetType,
  reason,
  reviewerId,
}) {
  const where = {
    ...(status && { status }),
    ...(targetType && { targetType }),
    ...(reason && { reason }),
    ...(reviewerId && { reviewerId }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.report.findMany({
      where,
      skip,
      take,
      include: moderationReportInclude,
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

export async function findModerationReportById(reportId) {
  return prisma.report.findUnique({
    where: {
      id: reportId,
    },
    include: moderationReportInclude,
  });
}

export async function startReportReview({
  reportId,
  moderatorId,
}) {
  return prisma.$transaction(async (transaction) => {
    const result = await transaction.report.updateMany({
      where: {
        id: reportId,
        status: "PENDING",
        reviewerId: null,
      },
      data: {
        status: "UNDER_REVIEW",
        reviewerId: moderatorId,
        reviewedAt: new Date(),
      },
    });

    if (result.count === 0) {
      return null;
    }

    await transaction.moderationAction.create({
      data: {
        moderatorId,
        reportId,
        action: "REPORT_REVIEW_STARTED",
        note: null,
        metadata: {
          previousStatus: "PENDING",
          nextStatus: "UNDER_REVIEW",
        },
      },
    });

    return transaction.report.findUnique({
      where: {
        id: reportId,
      },
      include: moderationReportInclude,
    });
  });
}

export async function closeReport({
  reportId,
  moderatorId,
  status,
  resolutionNote,
  action,
  allowReviewerOverride,
}) {
  return prisma.$transaction(async (transaction) => {
    const result = await transaction.report.updateMany({
      where: {
        id: reportId,
        status: {
          in: ["PENDING", "UNDER_REVIEW"],
        },
        ...(!allowReviewerOverride && {
          OR: [
            {
              reviewerId: null,
            },
            {
              reviewerId: moderatorId,
            },
          ],
        }),
      },
      data: {
        status,
        reviewerId: moderatorId,
        resolutionNote,
        reviewedAt: new Date(),
      },
    });

    if (result.count === 0) {
      return null;
    }

    await transaction.moderationAction.create({
      data: {
        moderatorId,
        reportId,
        action,
        note: resolutionNote,
        metadata: {
          nextStatus: status,
        },
      },
    });

    return transaction.report.findUnique({
      where: {
        id: reportId,
      },
      include: moderationReportInclude,
    });
  });
}

export async function findUserForModeration(userId) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: userSelect,
  });
}

export async function updateUserStatus({
  moderatorId,
  targetUserId,
  status,
  note,
  previousStatus,
}) {
  return prisma.$transaction(async (transaction) => {
    const user = await transaction.user.update({
      where: {
        id: targetUserId,
      },
      data: {
        status,
      },
      select: userSelect,
    });

    if (status !== "ACTIVE") {
      await transaction.refreshToken.updateMany({
        where: {
          userId: targetUserId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    await transaction.moderationAction.create({
      data: {
        moderatorId,
        targetUserId,
        action: "USER_STATUS_CHANGED",
        note,
        metadata: {
          previousStatus,
          nextStatus: status,
        },
      },
    });

    return user;
  });
}
