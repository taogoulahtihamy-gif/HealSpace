import { fakeLatency } from "./api.js";
import { STORAGE_KEYS } from "../utils/constants.js";

// Toute la logique de lecture/écriture localStorage est isolée ici.
// Le jour où un backend existera, seules ces deux fonctions privées
// changeront (remplacées par des appels fetch/api.get/api.post) :
// le hook useLikes et les composants resteront identiques.

function readLikedIds() {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.LIKES);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    // localStorage corrompu ou indisponible : on repart d'un état vide
    // plutôt que de casser l'application.
    return new Set();
  }
}

function writeLikedIds(likedIds) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(Array.from(likedIds)));
}

export const likeService = {
  /**
   * À terme : GET /api/likes (les soutiens de l'utilisateur connecté).
   * Aujourd'hui : lit le Set d'identifiants de posts soutenus dans localStorage.
   */
  async getLikedIds() {
    await fakeLatency(0);
    return readLikedIds();
  },

  /**
   * À terme : POST /api/posts/:id/like ou DELETE /api/posts/:id/like
   * selon l'état courant. Aujourd'hui : bascule l'id dans le Set persisté.
   * Retourne le nouvel ensemble d'identifiants soutenus.
   */
  async toggleLike(postId) {
    await fakeLatency(0);
    const likedIds = readLikedIds();

    if (likedIds.has(postId)) {
      likedIds.delete(postId);
    } else {
      likedIds.add(postId);
    }

    writeLikedIds(likedIds);
    return likedIds;
  },

  /**
   * Nettoyage appelé quand un post est supprimé (cf. PostsContext.deletePost) :
   * retire son id du Set de soutiens pour ne pas laisser de référence morte.
   */
  async removePost(postId) {
    await fakeLatency(0);
    const likedIds = readLikedIds();
    likedIds.delete(postId);
    writeLikedIds(likedIds);
    return likedIds;
  },
};
