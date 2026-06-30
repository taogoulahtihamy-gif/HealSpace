import { CHALLENGES } from "../../../utils/constants.js";

export default function ChallengeSelector({ selected, onSelect }) {
  return (
    <div className="challenge-picker">
      {CHALLENGES.map((option) => (
        <button
          type="button"
          key={option.id}
          className={`challenge-chip ${selected?.id === option.id ? "selected" : ""}`}
          onClick={() => onSelect(selected?.id === option.id ? null : option)}
        >
          <span>{option.emoji}</span> {option.label}
        </button>
      ))}
    </div>
  );
}
