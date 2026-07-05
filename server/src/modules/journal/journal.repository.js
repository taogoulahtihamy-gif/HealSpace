import { prisma } from "../../config/prisma.js";

const journalEntrySelect = {
  id: true,
  userId: true,
  title: true,
  content: true,
  mood: true,
  intensity: true,
  occurredAt: true,
  createdAt: true,
  updatedAt: true,
};

export async function createJournalEntry(data) {
  return prisma.journalEntry.create({
    data,
    select: journalEntrySelect,
  });
}

export async function findJournalEntryById(entryId, userId) {
  return prisma.journalEntry.findFirst({
    where: {
      id: entryId,
      userId,
      deletedAt: null,
    },
    select: journalEntrySelect,
  });
}

export async function listJournalEntries({
  userId,
  skip,
  take,
  mood,
  from,
  to,
}) {
  const where = buildJournalWhere({ userId, mood, from, to });

  const [items, total] = await prisma.$transaction([
    prisma.journalEntry.findMany({
      where,
      skip,
      take,
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
      select: journalEntrySelect,
    }),
    prisma.journalEntry.count({ where }),
  ]);

  return { items, total };
}

export async function updateJournalEntry(entryId, userId, data) {
  return prisma.journalEntry.update({
    where: {
      id: entryId,
      userId,
    },
    data,
    select: journalEntrySelect,
  });
}

export async function softDeleteJournalEntry(entryId, userId) {
  return prisma.journalEntry.update({
    where: {
      id: entryId,
      userId,
    },
    data: {
      deletedAt: new Date(),
    },
    select: {
      id: true,
    },
  });
}

export async function getJournalSummary({ userId, from, to }) {
  const where = buildJournalWhere({ userId, from, to });

  const [moodGroups, totals] = await prisma.$transaction([
    prisma.journalEntry.groupBy({
      by: ["mood"],
      where,
      _count: {
        _all: true,
      },
      _avg: {
        intensity: true,
      },
    }),
    prisma.journalEntry.aggregate({
      where,
      _count: {
        _all: true,
      },
      _avg: {
        intensity: true,
      },
      _min: {
        occurredAt: true,
      },
      _max: {
        occurredAt: true,
      },
    }),
  ]);

  return {
    moodGroups,
    totals,
  };
}

function buildJournalWhere({ userId, mood, from, to }) {
  const where = {
    userId,
    deletedAt: null,
  };

  if (mood) {
    where.mood = mood;
  }

  if (from || to) {
    where.occurredAt = {
      ...(from && { gte: from }),
      ...(to && { lte: to }),
    };
  }

  return where;
}
