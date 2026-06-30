import { VISIBILITY_OPTIONS } from "../../../utils/constants.js";

export default function VisibilitySelector({ selectedId, onSelect }) {
  return (
    <div className="visibility-selector">
      {VISIBILITY_OPTIONS.map((option) => (
        <button
          type="button"
          key={option.id}
          className={`visibility-option ${selectedId === option.id ? "selected" : ""}`}
          onClick={() => onSelect(option.id)}
          title={option.placeholder ? "Bientôt disponible" : undefined}
        >
          <span>{option.emoji}</span> {option.label}
          {option.placeholder && <span className="visibility-soon">Bientôt</span>}
        </button>
      ))}
    </div>
  );
}
