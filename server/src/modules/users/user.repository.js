import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";

const privateProfileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  email: true,
  phone: true,
  avatar: true,
  coverPhoto: true,
  bio: true,
  birthDate: true,
  gender: true,
  country: true,
  city: true,
  language: true,
  timezone: true,
  role: true,
  status: true,
  visibility: true,
  currentMood: true,
  isVerified: true,
  emailVerified: true,
  phoneVerified: true,
  isPrivate: true,
  allowAI: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
};

const publicProfileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  avatar: true,
  coverPhoto: true,
  bio: true,
  country: true,
  city: true,
  role: true,
  status: true,
  visibility: true,
  currentMood: true,
  isVerified: true,
  isPrivate: true,
  createdAt: true,
};

export async function findUserById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function findPrivateProfileById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: privateProfileSelect,
  });
}

export async function findPublicProfileById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: publicProfileSelect,
  });
}

export async function findUserByUsername(username) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
    },
  });
}

async function findFriendshipsForUsers(currentUserId, userIds) {
  if (userIds.length === 0) {
    return new Map();
  }

  const pairs = userIds.map((targetUserId) => {
    const [userOneId, userTwoId] = [currentUserId, targetUserId].sort();

    return {
      userOneId,
      userTwoId,
    };
  });

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: pairs,
    },
    select: {
      id: true,
      userOneId: true,
      userTwoId: true,
      requestedById: true,
      status: true,
    },
  });

  return new Map(
    friendships.map((friendship) => {
      const targetUserId =
        friendship.userOneId === currentUserId
          ? friendship.userTwoId
          : friendship.userOneId;

      return [targetUserId, friendship];
    }),
  );
}

export async function searchVisibleUsers({
  currentUserId,
  query,
  skip,
  take,
}) {
  const visibilityClause = Prisma.sql`
    u."isPrivate" = FALSE
    AND (
      u."visibility" = 'PUBLIC'
      OR (
        u."visibility" = 'FRIENDS'
        AND EXISTS (
          SELECT 1
          FROM "friendships" AS f
          WHERE f."status" = 'ACCEPTED'
            AND (
              (
                f."userOneId" = u."id"
                AND f."userTwoId" = ${currentUserId}
              )
              OR (
                f."userTwoId" = u."id"
                AND f."userOneId" = ${currentUserId}
              )
            )
        )
      )
    )
  `;

  const searchClause = Prisma.sql`
    (
      POSITION(LOWER(${query}) IN LOWER(u."username")) > 0
      OR POSITION(LOWER(${query}) IN LOWER(u."firstName")) > 0
      OR POSITION(LOWER(${query}) IN LOWER(u."lastName")) > 0
      OR POSITION(
        LOWER(${query})
        IN LOWER(CONCAT(
          u."firstName",
          ' ',
          u."lastName"
        ))
      ) > 0
    )
  `;

  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw`
      SELECT
        u."id",
        u."firstName",
        u."lastName",
        u."username",
        u."avatar",
        u."bio",
        u."country",
        u."city",
        u."role",
        u."currentMood",
        u."isVerified",
        u."createdAt",
        CASE
          WHEN LOWER(u."username") = LOWER(${query}) THEN 0
          WHEN LEFT(
            LOWER(u."username"),
            LENGTH(${query})
          ) = LOWER(${query}) THEN 1
          WHEN LOWER(CONCAT(
            u."firstName",
            ' ',
            u."lastName"
          )) = LOWER(${query}) THEN 2
          WHEN LOWER(u."firstName") = LOWER(${query})
            OR LOWER(u."lastName") = LOWER(${query}) THEN 3
          WHEN LEFT(
            LOWER(u."firstName"),
            LENGTH(${query})
          ) = LOWER(${query})
            OR LEFT(
              LOWER(u."lastName"),
              LENGTH(${query})
            ) = LOWER(${query}) THEN 4
          ELSE 5
        END AS "relevance"
      FROM "User" AS u
      WHERE u."id" <> ${currentUserId}
        AND u."status" = 'ACTIVE'
        AND ${visibilityClause}
        AND ${searchClause}
      ORDER BY
        "relevance" ASC,
        LOWER(u."username") ASC,
        u."id" ASC
      LIMIT ${take}
      OFFSET ${skip}
    `,
    prisma.$queryRaw`
      SELECT COUNT(*)::int AS "total"
      FROM "User" AS u
      WHERE u."id" <> ${currentUserId}
        AND u."status" = 'ACTIVE'
        AND ${visibilityClause}
        AND ${searchClause}
    `,
  ]);

  const userIds = rows.map((user) => user.id);
  const friendships = await findFriendshipsForUsers(
    currentUserId,
    userIds,
  );

  return {
    items: rows.map(({ relevance: _relevance, ...user }) => ({
      ...user,
      friendship: friendships.get(user.id) || null,
    })),
    total: Number(countRows[0]?.total || 0),
  };
}

export async function updateUserProfile(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: privateProfileSelect,
  });
}

export async function updateUserPrivacy(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: privateProfileSelect,
  });
}

export async function updatePasswordAndRevokeSessions(
  userId,
  password,
) {
  return prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: userId },
      data: { password },
    });

    await transaction.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  });
}

export async function deactivateUserAndRevokeSessions(userId) {
  return prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: userId },
      data: {
        status: "INACTIVE",
      },
    });

    await transaction.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  });
}

export async function areUsersFriends(firstUserId, secondUserId) {
  const [userOneId, userTwoId] = [firstUserId, secondUserId].sort();

  const friendship = await prisma.friendship.findUnique({
    where: {
      userOneId_userTwoId: {
        userOneId,
        userTwoId,
      },
    },
    select: {
      status: true,
    },
  });

  return friendship?.status === "ACCEPTED";
}
