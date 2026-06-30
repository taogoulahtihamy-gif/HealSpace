// Client API générique.
//
// Pour l'instant, aucun backend n'existe : toutes les "services/*.js" simulent
// une API avec des Promises et des données locales (data/mockData.js).
// Le jour où Node.js/Express sera branché, seul CE fichier (et les services)
// changera — aucun composant React n'aura besoin d'être modifié, car les
// composants consomment uniquement les fonctions exposées par les services.

const BASE_URL = import.meta.env?.VITE_API_URL || "/api";

async function request(path, { method = "GET", body, headers } = {}) {
  // Implémentation actuelle : volontairement non appelée (pas de backend).
  // Elle reste prête pour le jour où le backend Express sera disponible.
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status} on ${path}`);
  }

  return response.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

/**
 * Simule la latence réseau pour que l'UI (loaders, animations) se comporte
 * dès maintenant comme avec une vraie API.
 */
export function fakeLatency(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
