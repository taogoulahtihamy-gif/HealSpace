import { useCallback, useEffect, useState } from "react";
import { favoriteService } from "../services/favoriteService.js";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());

  useEffect(() => {
    let isMounted = true;
    favoriteService.getFavoriteIds().then((ids) => {
      if (isMounted) setFavoriteIds(ids);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const isFavorite = useCallback((id) => favoriteIds.has(id), [favoriteIds]);

  const toggleFavorite = useCallback(async (id) => {
    const updated = await favoriteService.toggleFavorite(id);
    setFavoriteIds(new Set(updated));
  }, []);

  return { isFavorite, toggleFavorite };
}
