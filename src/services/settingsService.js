import { fakeLatency } from "./api.js";
import { storageService } from "./storageService.js";
import { STORAGE_KEYS } from "../utils/constants.js";

export const DEFAULT_SETTINGS = {
  notifyComments: true,
  notifySupports: true,
  notifyDigest: false,
  privateProfile: false,
  twoFactor: false,
};

export const settingsService = {
  /**
   * À terme : GET /api/settings. Aujourd'hui : fusionne les valeurs
   * persistées avec les valeurs par défaut (pour absorber l'ajout futur
   * de nouveaux réglages sans casser ceux déjà enregistrés).
   */
  async getSettings() {
    await fakeLatency(0);
    const stored = storageService.get(STORAGE_KEYS.SETTINGS, {});
    return { ...DEFAULT_SETTINGS, ...stored };
  },

  /**
   * À terme : PATCH /api/settings. Aujourd'hui : fusionne et persiste.
   */
  async updateSettings(current, changes) {
    await fakeLatency(0);
    const updated = { ...current, ...changes };
    storageService.set(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },
};
