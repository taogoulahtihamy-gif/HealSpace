import { prisma } from "../../config/prisma.js";

export async function createComment(data) {
  return prisma.comment.create({
    data,
    include: {
      author: true,
      replies: true,
    },
  });
}

export async function findCommentById(id) {
  return prisma.comment.findUnique({
    where: { id },
    include: {
      author: true,
      post: true,
      replies: true,
    },
  });
}

export async function findCommentsByPostId(postId) {
  return prisma.comment.findMany({
    where: {
      postId,
      parentId: null,
      deletedAt: null,
    },
    include: {
      author: true,
      replies: {
        where: {
          deletedAt: null,
        },
        include: {
          author: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function updateComment(id, data) {
  return prisma.comment.update({
    where: { id },
    data,
    include: {
      author: true,
      replies: true,
    },
  });
}

export async function softDeleteComment(id) {
  return prisma.comment.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
