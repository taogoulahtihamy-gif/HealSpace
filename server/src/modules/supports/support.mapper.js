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

export function mapSupportRequest(
  supportRequest,
  currentUserId,
) {
  if (!supportRequest) {
    return null;
  }

  const isParticipant =
    supportRequest.requesterId === currentUserId ||
    supportRequest.supporterId === currentUserId;

  const hideRequester =
    supportRequest.isAnonymous && !isParticipant;

  return {
    id: supportRequest.id,
    type: supportRequest.type,
    message: supportRequest.message,
    isAnonymous: supportRequest.isAnonymous,
    status: supportRequest.status,

    requester: hideRequester
      ? null
      : mapUser(supportRequest.requester),

    supporter: mapUser(supportRequest.supporter),

    acceptedAt: supportRequest.acceptedAt,
    completedAt: supportRequest.completedAt,
    cancelledAt: supportRequest.cancelledAt,
    createdAt: supportRequest.createdAt,
    updatedAt: supportRequest.updatedAt,
  };
}

export function mapSupportRequestList(
  items,
  currentUserId,
) {
  return items.map((item) =>
    mapSupportRequest(item, currentUserId),
  );
}
