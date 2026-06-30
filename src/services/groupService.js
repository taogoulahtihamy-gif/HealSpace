import { fakeLatency } from "./api.js";
import { storageService } from "./storageService.js";
import { STORAGE_KEYS } from "../utils/constants.js";

export const groupService = {
  /**
   * À terme : GET /api/groups/me (groupes rejoints par l'utilisateur connecté).
   * Aujourd'hui : lit la liste des noms de groupes rejoints depuis localStorage.
   */
  async getJoinedGroupNames() {
    await fakeLatency(0);
    return new Set(storageService.get(STORAGE_KEYS.GROUPS, []));
  },

  /**
   * À terme : POST /api/groups/:name/join ou DELETE /api/groups/:name/join.
   * Aujourd'hui : bascule le nom du groupe dans le Set persisté.
   */
  async toggleJoin(groupName) {
    await fakeLatency(0);
    const joined = new Set(storageService.get(STORAGE_KEYS.GROUPS, []));

    if (joined.has(groupName)) {
      joined.delete(groupName);
    } else {
      joined.add(groupName);
    }

    storageService.set(STORAGE_KEYS.GROUPS, Array.from(joined));
    return joined;
  },
};
