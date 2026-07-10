import { prisma } from "../../config/prisma.js";

const adminUserSummarySelect = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  email: true,
  phone: true,
  avatar: true,
  role: true,
  status: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
};

const adminUserDetailsSelect = {
  ...adminUserSummarySelect,
  coverPhoto: true,
  bio: true,
  birthDate: true,
  gender: true,
  country: true,
  city: true,
  language: true,
  timezone: true,
  visibility: true,
  currentMood: true,
  emailVerified: true,
  phoneVerified: true,
  isPrivate: true,
  allowAI: true,
  lastLogin: true,
  _count: {
    select: {
      posts: true,
      comments: true,
      reactions: true,
      groups: true,
      groupMembers: true,
      reportsMade: true,
      reportsReviewed: true,
      supportRequests: true,
      providedSupports: true,
      friendshipsAsUserOne: true,
      friendshipsAsUserTwo: true,
    },
  },
};

const adminPostInclude = {
  author: {
    select: adminUserSummarySelect,
  },
  _count: {
    select: {
      comments: true,
      reactions: true,
      media: true,
    },
  },
};

const adminGroupInclude = {
  owner: {
    select: adminUserSummarySelect,
  },
  _count: {
    select: {
      members: true,
    },
  },
};

const adminReportInclude = {
  reporter: {
    select: adminUserSummarySelect,
  },
  reviewer: {
    select: adminUserSummarySelect,
  },
};

const adminActionInclude = {
  moderator: {
    select: adminUserSummarySelect,
  },
  targetUser: {
    select: adminUserSummarySelect,
  },
  report: {
    select: {
      id: true,
      targetType: true,
      targetId: true,
      reason: true,
      status: true,
    },
  },
};

export async function getAdminStatistics() {
  const [
    usersTotal,
    usersActive,
    usersSuspended,
    usersBanned,
    postsTotal,
    postsPublished,
    postsArchived,
    groupsTotal,
    reportsTotal,
    reportsPending,
    reportsUnderReview,
    reportsResolved,
    reportsRejected,
    supportsOpen,
    supportsAccepted,
    friendshipsAccepted,
    unreadNotifications,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({
      where: { status: "ACTIVE" },
    }),
    prisma.user.count({
      where: { status: "SUSPENDED" },
    }),
    prisma.user.count({
      where: { status: "BANNED" },
    }),
    prisma.post.count(),
    prisma.post.count({
      where: { status: "PUBLISHED" },
    }),
    prisma.post.count({
      where: { status: "ARCHIVED" },
    }),
    prisma.group.count(),
    prisma.report.count(),
    prisma.report.count({
      where: { status: "PENDING" },
    }),
    prisma.report.count({
      where: { status: "UNDER_REVIEW" },
    }),
    prisma.report.count({
      where: { status: "RESOLVED" },
    }),
    prisma.report.count({
      where: { status: "REJECTED" },
    }),
    prisma.supportRequest.count({
      where: { status: "OPEN" },
    }),
    prisma.supportRequest.count({
      where: { status: "ACCEPTED" },
    }),
    prisma.friendship.count({
      where: { status: "ACCEPTED" },
    }),
    prisma.notification.count({
      where: { isRead: false },
    }),
  ]);

  return {
    users: {
      total: usersTotal,
      active: usersActive,
      suspended: usersSuspended,
      banned: usersBanned,
    },
    posts: {
      total: postsTotal,
      published: postsPublished,
      archived: postsArchived,
    },
    groups: {
      total: groupsTotal,
    },
    reports: {
      total: reportsTotal,
      pending: reportsPending,
      underReview: reportsUnderReview,
      resolved: reportsResolved,
      rejected: reportsRejected,
    },
    supports: {
      open: supportsOpen,
      accepted: supportsAccepted,
    },
    friendships: {
      accepted: friendshipsAccepted,
    },
    notifications: {
      unread: unreadNotifications,
    },
  };
}

