/**
 * État vide générique réutilisé sur les pages qui n'ont pas encore
 * beaucoup de contenu (Journal, Notifications...) plutôt que de laisser
 * un espace blanc ou dupliquer le même markup partout.
 *
 * `actionLabel`/`onAction` sont facultatifs : si fournis, un bouton
 * d'action apparaît sous le message (ex: "Réinitialiser la recherche").
 */
export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      {icon}
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button type="button" className="btn btn-ghost empty-state-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
