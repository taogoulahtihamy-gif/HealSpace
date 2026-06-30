import AnonymousSwitch from "./AnonymousSwitch.jsx";
import VisibilitySelector from "./VisibilitySelector.jsx";
import PublishButton from "./PublishButton.jsx";

export default function ComposerFooter({
  anonymous,
  onAnonymousChange,
  visibilityId,
  onVisibilityChange,
  canSubmit,
  isSubmitting,
}) {
  return (
    <div className="composer-footer">
      <AnonymousSwitch checked={anonymous} onChange={onAnonymousChange} />

      <div className="publish-field">
        <label>Visibilité</label>
        <VisibilitySelector selectedId={visibilityId} onSelect={onVisibilityChange} />
      </div>

      <PublishButton disabled={!canSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
