export function toPostAuthor(author) {
  if (!author) return null;

  return {
    id: author.id,
    firstName: author.firstName,
    lastName: author.lastName,
    username: author.username,
    avatar: author.avatar,
    role: author.role,
  };
}

export function toPostResponse(post) {
  return {
    id: post.id,
    content: post.content,
    mood: post.mood,
    intention: post.intention,
    visibility: post.visibility,
    status: post.status,
    isAnonymous: post.isAnonymous,
    author: post.isAnonymous ? null : toPostAuthor(post.author),
    media: post.media || [],
    counts: {
      comments: post.comments?.length || 0,
      reactions: post.reactions?.length || 0,
    },
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

export function toPostListResponse(posts) {
  return posts.map(toPostResponse);
}