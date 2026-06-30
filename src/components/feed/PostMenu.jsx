import { Bookmark, Link2, EyeOff, Flag, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside.js";

/**
 * Menu "..." d'une publication. Reçoit uniquement des callbacks et des
 * booléens depuis PostCard : aucune logique métier ici, seulement l'UI
 * et l'accessibilité du menu lui-même.
 */
export default function PostMenu({
  isOpen,
  onToggle,
  onClose,
  isSaved,
  isOwner,
  onToggleSave,
  onCopyLink,
  onToggleHide,
  onEdit,
  onDelete,
  onReport,
}) {
  const menuRef = useClickOutside(isOpen, onClose);

  return (
    <div className="post-menu" ref={menuRef}>
      <button
        className="ghost-btn"
        aria-label="Plus d’options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <div className="post-menu-dropdown" role="menu">
          <button role="menuitem" onClick={onToggleSave}>
            <Bookmark size={16} /> {isSaved ? "Retirer des enregistrements" : "Enregistrer"}
          </button>
          <button role="menuitem" onClick={onCopyLink}>
            <Link2 size={16} /> Copier le lien
          </button>
          <button role="menuitem" onClick={onToggleHide}>
            <EyeOff size={16} /> Masquer
          </button>

          {isOwner && (
            <>
              <div className="post-menu-divider" role="separator" />
              <button role="menuitem" onClick={onEdit}>
                <Pencil size={16} /> Modifier
              </button>
              <button role="menuitem" className="danger" onClick={onDelete}>
                <Trash2 size={16} /> Supprimer
              </button>
            </>
          )}

          <div className="post-menu-divider" role="separator" />
          <button role="menuitem" className="danger" onClick={onReport}>
            <Flag size={16} /> Signaler
          </button>
        </div>
      )}
    </div>
  );
}
