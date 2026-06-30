import { useCallback, useEffect, useState } from "react";
import { likeService } from "../services/likeService.js";
import { useNotifications } from "./useNotifications.js";

/**
 * Gère l'état "soutenu / pas soutenu" des publications pour l'utilisateur
 * courant, avec persistance (aujourd'hui localStorage via likeService,
 * demain une vraie API — le hook n'aurait alors qu'à attendre une réponse
 * serveur au lieu d'une réponse locale, sans changer son interface).
 *
 * Usage dans un composant :
 *   const { isLiked, toggleLike } = useLikes();
 *   const liked = isLiked(post.id);
 *   <button onClick={() => toggleLike(post.id)}>...</button>
 */
export function useLikes() {
  const [likedIds, setLikedIds] = useState(() => new Set());
  const { notify } = useNotifications();

  // Charge les soutiens déjà enregistrés au montage (ex: après un rechargement
  // de page), pour que les boutons "Soutenir" retrouvent leur état actif.
  useEffect(() => {
    let isMounted = true;
    likeService.getLikedIds().then((ids) => {
      if (isMounted) setLikedIds(ids);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const isLiked = useCallback((postId) => likedIds.has(postId), [likedIds]);

  const toggleLike = useCallback(
    async (postId) => {
      const wasLiked = likedIds.has(postId);
      const updatedIds = await likeService.toggleLike(postId);
      setLikedIds(new Set(updatedIds));

      // Notification uniquement quand un soutien est ajouté, pas retiré.
      if (!wasLiked) {
        notify("Tu as soutenu une publication 💙", "like");
      }
    },
    [likedIds, notify]
  );

  return { isLiked, toggleLike };
}
