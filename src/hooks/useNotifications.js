import { useContext } from "react";

import { NotificationContext } from "../contexts/NotificationContext.jsx";

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications doit être utilisé dans <NotificationProvider>.",
    );
  }

  return context;
}
