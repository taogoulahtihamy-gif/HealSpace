export function toReactionUser(user) {
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
  };
}

export function toReactionResponse(reaction) {
  return {
    id: reaction.id,
    type: reaction.type,
    postId: reaction.postId,
    user: toReactionUser(reaction.user),
    createdAt: reaction.createdAt,
  };
}

export function toReactionListResponse(reactions) {
  return reactions.map(toReactionResponse);
}

export function toReactionSummaryResponse(reactions) {
  const summary = {
    LIKE: 0,
    LOVE: 0,
    HUG: 0,
    SUPPORT: 0,
    THANKS: 0,
    INSIGHTFUL: 0,
  };

  for (const reaction of reactions) {
    summary[reaction.type] = (summary[reaction.type] || 0) + 1;
  }

  return {
    total: reactions.length,
    summary,
  };
}
