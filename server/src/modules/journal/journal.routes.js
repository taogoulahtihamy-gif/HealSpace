import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntryById,
  getJournalSummary,
  listJournalEntries,
  updateJournalEntry,
} from "./journal.controller.js";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
} from "./journal.validator.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  validate(createJournalEntrySchema),
  createJournalEntry,
);
router.get("/", listJournalEntries);

// Cette route doit rester avant "/:entryId".
router.get("/summary", getJournalSummary);

router.get("/:entryId", getJournalEntryById);
router.patch(
  "/:entryId",
  validate(updateJournalEntrySchema),
  updateJournalEntry,
);
router.delete("/:entryId", deleteJournalEntry);

export default router;
