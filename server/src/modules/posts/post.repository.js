import { prisma } from "../../config/prisma.js";

export async function createPost(data) {
  return prisma.post.create({
    data,
    include: {
      author: true,
      media: true,
      reactions: true,
      comments: true,
    },
  });
}

export async function findPostById(id) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      media: true,
      reactions: true,
      comments: true,
    },
  });
}

export async function findPosts() {
  return prisma.post.findMany({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
    },
    include: {
      author: true,
      media: true,
      reactions: true,
      comments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function updatePost(id, data) {
  return prisma.post.update({
    where: { id },
    data,
    include: {
      author: true,
      media: true,
      reactions: true,
      comments: true,
    },
  });
}

export async function softDeletePost(id) {
  return prisma.post.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      status: "DELETED",
    },
  });
}