export async function listAdminUsers({
  skip,
  take,
  search,
  role,
  status,
}) {
  const where = {
    ...(role && { role }),
    ...(status && { status }),
    ...(search && {
      OR: [
        {
          firstName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          username: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take,
      select: adminUserDetailsSelect,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total };
}

export async function findAdminUserById(userId) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: adminUserDetailsSelect,
  });
}

export async function countOtherActiveAdmins(userId) {
  return prisma.user.count({
    where: {
      id: {
        not: userId,
      },
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
}

export async function updateAdminUserRole({
  administratorId,
  targetUserId,
  role,
  note,
  previousRole,
}) {
  return prisma.$transaction(async (transaction) => {
    const user = await transaction.user.update({
      where: {
        id: targetUserId,
      },
      data: {
        role,
      },
      select: adminUserDetailsSelect,
    });

    await transaction.refreshToken.updateMany({
      where: {
        userId: targetUserId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    await transaction.moderationAction.create({
      data: {
        moderatorId: administratorId,
        targetUserId,
        action: "USER_ROLE_CHANGED",
        note,
        metadata: {
          previousRole,
          nextRole: role,
        },
      },
    });

    return user;
  });
}

export async function updateAdminUserStatus({
  administratorId,
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
      select: adminUserDetailsSelect,
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
        moderatorId: administratorId,
        targetUserId,
        action: "USER_STATUS_CHANGED",
        note,
        metadata: {
          previousStatus,
          nextStatus: status,
          source: "ADMINISTRATION",
        },
      },
    });

    return user;
  });
}

export async function listAdminPosts({
  skip,
  take,
  search,
  status,
  visibility,
  authorId,
}) {
  const where = {
    ...(status && { status }),
    ...(visibility && { visibility }),
    ...(authorId && { authorId }),
    ...(search && {
      content: {
        contains: search,
        mode: "insensitive",
      },
    }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take,
      include: adminPostInclude,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.post.count({ where }),
  ]);

  return { items, total };
}

export async function findAdminPostById(postId) {
  return prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: adminPostInclude,
  });
}

export async function updateAdminPostStatus({
  administratorId,
  postId,
  status,
  note,
  previousStatus,
}) {
  return prisma.$transaction(async (transaction) => {
    const post = await transaction.post.update({
      where: {
        id: postId,
      },
      data: {
        status,
        deletedAt: status === "DELETED" ? new Date() : null,
      },
      include: adminPostInclude,
    });

    await transaction.moderationAction.create({
      data: {
        moderatorId: administratorId,
        action: "POST_STATUS_CHANGED",
        note,
        metadata: {
          postId,
          authorId: post.authorId,
          previousStatus,
          nextStatus: status,
        },
      },
    });

    return post;
  });
}

export async function listAdminGroups({
  skip,
  take,
  search,
  visibility,
  ownerId,
}) {
  const where = {
    ...(visibility && { visibility }),
    ...(ownerId && { ownerId }),
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.group.findMany({
      where,
      skip,
      take,
      include: adminGroupInclude,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.group.count({ where }),
  ]);

  return { items, total };
}

export async function findAdminGroupById(groupId) {
  return prisma.group.findUnique({
    where: {
      id: groupId,
    },
    include: adminGroupInclude,
  });
}

export async function deleteAdminGroup({ administratorId, group }) {
  return prisma.$transaction(async (transaction) => {
    await transaction.group.delete({
      where: {
        id: group.id,
      },
    });

    await transaction.moderationAction.create({
      data: {
        moderatorId: administratorId,
        action: "GROUP_DELETED",
        note: "Suppression administrative d'un groupe.",
        metadata: {
          groupId: group.id,
          groupName: group.name,
          ownerId: group.ownerId,
          visibility: group.visibility,
        },
      },
    });

    return group;
  });
}

export async function listAdminReports({
  skip,
  take,
  status,
  targetType,
  reason,
  reporterId,
  reviewerId,
}) {
  const where = {
    ...(status && { status }),
    ...(targetType && { targetType }),
    ...(reason && { reason }),
    ...(reporterId && { reporterId }),
    ...(reviewerId && { reviewerId }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.report.findMany({
      where,
      skip,
      take,
      include: adminReportInclude,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.report.count({ where }),
  ]);

  return { items, total };
}

export async function listAdminActions({
  skip,
  take,
  action,
  moderatorId,
  targetUserId,
  reportId,
}) {
  const where = {
    ...(action && { action }),
    ...(moderatorId && { moderatorId }),
    ...(targetUserId && { targetUserId }),
    ...(reportId && { reportId }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.moderationAction.findMany({
      where,
      skip,
      take,
      include: adminActionInclude,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.moderationAction.count({ where }),
  ]);

  return { items, total };
}
