import { prisma } from "../../config/prisma.js";

export async function createMedia(data) {
  return prisma.media.create({
    data: {
      ownerId: data.ownerId,
      postId: data.postId || null,
      publicId: data.publicId || data.filename,
      type: data.type || "IMAGE",
      url: data.url,
      mimeType: data.mimeType || null,
      size: data.size || null,
    },
  });
}

export async function findMediaById(id) {
  return prisma.media.findUnique({
    where: { id },
    include: {
      owner: true,
      post: true,
    },
  });
}

export async function findMediaByOwner(ownerId) {
  return prisma.media.findMany({
    where: {
      ownerId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function deleteMedia(id) {
  return prisma.media.delete({
    where: { id },
  });
}