import { prisma } from "../../config/prisma.js";

export async function findPostById(id) {
  return prisma.post.findUnique({
    where: { id },
  });
}

export async function upsertReaction({ userId, postId, type }) {
  return prisma.reaction.upsert({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
    update: {
      type,
    },
    create: {
      userId,
      postId,
      type,
    },
    include: {
      user: true,
    },
  });
}

export async function findReactionByUserAndPost(userId, postId) {
  return prisma.reaction.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
    include: {
      user: true,
    },
  });
}

export async function findReactionsByPostId(postId) {
  return prisma.reaction.findMany({
    where: { postId },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function deleteReactionByUserAndPost(userId, postId) {
  return prisma.reaction.delete({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });
}
