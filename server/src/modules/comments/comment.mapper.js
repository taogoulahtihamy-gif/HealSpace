export function toCommentAuthor(author) {
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

export function toCommentResponse(comment) {
  return {
    id: comment.id,
    postId: comment.postId,
    parentId: comment.parentId,
    content: comment.content,
    author: toCommentAuthor(comment.author),
    replies: comment.replies?.map(toCommentResponse) || [],
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

export function toCommentListResponse(comments) {
  return comments.map(toCommentResponse);
}
