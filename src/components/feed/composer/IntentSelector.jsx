import { POST_INTENTS } from "../../../utils/constants.js";

export default function IntentSelector({ selected, onSelect }) {
  return (
    <div className="intent-selector" role="radiogroup" aria-label="Que recherches-tu aujourd’hui ?">
      {POST_INTENTS.map((option) => {
        const isSelected = selected?.id === option.id;
        return (
          <button
            type="button"
            key={option.id}
            role="radio"
            aria-checked={isSelected}
            className={`intent-option ${isSelected ? "selected" : ""}`}
            onClick={() => onSelect(isSelected ? null : option)}
          >
            <span className="intent-radio" aria-hidden="true" />
            <span className="intent-emoji">{option.emoji}</span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
