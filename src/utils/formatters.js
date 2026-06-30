// Fonctions utilitaires pures (aucune dépendance React), faciles à tester unitairement.

/**
 * Transforme une date en texte relatif court ("à l'instant", "5 min", "2 h").
 * Volontairement simple : sera remplacé par une lib (date-fns) si besoin plus tard.
 */
export function timeAgo(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "à l’instant";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;

  const days = Math.floor(hours / 24);
  return `${days} j`;
}

/**
 * Identifiant unique côté client, suffisant en attendant les IDs générés
 * par la base de données (Prisma/PostgreSQL).
 */
export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Découpe un nombre en texte compact façon réseau social (1234 -> "1,2k").
 */
export function formatCount(value) {
  if (typeof value === "string" && /[^\d.,]/.test(value)) {
    // Déjà formaté à la main dans les données mock (ex: "1,2k") -> on ne touche pas.
    return value;
  }
  const number = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(number)) return value;
  if (number < 1000) return `${number}`;
  return `${(number / 1000).toFixed(1).replace(".0", "")}k`;
}

/**
 * Inverse de formatCount : transforme un compteur affiché ("1,2k", "843")
 * en nombre exploitable, pour pouvoir lui ajouter/retirer 1 soutien.
 * Nécessaire car les données mock stockent déjà certains compteurs sous
 * forme de texte compact plutôt que de nombre brut.
 */
export function parseCount(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const normalized = value.trim().toLowerCase().replace(",", ".");
  if (normalized.endsWith("k")) {
    const base = parseFloat(normalized.slice(0, -1));
    return Number.isNaN(base) ? 0 : Math.round(base * 1000);
  }

  const number = parseFloat(normalized);
  return Number.isNaN(number) ? 0 : number;
}
