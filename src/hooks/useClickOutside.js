import { useEffect, useRef } from "react";

/**
 * Ferme `onClose` quand on clique en dehors de l'élément référencé, ou
 * quand on appuie sur Échap. Générique, sans dépendance à un contexte ou
 * service existant : pur utilitaire DOM, actif uniquement quand `isActive`
 * est vrai (évite d'écouter des événements globaux inutilement).
 */
export function useClickOutside(isActive, onClose) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, onClose]);

  return ref;
}
