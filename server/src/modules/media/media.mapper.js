export function toMediaResponse(media) {
  return {
    id: media.id,
    filename: media.filename,
    originalName: media.originalName,
    mimeType: media.mimeType,
    size: media.size,
    url: media.url,
    ownerId: media.ownerId,
    postId: media.postId,
    conversationId: media.conversationId,
    createdAt: media.createdAt,
  };
}

export function toMediaListResponse(mediaList) {
  return mediaList.map(toMediaResponse);
}
