import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { posts as initialPosts } from "../data/mockData.js";
import { postsService } from "../services/postsService.js";
import { likeService } from "../services/likeService.js";
import { commentService } from "../services/commentService.js";
import { storageService } from "../services/storageService.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { STORAGE_KEYS } from "../utils/constants.js";

export const PostsContext = createContext(null);

export function PostsProvider({ children }) {
  // Au premier rendu, on relit les posts déjà persistés (créations, éditions,
  // suppressions, partages) ; s'il n'y a rien encore, on repart des données
  // mock comme avant.
  const [posts, setPosts] = useState(() => storageService.get(STORAGE_KEYS.POSTS, initialPosts));
  const { notify } = useNotifications();

  // Toute mutation de `posts` est automatiquement réécrite en localStorage,
  // donc create/update/delete/share survivent à un rechargement de page.
  useEffect(() => {
    storageService.set(STORAGE_KEYS.POSTS, posts);
  }, [posts]);

  const addPost = useCallback(
    async (payload) => {
      // Architecture prête pour l'API : postsService.create() fait aujourd'hui
      // le travail localement, mais demain il fera un vrai POST /api/posts.
      // Le composant appelant (PublishModal) n'aura rien à changer.
      const newPost = await postsService.create(payload);
      setPosts((current) => [newPost, ...current]);
      notify("Ta publication a été partagée avec la communauté ✨", "success");
      return newPost;
    },
    [notify]
  );

  const updatePost = useCallback(async (postId, changes) => {
    setPosts((current) =>
      current.map((post) => (post.id === postId ? { ...post, ...changes } : post))
    );
  }, []);

  const deletePost = useCallback(
    async (postId) => {
      setPosts((current) => current.filter((post) => post.id !== postId));
      // Nettoyage des données liées pour ne pas laisser de soutiens/commentaires
      // orphelins dans localStorage.
      await Promise.all([likeService.removePost(postId), commentService.removePost(postId)]);
      notify("Publication supprimée", "delete");
    },
    [notify]
  );

  const sharePost = useCallback(
    async (postId, { author, comment }) => {
      const original = posts.find((post) => post.id === postId);
      if (!original) return null;

      const sharedPost = await postsService.share(original, { author, comment });

      setPosts((current) => [
        sharedPost,
        ...current.map((post) =>
          post.id === postId ? { ...post, shares: (post.shares || 0) + 1 } : post
        ),
      ]);

      notify("Publication partagée dans HealSpace 🔁", "share");
      return sharedPost;
    },
    [posts, notify]
  );

  const value = useMemo(
    () => ({ posts, addPost, updatePost, deletePost, sharePost }),
    [posts, addPost, updatePost, deletePost, sharePost]
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}
