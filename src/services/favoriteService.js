import { fakeLatency } from "./api.js";
import { storageService } from "./storageService.js";
import { STORAGE_KEYS } from "../utils/constants.js";

export const favoriteService = {
  /**
   * À terme : GET /api/resources/favorites.
   * Aujourd'hui : lit le Set d'identifiants de ressources favorites.
   */
  async getFavoriteIds() {
    await fakeLatency(0);
    return new Set(storageService.get(STORAGE_KEYS.FAVORITES, []));
  },

  /**
   * À terme : POST/DELETE /api/resources/:id/favorite.
   * Aujourd'hui : bascule l'id dans le Set persisté.
   */
  async toggleFavorite(resourceId) {
    await fakeLatency(0);
    const favorites = new Set(storageService.get(STORAGE_KEYS.FAVORITES, []));

    if (favorites.has(resourceId)) {
      favorites.delete(resourceId);
    } else {
      favorites.add(resourceId);
    }

    storageService.set(STORAGE_KEYS.FAVORITES, Array.from(favorites));
    return favorites;
  },
};
