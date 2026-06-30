// Wrapper générique autour de localStorage.
// Centralise le try/catch JSON.parse/JSON.stringify déjà dupliqué dans
// likeService et commentService, pour les nouveaux services (posts, groupes)
// sans toucher au comportement existant de ces deux fichiers.

export const storageService = {
  get(key, fallback) {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      // Donnée corrompue ou localStorage indisponible : on retombe sur la
      // valeur par défaut plutôt que de casser l'application.
      return fallback;
    }
  },

  set(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota dépassé ou navigation privée stricte : on ignore silencieusement,
      // l'app continue de fonctionner en mémoire pour la session en cours.
    }
  },

  remove(key) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};
