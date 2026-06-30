import { useState } from "react";
import Modal from "../common/Modal.jsx";
import CharacterCounter from "./composer/CharacterCounter.jsx";
import { MAX_POST_LENGTH } from "../../utils/constants.js";

export default function EditPostModal({ isOpen, initialContent, onClose, onSave }) {
  const [content, setContent] = useState(initialContent);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_POST_LENGTH) return;
    onSave(trimmed);
  }

  const isOverLimit = content.length > MAX_POST_LENGTH;

  return (
    <Modal title="Modifier la publication" isOpen={isOpen} onClose={onClose}>
      <form className="publish-form" onSubmit={handleSubmit}>
        <textarea
          autoFocus
          aria-label="Modifier le texte de ta publication"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
        />
        <div className="edit-post-footer">
          <CharacterCounter length={content.length} max={MAX_POST_LENGTH} />
        </div>
        <button
          type="submit"
          className="publish-submit"
          disabled={!content.trim() || isOverLimit}
        >
          Enregistrer
        </button>
      </form>
    </Modal>
  );
}
