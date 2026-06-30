import { createContext, useCallback, useMemo, useState } from "react";
import { generateId } from "../utils/formatters.js";

export const NotificationContext = createContext(null);

const AUTO_DISMISS_MS = 3500;

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = "info") => {
      const id = generateId("toast");
      setToasts((current) => [...current, { id, message, type }]);

      // Disparition automatique après quelques secondes, comme demandé —
      // pas besoin d'action de l'utilisateur pour faire le ménage.
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toasts, notify, dismiss }), [toasts, notify, dismiss]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
