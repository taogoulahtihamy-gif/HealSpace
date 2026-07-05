export function toMessageResponse(message) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    isRead: message.isRead,
    readAt: message.readAt,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    deletedAt: message.deletedAt,
    sender: message.sender
      ? {
          id: message.sender.id,
          firstName: message.sender.firstName,
          lastName: message.sender.lastName,
          username: message.sender.username,
          avatar: message.sender.avatar,
          role: message.sender.role,
        }
      : null,
  };
}

export function toMessageListResponse(messages) {
  return messages.map(toMessageResponse);
}
