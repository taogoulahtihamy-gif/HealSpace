import { prisma } from "../../config/prisma.js";

export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function findUserByUsername(username) {
  return prisma.user.findUnique({
    where: {
      username,
    },
  });
}

export async function findUserById(id) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export async function createUser(data) {
  return prisma.user.create({
    data,
  });
}

export async function updateLastLogin(userId, lastLogin = new Date()) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      lastLogin,
    },
  });
}
