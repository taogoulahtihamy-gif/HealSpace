import { ApiResponse } from "../../../core/responses/ApiResponse.js";
import { asyncHandler } from "../../../core/handlers/asyncHandler.js";
import { JOURNAL_MESSAGES } from "./journal.constants.js";
import * as journalService from "./journal.service.js";

export const createJournalEntry = asyncHandler(async (req, res) => {
  const entry = await journalService.createJournalEntry(
    req.user.id,
    req.body,
  );

  return ApiResponse.created(res, entry, JOURNAL_MESSAGES.CREATED);
});

export const listJournalEntries = asyncHandler(async (req, res) => {
  const result = await journalService.listJournalEntries(
    req.user.id,
    req.query,
  );

  return ApiResponse.success(res, result, JOURNAL_MESSAGES.LISTED);
});

export const getJournalSummary = asyncHandler(async (req, res) => {
  const summary = await journalService.getJournalSummary(
    req.user.id,
    req.query,
  );

  return ApiResponse.success(
    res,
    summary,
    JOURNAL_MESSAGES.SUMMARY_RETRIEVED,
  );
});

export const getJournalEntryById = asyncHandler(async (req, res) => {
  const entry = await journalService.getJournalEntryById(
    req.user.id,
    req.params.entryId,
  );

  return ApiResponse.success(res, entry, JOURNAL_MESSAGES.RETRIEVED);
});

export const updateJournalEntry = asyncHandler(async (req, res) => {
  const entry = await journalService.updateJournalEntry(
    req.user.id,
    req.params.entryId,
    req.body,
  );

  return ApiResponse.success(res, entry, JOURNAL_MESSAGES.UPDATED);
});

export const deleteJournalEntry = asyncHandler(async (req, res) => {
  await journalService.deleteJournalEntry(
    req.user.id,
    req.params.entryId,
  );

  return ApiResponse.success(res, null, JOURNAL_MESSAGES.DELETED);
});
