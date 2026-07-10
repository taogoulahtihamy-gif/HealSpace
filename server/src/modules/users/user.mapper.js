export function toPrivateUserProfile(user) {
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
    coverPhoto: user.coverPhoto,
    bio: user.bio,
    birthDate: user.birthDate,
    gender: user.gender,
    country: user.country,
    city: user.city,
    language: user.language,
    timezone: user.timezone,
    role: user.role,
    status: user.status,
    visibility: user.visibility,
    currentMood: user.currentMood,
    isVerified: user.isVerified,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    isPrivate: user.isPrivate,
    allowAI: user.allowAI,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toPublicUserProfile(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    avatar: user.avatar,
    coverPhoto: user.coverPhoto,
    bio: user.bio,
    country: user.country,
    city: user.city,
    role: user.role,
    currentMood: user.currentMood,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}

function toFriendshipSearchResponse(friendship, currentUserId) {
  if (!friendship) {
    return null;
  }

  return {
    friendshipId: friendship.id,
    status: friendship.status,
    requestedById: friendship.requestedById,
    direction:
      friendship.requestedById === currentUserId
        ? "OUTGOING"
        : "INCOMING",
  };
}

export function toUserSearchResponse(user, currentUserId) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    country: user.country,
    city: user.city,
    role: user.role,
    currentMood: user.currentMood,
    isVerified: user.isVerified,
    friendship: toFriendshipSearchResponse(
      user.friendship,
      currentUserId,
    ),
  };
}

export function toUserSearchList(users, currentUserId) {
  return users.map((user) => toUserSearchResponse(user, currentUserId));
}
