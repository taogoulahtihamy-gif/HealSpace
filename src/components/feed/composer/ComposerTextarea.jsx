import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";
import CharacterCounter from "./CharacterCounter.jsx";
import { SIMPLE_EMOJIS, MAX_POST_LENGTH } from "../../../utils/constants.js";

export default function ComposerTextarea({ value, onChange }) {
  const textareaRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Auto-resize : la zone grandit avec le texte au lieu de faire défiler,
  // pour rester dans l'esprit "espace qui respire" plutôt que formulaire.
  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight}px`;
  }, [value]);

  function handleInsertEmoji(emoji) {
    onChange(`${value}${emoji}`);
    setShowEmojiPicker(false);
  }

  return (
    <div className="composer-textarea-wrap">
      <textarea
        ref={textareaRef}
        autoFocus
        className="composer-textarea"
        placeholder="Exprime ce que tu ressens..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
      />

      <div className="composer-textarea-footer">
        <button
          type="button"
          className="emoji-toggle-btn"
          onClick={() => setShowEmojiPicker((current) => !current)}
          aria-label="Ouvrir le sélecteur d’émojis"
        >
          <Smile size={18} />
        </button>
        <CharacterCounter length={value.length} max={MAX_POST_LENGTH} />
      </div>

      {showEmojiPicker && (
        <div className="emoji-picker">
          {SIMPLE_EMOJIS.map((emoji) => (
            <button type="button" key={emoji} onClick={() => handleInsertEmoji(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
