import { DEFAULT_GROUP_OPTION } from "./constants.js";

/**
 * Filtre les posts par catégorie de filtre (boutons "Pour toi", "Rupture"...).
 * "Pour toi" = aucun filtre, on affiche tout le monde.
 * "Anonyme" = posts publiés en anonyme (champ post.anonymous ou auteur
 * commençant par "Anonyme" pour les données mock historiques).
 * Les autres filtres correspondent à une recherche insensible à la casse
 * dans le nom du groupe du post.
 */
export function filterPostsByCategory(posts, filter) {
  if (!filter || filter === DEFAULT_GROUP_OPTION) return posts;

  if (filter === "Anonyme") {
    return posts.filter(
      (post) => post.anonymous || (post.author || "").startsWith("Anonyme")
    );
  }

  const needle = filter.toLowerCase();
  return posts.filter((post) => (post.group || "").toLowerCase().includes(needle));
}

/**
 * Filtre les posts par recherche texte libre, sur le contenu, l'auteur
 * et le groupe. Recherche insensible à la casse et aux accents simples.
 */
export function filterPostsBySearch(posts, query) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return posts;

  return posts.filter((post) => {
    const haystack = `${post.content || ""} ${post.author || ""} ${post.group || ""}`.toLowerCase();
    return haystack.includes(trimmed);
  });
}
