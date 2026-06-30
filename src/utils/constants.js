// Centralise toutes les valeurs "magiques" du projet.
// Objectif : un seul endroit à modifier quand l'app grandit (plus de groupes,
// plus d'humeurs, nouvelles routes...) au lieu de chercher dans chaque fichier.

export const ROUTES = {
  LOGIN: "/login",
  HOME: "/",
  GROUPS: "/groupes",
  MESSAGES: "/messages",
  JOURNAL: "/journal",
  RESOURCES: "/ressources",
  EMERGENCY: "/urgence",
  PROFILE: "/profil",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/parametres",
};

export const MOODS = [
  { id: "happy", emoji: "😊", label: "Heureux", color: "#22c55e" },
  { id: "sad", emoji: "😔", label: "Triste", color: "#3b82f6" },
  { id: "angry", emoji: "😡", label: "En colère", color: "#ef4444" },
  { id: "stressed", emoji: "😰", label: "Stressé", color: "#f97316" },
  { id: "calm", emoji: "😌", label: "Apaisé", color: "#06b6d4" },
  { id: "grateful", emoji: "🥹", label: "Reconnaissant", color: "#a855f7" },
  { id: "tired", emoji: "😴", label: "Fatigué", color: "#64748b" },
  { id: "motivated", emoji: "❤️", label: "Plein d’espoir", color: "#ec4899" },
];

// Permet de retrouver la couleur d'une humeur à partir de son seul emoji
// (les posts existants ne stockent que l'emoji, pas l'objet humeur complet).
export const MOOD_COLOR_BY_EMOJI = MOODS.reduce((map, mood) => {
  map[mood.emoji] = mood.color;
  return map;
}, {});

// Défis associables à une publication (popup de création). Toujours formulés
// de façon inspirante, jamais culpabilisante.
export const CHALLENGES = [
  { id: "breathing", emoji: "🌱", label: "Respirer 2 minutes" },
  { id: "walk", emoji: "🌱", label: "Marcher 10 minutes" },
  { id: "gratitude", emoji: "🌱", label: "Écrire une gratitude" },
  { id: "no-contact", emoji: "🌱", label: "Ne pas contacter son ex aujourd’hui" },
  { id: "read", emoji: "🌱", label: "Lire quelques pages" },
];

// Intention de la publication : information exclusive (un seul choix),
// stockée avec le post pour un usage futur par l'IA. Purement informatif
// pour l'instant, jamais affiché publiquement comme une contrainte.
export const POST_INTENTS = [
  { id: "listened", emoji: "👂", label: "Être écouté" },
  { id: "advice", emoji: "💡", label: "Recevoir des conseils" },
  { id: "connect", emoji: "🤝", label: "Trouver des personnes qui vivent la même chose" },
];

// Visibilité de la publication. "Journal privé" reste un placeholder non
// fonctionnel pour l'instant (annoncé comme tel dans l'UI).
export const VISIBILITY_OPTIONS = [
  { id: "public", emoji: "🌍", label: "Public" },
  { id: "group", emoji: "👥", label: "Mon groupe" },
  { id: "private", emoji: "🔒", label: "Journal privé", placeholder: true },
];

export const DEFAULT_GROUP_OPTION = "Pour toi";

export const STORAGE_KEYS = {
  THEME: "healspace.theme",
  LIKES: "healspace.likes",
  COMMENTS: "healspace.comments",
  POSTS: "healspace.posts",
  GROUPS: "healspace.groups.joined",
  FAVORITES: "healspace.resources.favorites",
  NOTIFICATIONS_READ: "healspace.notifications.read",
  NOTIFICATIONS_DELETED: "healspace.notifications.deleted",
  SAVED_POSTS: "healspace.posts.saved",
  HIDDEN_POSTS: "healspace.posts.hidden",
  RESOURCES_READ: "healspace.resources.read",
  POST_DRAFT: "healspace.posts.draft",
  JOURNAL_ENTRIES: "healspace.journal.entries",
  SETTINGS: "healspace.settings",
};

// Petite sélection d'emojis pour le picker simple de la popup de publication
// (pas de librairie externe : juste une liste statique insérée dans le texte).
export const SIMPLE_EMOJIS = ["🙂", "😢", "😡", "😴", "❤️", "🙏", "💪", "🌱", "✨", "🔥"];

export const MAX_POST_LENGTH = 1000;

// Types acceptés par le vrai sélecteur de fichier (input type="file").
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE_MB = 5;

// Images "fictives" sélectionnables dans la popup de publication.
// En attendant un vrai upload (Cloudinary/S3), chaque option référence
// juste une classe CSS (dégradé) plutôt qu'un fichier binaire.
export const POST_IMAGES = [
  { id: "img1", label: "Aurore", className: "post-image-1" },
  { id: "img2", label: "Océan", className: "post-image-2" },
  { id: "img3", label: "Forêt", className: "post-image-3" },
  { id: "img4", label: "Coucher de soleil", className: "post-image-4" },
];

// Filtres du feed, centralisés ici pour être réutilisés par Feed.jsx
// et par utils/postFilters.js sans dupliquer la liste.
export const FEED_FILTERS = ["Pour toi", "Rupture", "Dépression", "Motivation", "Anonyme"];

// Seuil (nombre de membres) au-delà duquel un groupe est considéré "populaire"
// dans l'onglet Populaires de la page Groupes.
export const POPULAR_GROUP_THRESHOLD = 9000;

// Objectif hebdomadaire affiché sur la page Journal (barre de progression),
// purement indicatif tant qu'il n'y a pas de vraie notion de semaine glissante.
export const JOURNAL_WEEKLY_GOAL = 5;
