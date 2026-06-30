import { useState } from "react";
import { Copy, Repeat2 } from "lucide-react";
import Modal from "../common/Modal.jsx";

export default function SharePostModal({ isOpen, post, onClose, onShareInHealSpace }) {
  const [comment, setComment] = useState("");
  const [copyState, setCopyState] = useState("idle");

  function handleCopyLink() {
    // Lien fictif : aucun backend ne sert encore de vraies pages de post.
    const fakeLink = `https://healspace.app/post/${post.id}`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(fakeLink)
        .then(() => setCopyState("copied"))
        .catch(() => setCopyState("error"));
    } else {
      setCopyState("error");
    }

    window.setTimeout(() => setCopyState("idle"), 2000);
  }

  function handleShareInHealSpace() {
    onShareInHealSpace(comment.trim());
    setComment("");
  }

  return (
    <Modal title="Partager la publication" isOpen={isOpen} onClose={onClose}>
      <div className="share-modal">
        <button type="button" className="share-option" onClick={handleCopyLink}>
          <Copy size={18} />
          {copyState === "copied" ? "Lien copié !" : "Copier le lien"}
        </button>

        <div className="share-divider">ou</div>

        <div className="share-option-block">
          <label>Partager dans HealSpace</label>
          <textarea
            placeholder="Ajoute un mot avant de partager (facultatif)..."
            aria-label="Ajouter un mot avant de partager"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={2}
          />
          <button type="button" className="btn btn-primary" onClick={handleShareInHealSpace}>
            <Repeat2 size={18} /> Partager dans HealSpace
          </button>
        </div>
      </div>
    </Modal>
  );
}
