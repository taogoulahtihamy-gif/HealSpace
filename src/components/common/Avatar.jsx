/**
 * Avatar générique basé sur une initiale (avant l'arrivée des vraies photos
 * de profil via upload + CDN). Centralise le rendu pour rester cohérent
 * partout (feed, sidebars, messages, profil).
 */
export default function Avatar({ initial = "?", size = "md" }) {
  const sizeClass = size === "lg" ? "large" : "";
  return <div className={`avatar ${sizeClass}`.trim()}>{initial}</div>;
}
