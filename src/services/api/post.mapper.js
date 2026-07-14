const MOOD_TO_EMOJI = {
  HAPPY: "😊",
  CALM: "😌",
  STRESSED: "😟",
  SAD: "😔",
  ANXIOUS: "😰",
  ANGRY: "😡",
  MOTIVATED: "💪",
  EXHAUSTED: "😮‍💨",
};

const EMOJI_TO_MOOD = {
  "😊": "HAPPY",
  "🙂": "HAPPY",
  "😄": "HAPPY",
  "😌": "CALM",
  "🌿": "CALM",
  "🧘": "CALM",
  "😟": "STRESSED",
  "😰": "ANXIOUS",
  "😢": "SAD",
  "😔": "SAD",
  "😡": "ANGRY",
  "💪": "MOTIVATED",
  "🔥": "MOTIVATED",
  "😴": "EXHAUSTED",
  "😮‍💨": "EXHAUSTED",
};

const VALID_MOODS = new Set([
  "HAPPY",
  "CALM",
  "STRESSED",
  "SAD",
  "ANXIOUS",
  "ANGRY",
  "MOTIVATED",
  "EXHAUSTED",
]);

const VALID_INTENTIONS = new Set([
  "BE_LISTENED",
  "RECEIVE_ADVICE",
  "FIND_SIMILAR_PEOPLE",
]);

const VALID_VISIBILITIES = new Set([
  "PUBLIC",
  "GROUP",
  "PRIVATE",
]);

export function isImageSource(value) {
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

function getAuthorInitial(author) {
  const source = getAuthorName(author);

  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
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

function extractMediaImage(apiPost) {
  const firstImage = apiPost?.media?.find(
    (media) =>
      media?.type === "IMAGE" ||
      media?.mimeType?.startsWith("image/") ||
      isImageSource(media?.url),
  );

  const firstMedia = firstImage || apiPost?.media?.[0];

  return firstMedia?.url || null;
}

export function mapApiPostToFeedPost(apiPost) {
  const author = apiPost?.author;
  const authorName = getAuthorName(author);
  const avatarUrl = isImageSource(author?.avatar)
    ? author.avatar
    : null;

  const reactionCount =
    apiPost?.counts?.reactions ??
    apiPost?.reactionsCount ??
    0;

  const commentCount =
    apiPost?.counts?.comments ??
    apiPost?.commentsCount ??
    0;

  return {
    id: apiPost.id,
    ownerId: author?.id || null,
    author: authorName,
    avatar: getAuthorInitial(author),
    avatarUrl,
    content: apiPost.content || "",
    mood: MOOD_TO_EMOJI[apiPost.mood] || "💬",
    moodType: apiPost.mood || null,
    intention: apiPost.intention || null,
    visibility: apiPost.visibility || "PUBLIC",
    isAnonymous: Boolean(apiPost.isAnonymous),
    group: apiPost.visibility === "PRIVATE" ? "Privé" : "Communauté",
    image: extractMediaImage(apiPost),
    support: reactionCount,
    comments: commentCount,
    shares: 0,
    time: formatRelativeTime(apiPost.createdAt),
    createdAt: apiPost.createdAt,
    updatedAt: apiPost.updatedAt,
    raw: apiPost,
  };
}

export function mapApiPostsToFeedPosts(response) {
  const posts =
    response?.data?.items ||
    response?.data ||
    response?.items ||
    response ||
    [];

  if (!Array.isArray(posts)) {
    return [];
  }

  return posts.map(mapApiPostToFeedPost);
}

export function mapFeedPayloadToApiPost(payload = {}) {
  const rawMood = payload.moodType || payload.mood;
  const mood = VALID_MOODS.has(rawMood)
    ? rawMood
    : EMOJI_TO_MOOD[rawMood];

  const intention = VALID_INTENTIONS.has(payload.intention)
    ? payload.intention
    : "BE_LISTENED";

  const visibility = VALID_VISIBILITIES.has(payload.visibility)
    ? payload.visibility
    : "PUBLIC";

  const content =
    payload.content ||
    payload.text ||
    payload.message ||
    "";

  return {
    content: content.trim(),
    mood: mood || "CALM",
    intention,
    visibility,
    isAnonymous: Boolean(payload.isAnonymous),
  };
}

export function mergePostForUpdate(currentPost, changes = {}) {
  return mapFeedPayloadToApiPost({
    content: changes.content ?? currentPost?.content,
    mood:
      changes.moodType ??
      changes.mood ??
      currentPost?.moodType ??
      currentPost?.mood,
    intention:
      changes.intention ??
      currentPost?.intention ??
      "BE_LISTENED",
    visibility:
      changes.visibility ??
      currentPost?.visibility ??
      "PUBLIC",
    isAnonymous:
      changes.isAnonymous ??
      currentPost?.isAnonymous ??
      false,
  });
}
