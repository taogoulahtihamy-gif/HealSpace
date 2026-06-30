import { useState } from "react";
import { MOODS } from "../../../utils/constants.js";

export default function MoodSelector({ selected, onSelect }) {
  const [poppingId, setPoppingId] = useState(null);

  function handleClick(option) {
    onSelect(selected?.id === option.id ? null : option);
    setPoppingId(option.id);
    window.setTimeout(() => setPoppingId(null), 220);
  }

  return (
    <div className="mood-selector">
      {MOODS.map((option) => {
        const isSelected = selected?.id === option.id;
        return (
          <button
            type="button"
            key={option.id}
            className={`mood-card ${isSelected ? "selected" : ""} ${poppingId === option.id ? "pop" : ""}`}
            style={
              isSelected
                ? { backgroundColor: option.color, borderColor: option.color }
                : { borderColor: `${option.color}40` }
            }
            onClick={() => handleClick(option)}
          >
            <span className="mood-card-emoji">{option.emoji}</span>
            <span className="mood-card-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
