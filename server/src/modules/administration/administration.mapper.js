function mapBasicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function mapAdminUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...mapBasicUser(user),
    coverPhoto: user.coverPhoto,
    bio: user.bio,
    birthDate: user.birthDate,
    gender: user.gender,
    country: user.country,
    city: user.city,
    language: user.language,
    timezone: user.timezone,
    visibility: user.visibility,
    currentMood: user.currentMood,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    isPrivate: user.isPrivate,
    allowAI: user.allowAI,
    lastLogin: user.lastLogin,
    counts: user._count
      ? {
          posts: user._count.posts,
          comments: user._count.comments,
          reactions: user._count.reactions,
          ownedGroups: user._count.groups,
          groupMemberships: user._count.groupMembers,
          reportsMade: user._count.reportsMade,
          reportsReviewed: user._count.reportsReviewed,
          supportRequests: user._count.supportRequests,
          providedSupports: user._count.providedSupports,
          friendships:
            user._count.friendshipsAsUserOne +
            user._count.friendshipsAsUserTwo,
        }
      : undefined,
  };
}

export function mapAdminUserList(users) {
  return users.map(mapAdminUser);
}

export function mapAdminPost(post) {
  if (!post) {
    return null;
  }

  return {
    id: post.id,
    content: post.content,
    mood: post.mood,
    intention: post.intention,
    visibility: post.visibility,
    status: post.status,
    isAnonymous: post.isAnonymous,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    deletedAt: post.deletedAt,
    author: mapBasicUser(post.author),
    counts: post._count
      ? {
          comments: post._count.comments,
          reactions: post._count.reactions,
          media: post._count.media,
        }
      : undefined,
  };
}

export function mapAdminPostList(posts) {
  return posts.map(mapAdminPost);
}

export function mapAdminGroup(group) {
  if (!group) {
    return null;
  }

  return {
    id: group.id,
    name: group.name,
    slug: group.slug,
    description: group.description,
    coverUrl: group.coverUrl,
    visibility: group.visibility,
    ownerId: group.ownerId,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    owner: mapBasicUser(group.owner),
    membersCount: group._count?.members ?? 0,
  };
}

export function mapAdminGroupList(groups) {
  return groups.map(mapAdminGroup);
}

export function mapAdminReport(report) {
  if (!report) {
    return null;
  }

  return {
    id: report.id,
    targetType: report.targetType,
    targetId: report.targetId,
    reason: report.reason,
    description: report.description,
    status: report.status,
    resolutionNote: report.resolutionNote,
    reviewedAt: report.reviewedAt,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    reporter: mapBasicUser(report.reporter),
    reviewer: mapBasicUser(report.reviewer),
  };
}

export function mapAdminReportList(reports) {
  return reports.map(mapAdminReport);
}

export function mapAdminAction(action) {
  if (!action) {
    return null;
  }

  return {
    id: action.id,
    action: action.action,
    note: action.note,
    metadata: action.metadata,
    createdAt: action.createdAt,
    moderator: mapBasicUser(action.moderator),
    targetUser: mapBasicUser(action.targetUser),
    report: action.report
      ? {
          id: action.report.id,
          targetType: action.report.targetType,
          targetId: action.report.targetId,
          reason: action.report.reason,
          status: action.report.status,
        }
      : null,
  };
}

export function mapAdminActionList(actions) {
  return actions.map(mapAdminAction);
}
