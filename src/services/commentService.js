import { fakeLatency } from "./api.js";
import { STORAGE_KEYS } from "../utils/constants.js";
import { generateId } from "../utils/formatters.js";

// Toute la lecture/écriture localStorage est isolée ici, exactement comme
// pour likeService.js. Le jour où un backend existera, seules ces fonctions
// privées changeront (GET /api/posts/:id/comments, POST /api/posts/:id/comments) :
// useComments et CommentSection resteront identiques.

function readAllComments() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.COMMENTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    // localStorage corrompu ou indisponible : on repart d'un état vide
    // plutôt que de casser l'application.
    return {};
  }
}

function writeAllComments(allComments) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(allComments));
}

export const commentService = {
  /**
   * À terme : GET /api/posts/:postId/comments.
   * Aujourd'hui : lit les commentaires de ce post depuis localStorage.
   */
  async getComments(postId) {
    await fakeLatency(0);
    const allComments = readAllComments();
    return allComments[postId] || [];
  },

  /**
   * À terme : POST /api/posts/:postId/comments.
   * Aujourd'hui : ajoute le commentaire à la liste persistée de ce post
   * et retourne la liste complète mise à jour.
   */
  async addComment(postId, { text, author, avatar }) {
    await fakeLatency(0);
    const allComments = readAllComments();
    const postComments = allComments[postId] || [];

    const newComment = {
      id: generateId("comment"),
      author,
      avatar,
      text,
      time: "à l’instant",
    };

    const updatedPostComments = [...postComments, newComment];
    const updatedAllComments = { ...allComments, [postId]: updatedPostComments };

    writeAllComments(updatedAllComments);
    return updatedPostComments;
  },

  /**
   * À terme : PATCH /api/comments/:commentId.
   * Aujourd'hui : remplace le texte du commentaire et marque "edited".
   * Fonctionne aussi bien pour un commentaire que pour une réponse
   * (cf. encodage du parentId géré côté CommentSection).
   */
  async updateComment(postId, commentId, newText) {
    await fakeLatency(0);
    const allComments = readAllComments();
    const postComments = allComments[postId] || [];

    const updatedPostComments = postComments.map((comment) =>
      comment.id === commentId ? { ...comment, text: newText, edited: true } : comment
    );

    writeAllComments({ ...allComments, [postId]: updatedPostComments });
    return updatedPostComments;
  },

  /**
   * À terme : DELETE /api/comments/:commentId.
   * Aujourd'hui : retire un commentaire précis (et non plus tous les
   * commentaires du post, contrairement à removePost ci-dessus).
   */
  async deleteComment(postId, commentId) {
    await fakeLatency(0);
    const allComments = readAllComments();
    const postComments = (allComments[postId] || []).filter((comment) => comment.id !== commentId);

    writeAllComments({ ...allComments, [postId]: postComments });
    return postComments;
  },

  /**
   * Nettoyage appelé quand un post est supprimé (cf. PostsContext.deletePost) :
   * retire tous les commentaires rattachés à ce post.
   */
  async removePost(postId) {
    await fakeLatency(0);
    const allComments = readAllComments();
    if (!(postId in allComments)) return allComments;

    const { [postId]: _removed, ...rest } = allComments;
    writeAllComments(rest);
    return rest;
  },

  /**
   * Utilisé par la page Profil pour afficher le nombre de commentaires
   * écrits par l'utilisateur connecté, tous posts confondus.
   */
  async getCountByAuthor(authorName) {
    await fakeLatency(0);
    const allComments = readAllComments();
    return Object.values(allComments)
      .flat()
      .filter((comment) => comment.author === authorName).length;
  },
};
