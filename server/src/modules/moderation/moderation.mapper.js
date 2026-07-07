function mapUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    status: user.status,
  };
}

export function mapModerationAction(action) {
  if (!action) {
    return null;
  }

  return {
    id: action.id,
    action: action.action,
    note: action.note,
    metadata: action.metadata,
    createdAt: action.createdAt,
    moderator: mapUser(action.moderator),
    targetUser: mapUser(action.targetUser),
  };
}

export function mapModerationReport(report) {
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
    reporter: mapUser(report.reporter),
    reviewer: mapUser(report.reviewer),
    moderationActions:
      report.moderationActions?.map(
        mapModerationAction,
      ) ?? [],
  };
}

export function mapModerationReportList(items) {
  return items.map(mapModerationReport);
}

export function mapModeratedUser(user) {
  return mapUser(user);
}
