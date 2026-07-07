function mapUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    avatar: user.avatar,
  };
}

export function mapReport(report) {
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
  };
}

export function mapReportList(items) {
  return items.map(mapReport);
}
