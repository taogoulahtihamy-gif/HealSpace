import { AppError } from "../../../core/errors/AppError.js";
import {
  JOURNAL_LIMITS,
  JOURNAL_MESSAGES,
  JOURNAL_MOODS,
} from "./journal.constants.js";
import {
  mapJournalEntry,
  mapJournalSummary,
} from "./journal.mapper.js";
import * as journalRepository from "./journal.repository.js";

function normalizePagination(query = {}) {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);

  const page =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : JOURNAL_LIMITS.DEFAULT_PAGE;

  const requestedLimit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : JOURNAL_LIMITS.DEFAULT_LIMIT;

  const limit = Math.min(requestedLimit, JOURNAL_LIMITS.MAX_LIMIT);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function createPaginatedResult(items, total, page, limit) {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

function normalizeMood(mood) {
  if (typeof mood !== "string" || !mood.trim()) {
    return null;
  }

  const normalizedMood = mood.trim().toUpperCase();

  if (!Object.values(JOURNAL_MOODS).includes(normalizedMood)) {
    throw new AppError(JOURNAL_MESSAGES.INVALID_MOOD, 400);
  }

  return normalizedMood;
}

function parseDate(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(JOURNAL_MESSAGES.INVALID_DATE, 400);
  }

  return date;
}

function normalizeDateRange(query = {}) {
  const from = parseDate(query.from);
  const to = parseDate(query.to);

  if (from && to && from > to) {
    throw new AppError(JOURNAL_MESSAGES.INVALID_DATE_RANGE, 400);
  }

  return { from, to };
}

async function getRequiredJournalEntry(entryId, userId) {
  const entry = await journalRepository.findJournalEntryById(
    entryId,
    userId,
  );

  if (!entry) {
    throw new AppError(JOURNAL_MESSAGES.NOT_FOUND, 404);
  }

  return entry;
}

function normalizeInput(input) {
  return {
    ...input,
    title: input.title ?? null,
    intensity: input.intensity ?? null,
    ...(input.occurredAt && {
      occurredAt: new Date(input.occurredAt),
    }),
  };
}

export async function createJournalEntry(userId, input) {
  const entry = await journalRepository.createJournalEntry({
    userId,
    ...normalizeInput(input),
  });

  return mapJournalEntry(entry);
}

export async function listJournalEntries(userId, query = {}) {
  const { page, limit, skip } = normalizePagination(query);
  const mood = normalizeMood(query.mood);
  const { from, to } = normalizeDateRange(query);

  const { items, total } = await journalRepository.listJournalEntries({
    userId,
    skip,
    take: limit,
    mood,
    from,
    to,
  });

  return createPaginatedResult(
    items.map(mapJournalEntry),
    total,
    page,
    limit,
  );
}

export async function getJournalEntryById(userId, entryId) {
  const entry = await getRequiredJournalEntry(entryId, userId);
  return mapJournalEntry(entry);
}

export async function updateJournalEntry(userId, entryId, input) {
  await getRequiredJournalEntry(entryId, userId);

  const data = { ...input };

  if (Object.prototype.hasOwnProperty.call(input, "occurredAt")) {
    data.occurredAt = new Date(input.occurredAt);
  }

  const entry = await journalRepository.updateJournalEntry(
    entryId,
    userId,
    data,
  );

  return mapJournalEntry(entry);
}

export async function deleteJournalEntry(userId, entryId) {
  await getRequiredJournalEntry(entryId, userId);
  await journalRepository.softDeleteJournalEntry(entryId, userId);
  return null;
}

export async function getJournalSummary(userId, query = {}) {
  const { from, to } = normalizeDateRange(query);
  const { moodGroups, totals } =
    await journalRepository.getJournalSummary({
      userId,
      from,
      to,
    });

  const moods = moodGroups
    .map((group) => ({
      mood: group.mood,
      count: group._count._all,
      averageIntensity: group._avg.intensity,
    }))
    .sort((a, b) => b.count - a.count);

  const summary = {
    totalEntries: totals._count._all,
    averageIntensity: totals._avg.intensity,
    dominantMood: moods[0]?.mood ?? null,
    firstOccurredAt: totals._min.occurredAt,
    lastOccurredAt: totals._max.occurredAt,
    moods,
  };

  return mapJournalSummary(summary);
}
