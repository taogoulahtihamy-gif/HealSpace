import { X } from "lucide-react";
import { useEffect } from "react";

/**
 * Modal générique : overlay sombre + carte centrée + animation d'entrée.
 * Tout composant qui a besoin d'une popup (publication, confirmation,
 * édition de profil...) compose ce composant plutôt que de réinventer
 * un overlay à chaque fois.
 */
export default function Modal({ title, isOpen, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="ghost-btn" onClick={onClose} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
