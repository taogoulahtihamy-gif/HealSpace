export default function DraftBanner({ onResume, onDiscard }) {
  return (
    <div className="draft-banner">
      <span>📝 Tu as un brouillon en attente. Veux-tu le reprendre ?</span>
      <div className="draft-banner-actions">
        <button type="button" className="btn btn-ghost" onClick={onDiscard}>
          Ignorer
        </button>
        <button type="button" className="btn btn-primary" onClick={onResume}>
          Reprendre
        </button>
      </div>
    </div>
  );
}
