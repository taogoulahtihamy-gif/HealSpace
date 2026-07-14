import {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  getPostReactionSummary,
  getPostReactions,
  reactToPost,
  removePostReaction,
} from "../services/api/reactions.api.js";
import { STORAGE_KEYS } from "../utils/constants.js";

const FALLBACK_KEY =
  STORAGE_KEYS?.LIKED_POSTS || "healspace:liked-posts";

function readLikedSet() {
  try {
    const raw = window.localStorage.getItem(FALLBACK_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function writeLikedSet(set) {
  window.localStorage.setItem(
    FALLBACK_KEY,
    JSON.stringify(Array.from(set)),
  );
}

function extractReactionList(response) {
  const reactions =
    response?.data?.items ||
    response?.data ||
    response?.items ||
    response ||
    [];

  return Array.isArray(reactions) ? reactions : [];
}

function extractReactionTotal(response) {
  return (
    response?.data?.total ??
    response?.total ??
    response?.data?.count ??
    response?.count ??
    null
  );
}

export function useLikes() {
  const [likedByPost, setLikedByPost] = useState(() => {
    const likedSet = readLikedSet();
    const initial = {};

    likedSet.forEach((postId) => {
      initial[postId] = true;
    });

    return initial;
  });

  const [countByPost, setCountByPost] = useState({});

  const isLiked = useCallback(
    (postId) => Boolean(likedByPost[postId]),
    [likedByPost],
  );

  const getSupportCount = useCallback(
    (postId, fallback = 0) =>
      countByPost[postId] ?? fallback,
    [countByPost],
  );

  const persistLikedState = useCallback((postId, liked) => {
    const likedSet = readLikedSet();

    if (liked) {
      likedSet.add(postId);
    } else {
      likedSet.delete(postId);
    }

    writeLikedSet(likedSet);

    setLikedByPost((current) => ({
      ...current,
      [postId]: liked,
    }));
  }, []);

  const loadReactionState = useCallback(
    async (postId, currentUserId) => {
      if (!postId) {
        return;
      }

      try {
        const [reactionsResponse, summaryResponse] =
          await Promise.all([
            getPostReactions(postId),
            getPostReactionSummary(postId),
          ]);

        const reactions = extractReactionList(reactionsResponse);
        const total =
          extractReactionTotal(summaryResponse) ??
          reactions.length;

        const currentUserHasReacted = reactions.some(
          (reaction) => reaction?.user?.id === currentUserId,
        );

        setCountByPost((current) => ({
          ...current,
          [postId]: total,
        }));

        persistLikedState(postId, currentUserHasReacted);
      } catch {
        // Le composant garde l’état local existant si l’API refuse
        // temporairement la lecture.
      }
    },
    [persistLikedState],
  );

  const toggleLike = useCallback(
    async (postId) => {
      const currentlyLiked = Boolean(likedByPost[postId]);

      // Optimistic UI
      persistLikedState(postId, !currentlyLiked);

      setCountByPost((current) => {
        const currentCount = current[postId] ?? 0;

        return {
          ...current,
          [postId]: Math.max(
            0,
            currentCount + (currentlyLiked ? -1 : 1),
          ),
        };
      });

      try {
        if (currentlyLiked) {
          await removePostReaction(postId);
        } else {
          await reactToPost(postId, "SUPPORT");
        }

        const summaryResponse =
          await getPostReactionSummary(postId);

        const total = extractReactionTotal(summaryResponse);

        if (typeof total === "number") {
          setCountByPost((current) => ({
            ...current,
            [postId]: total,
          }));
        }
      } catch (error) {
        // Rollback si l’API échoue.
        persistLikedState(postId, currentlyLiked);

        setCountByPost((current) => {
          const currentCount = current[postId] ?? 0;

          return {
            ...current,
            [postId]: Math.max(
              0,
              currentCount + (currentlyLiked ? 1 : -1),
            ),
          };
        });

        throw error;
      }
    },
    [likedByPost, persistLikedState],
  );

  return useMemo(
    () => ({
      isLiked,
      toggleLike,
      loadReactionState,
      getSupportCount,
    }),
    [
      isLiked,
      toggleLike,
      loadReactionState,
      getSupportCount,
    ],
  );
}
