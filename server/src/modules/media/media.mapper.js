export function toMediaResponse(media) {
  if (!media) {
    return null;
  }

  return {
    id: media.id,
    ownerId: media.ownerId,
    postId: media.postId,
    publicId: media.publicId,
    type: media.type,
    url: media.url,
    mimeType: media.mimeType,
    size: media.size,
    createdAt: media.createdAt,

    // Compatibilité temporaire avec l'ancienne réponse.
    filename: media.publicId,
    originalName: null,
    conversationId: null,
  };
}

export function toMediaListResponse(mediaList) {
  return mediaList.map(toMediaResponse);
}
