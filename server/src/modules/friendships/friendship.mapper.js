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
    role: user.role,
    status: user.status,
  };
}

function getOtherUser(friendship, currentUserId) {
  return friendship.userOneId === currentUserId
    ? friendship.userTwo
    : friendship.userOne;
}

export function mapFriendship(friendship, currentUserId) {
  if (!friendship) {
    return null;
  }

  return {
    id: friendship.id,
    status: friendship.status,
    requestedById: friendship.requestedById,
    direction:
      friendship.requestedById === currentUserId
        ? "OUTGOING"
        : "INCOMING",
    friend: mapUser(getOtherUser(friendship, currentUserId)),
    respondedAt: friendship.respondedAt,
    createdAt: friendship.createdAt,
    updatedAt: friendship.updatedAt,
  };
}

export function mapFriendshipList(friendships, currentUserId) {
  return friendships.map((friendship) =>
    mapFriendship(friendship, currentUserId),
  );
}
