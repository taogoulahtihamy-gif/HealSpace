import { fakeLatency } from "./api.js";
import { generateId } from "../utils/formatters.js";

/**
 * Construit un objet "post" cohérent avec le format attendu par <PostCard />,
 * à partir des champs saisis dans la popup de publication.
 */
export function buildPost({ content, mood, group, anonymous, author, image, challenge, intent, visibility }) {
  return {
    id: generateId("post"),
    // ownerId identifie l'auteur réel même pour un post anonyme : il sert
    // uniquement à autoriser "Modifier"/"Supprimer", jamais affiché à l'écran.
    ownerId: author?.id || null,
    author: anonymous ? `Anonyme #${Math.floor(1000 + Math.random() * 9000)}` : author.name,
    avatar: anonymous ? "A" : author.initial,
    group: group || "Pour toi",
    time: "à l’instant",
    mood: mood?.emoji || "💬",
    content,
    image: image || null,
    challenge: challenge || null,
    // Stockés pour un usage futur (ex: IA), jamais affichés publiquement.
    intent: intent || null,
    visibility: visibility || "public",
    support: 0,
    comments: 0,
    shares: 0,
    anonymous: Boolean(anonymous),
  };
}

/**
 * Construit le post "partage" qui apparaît dans le feed quand quelqu'un
 * choisit "Partager dans HealSpace" : il garde une référence légère vers
 * le post original (sharedFrom) pour afficher la carte imbriquée.
 */
export function buildSharePost(originalPost, { author, comment }) {
  return {
    id: generateId("post"),
    ownerId: author?.id || null,
    author: author?.name || "Toi",
    avatar: author?.initial || "T",
    group: originalPost.group,
    time: "à l’instant",
    mood: "🔁",
    content: comment || "",
    image: null,
    support: 0,
    comments: 0,
    shares: 0,
    anonymous: false,
    sharedFrom: {
      author: originalPost.author,
      avatar: originalPost.avatar,
      content: originalPost.content,
      group: originalPost.group,
      mood: originalPost.mood,
      image: originalPost.image || null,
    },
  };
}

export const postsService = {
  /**
   * À terme : GET /api/posts (pagination, filtres par groupe...).
   * Aujourd'hui : retourne simplement les données mock après un court délai.
   */
  async fetchAll(initialPosts) {
    await fakeLatency(200);
    return initialPosts;
  },

  /**
   * À terme : POST /api/posts. Aujourd'hui : construit le post côté client.
   */
  async create(payload) {
    await fakeLatency(200);
    return buildPost(payload);
  },

  /**
   * À terme : PATCH /api/posts/:id. Aujourd'hui : fusionne les changements
   * dans l'objet post existant.
   */
  async update(post, changes) {
    await fakeLatency(150);
    return { ...post, ...changes };
  },

  /**
   * À terme : POST /api/posts/:id/share. Aujourd'hui : construit le post
   * de partage côté client.
   */
  async share(originalPost, payload) {
    await fakeLatency(150);
    return buildSharePost(originalPost, payload);
  },
};
