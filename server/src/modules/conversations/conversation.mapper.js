function toConversationUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    avatar: user.avatar,
    role: user.role,
  };
}

export function toConversationParticipant(participant) {
  return {
    id: participant.id,
    user: toConversationUser(participant.user),
    joinedAt: participant.joinedAt,
  };
}

export function toConversationResponse(conversation) {
  return {
    id: conversation.id,
    type: conversation.type,
    title: conversation.title,
    participants: conversation.participants?.map(toConversationParticipant) || [],
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

export function toConversationListResponse(conversations) {
  return conversations.map(toConversationResponse);
}
