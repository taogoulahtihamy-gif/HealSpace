import { fakeLatency } from "./api.js";
import { storageService } from "./storageService.js";
import { generateId } from "../utils/formatters.js";
import { STORAGE_KEYS } from "../utils/constants.js";
import { journalEntries as mockEntries } from "../data/mockData.js";

export const journalService = {
  /**
   * À terme : GET /api/journal. Aujourd'hui : les entrées persistées
   * (si elles existent déjà) remplacent les entrées mock initiales —
   * exactement le même principe que PostsContext pour les publications.
   */
  async getEntries() {
    await fakeLatency(0);
    return storageService.get(STORAGE_KEYS.JOURNAL_ENTRIES, mockEntries);
  },

  /**
   * À terme : POST /api/journal. Aujourd'hui : ajoute l'entrée en tête de
   * liste et persiste l'ensemble.
   */
  async addEntry(entries, { mood, note }) {
    await fakeLatency(150);
    const newEntry = {
      id: generateId("journal"),
      date: "Aujourd’hui",
      mood,
      note,
    };
    const updated = [newEntry, ...entries];
    storageService.set(STORAGE_KEYS.JOURNAL_ENTRIES, updated);
    return updated;
  },
};
