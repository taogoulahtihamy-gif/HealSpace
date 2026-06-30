import { useCallback, useEffect, useState } from "react";
import { commentService } from "../services/commentService.js";
import { useNotifications } from "./useNotifications.js";

/**
 * Gère les commentaires d'une publication précise, avec persistance
 * (aujourd'hui localStorage via commentService, demain une vraie API —
 * le hook n'aurait alors qu'à attendre une réponse serveur au lieu d'une
 * réponse locale, sans changer son interface).
 *
 * Usage dans un composant :
 *   const { comments, addComment, updateComment, deleteComment } = useComments(post.id);
 */
export function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotifications();

  // Charge les commentaires déjà enregistrés au montage (ex: après un
  // rechargement de page), pour que la liste reste visible.
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    commentService.getComments(postId).then((list) => {
      if (isMounted) {
        setComments(list);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [postId]);

  const addComment = useCallback(
    async (payload) => {
      const updatedComments = await commentService.addComment(postId, payload);
      setComments(updatedComments);
      notify("Commentaire ajouté 💬", "comment");
    },
    [postId, notify]
  );

  const updateComment = useCallback(
    async (commentId, newText) => {
      const updatedComments = await commentService.updateComment(postId, commentId, newText);
      setComments(updatedComments);
    },
    [postId]
  );

  const deleteComment = useCallback(
    async (commentId) => {
      const updatedComments = await commentService.deleteComment(postId, commentId);
      setComments(updatedComments);
    },
    [postId]
  );

  return { comments, addComment, updateComment, deleteComment, isLoading };
}
