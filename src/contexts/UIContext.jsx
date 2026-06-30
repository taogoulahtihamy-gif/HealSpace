import { createContext, useCallback, useMemo, useState } from "react";

export const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Permet au bouton "Anonyme" du Composer (bandeau au-dessus du feed) d'agir
  // comme un vrai switch indépendant, sans ouvrir la popup de publication :
  // PublishModal lit/écrit la même valeur, donc les deux restent synchronisés.
  const [quickAnonymous, setQuickAnonymous] = useState(false);

  // Permet au bouton "Image" du Composer d'ouvrir directement le sélecteur
  // de fichiers natif puis de pré-remplir la popup avec l'image choisie,
  // au lieu d'ouvrir une popup vide comme les autres boutons.
  const [pendingImage, setPendingImage] = useState(null);

  const openComposer = useCallback(() => setIsComposerOpen(true), []);
  const closeComposer = useCallback(() => setIsComposerOpen(false), []);

  const value = useMemo(
    () => ({
      isComposerOpen,
      openComposer,
      closeComposer,
      quickAnonymous,
      setQuickAnonymous,
      pendingImage,
      setPendingImage,
    }),
    [isComposerOpen, openComposer, closeComposer, quickAnonymous, pendingImage]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
