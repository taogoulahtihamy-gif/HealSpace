import {
  apiRequest,
  createQueryString,
} from "./httpClient.js";

/**
 * Recherche utilisateur pour la messagerie.
 *
 * IMPORTANT :
 * Le backend HealSpace valide la query avec un schéma strict.
 * Il accepte uniquement :
 * - q
 * - page
 * - limit
 *
 * Ne pas envoyer `query` ou `search`, sinon le backend renvoie 400
 * et aucun utilisateur n'apparaît dans la liste.
 */
export function searchUsersForMessages(searchValue, limit = 10) {
  const q = String(searchValue || "").trim();

  return apiRequest(
    `/users/search${createQueryString({
      q,
      page: 1,
      limit,
    })}`,
  );
}
