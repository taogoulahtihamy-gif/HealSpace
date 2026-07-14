function getAuthorName(author) {
  if (!author) {
    return "Anonyme";
  }

  const fullName = [
    author.firstName,
    author.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || author.username || "Utilisateur";
}

function getInitials(author) {
  const source = getAuthorName(author);

  return source
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

function formatRelativeTime(value) {
  if (!value) {
    return "À l’instant";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "À l’instant";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return "À l’instant";
  }

  if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `Il y a ${diffHours} h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `Il y a ${diffDays} j`;
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function mapApiCommentToUiComment(apiComment) {
  const author = apiComment?.author;

  return {
    id: apiComment.id,
    postId: apiComment.postId,
    parentId: apiComment.parentId || null,
    text: apiComment.content || "",
    content: apiComment.content || "",
    author: getAuthorName(author),
    authorId: author?.id || null,
    avatar: getInitials(author),
    avatarUrl: isImageSource(author?.avatar) ? author.avatar : null,
    time: formatRelativeTime(apiComment.createdAt),
    createdAt: apiComment.createdAt,
    updatedAt: apiComment.updatedAt,
    replies: Array.isArray(apiComment.replies)
      ? apiComment.replies.map(mapApiCommentToUiComment)
      : [],
    raw: apiComment,
  };
}

export function mapApiCommentsToUiComments(response) {
  const comments =
    response?.data?.items ||
    response?.data ||
    response?.items ||
    response ||
    [];

  if (!Array.isArray(comments)) {
    return [];
  }

  return comments.map(mapApiCommentToUiComment);
}

export function extractCommentContent(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  return (
    value?.content ||
    value?.text ||
    value?.message ||
    ""
  ).trim();
}
