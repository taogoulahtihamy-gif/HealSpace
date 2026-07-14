function getResponseData(response) {
  return response?.data || response || null;
}

function pickArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return (
    value.items ||
    value.users ||
    value.results ||
    value.data ||
    value.rows ||
    value.list ||
    []
  );
}

function getItems(response) {
  const data = getResponseData(response);

  if (Array.isArray(data)) {
    return data;
  }

  const direct = pickArray(data);

  if (direct.length > 0) {
    return direct;
  }

  return pickArray(response);
}

function getFullName(user) {
  if (!user) {
    return "Utilisateur";
  }

  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.username || user.email || "Utilisateur";
}

function getInitials(user) {
  return getFullName(user)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function isImageSource(value) {
  return (
    typeof value === "string" &&
    (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:image/") ||
      value.startsWith("blob:")
    )
  );
}

export function formatMessageTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatConversationDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return formatMessageTime(value);
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

export function mapApiMessageToUiMessage(apiMessage) {
  const sender = apiMessage?.sender;

  return {
    id: apiMessage.id,
    conversationId: apiMessage.conversationId,
    senderId: apiMessage.senderId,
    content: apiMessage.content || "",
    isRead: Boolean(apiMessage.isRead),
    readAt: apiMessage.readAt || null,
    createdAt: apiMessage.createdAt,
    updatedAt: apiMessage.updatedAt,
    deletedAt: apiMessage.deletedAt,
    time: formatMessageTime(apiMessage.createdAt),
    sender: sender
      ? {
          id: sender.id,
          name: getFullName(sender),
          initials: getInitials(sender),
          avatar: isImageSource(sender.avatar) ? sender.avatar : null,
          role: sender.role,
        }
      : null,
    raw: apiMessage,
  };
}

export function mapApiMessagesToUiMessages(response) {
  return getItems(response).map(mapApiMessageToUiMessage);
}

export function mapApiConversationToUiConversation(
  apiConversation,
  currentUserId,
) {
  const participants = apiConversation?.participants || [];

  const otherParticipants = participants
    .map((participant) => participant.user)
    .filter(Boolean)
    .filter((user) => user.id !== currentUserId);

  const fallbackParticipant =
    participants.map((participant) => participant.user).find(Boolean);

  const mainParticipant =
    otherParticipants[0] || fallbackParticipant || null;

  const title =
    apiConversation?.title ||
    otherParticipants.map(getFullName).join(", ") ||
    getFullName(mainParticipant);

  const avatarUser = mainParticipant;

  return {
    id: apiConversation.id,
    type: apiConversation.type,
    title,
    participants,
    participantCount: participants.length,
    avatar:
      avatarUser && isImageSource(avatarUser.avatar)
        ? avatarUser.avatar
        : null,
    initials: avatarUser ? getInitials(avatarUser) : "HS",
    createdAt: apiConversation.createdAt,
    updatedAt: apiConversation.updatedAt,
    time: formatConversationDate(
      apiConversation.updatedAt || apiConversation.createdAt,
    ),
    raw: apiConversation,
  };
}

export function mapApiConversationsToUiConversations(
  response,
  currentUserId,
) {
  return getItems(response).map((conversation) =>
    mapApiConversationToUiConversation(
      conversation,
      currentUserId,
    ),
  );
}

export function mapApiUserToSearchResult(user) {
  return {
    id: user.id,
    name: getFullName(user),
    username: user.username,
    email: user.email,
    avatar: isImageSource(user.avatar) ? user.avatar : null,
    initials: getInitials(user),
    raw: user,
  };
}

export function mapApiUsersToSearchResults(response) {
  return getItems(response)
    .filter((user) => user?.id)
    .map(mapApiUserToSearchResult);
}

export function extractData(response) {
  return getResponseData(response);
}
