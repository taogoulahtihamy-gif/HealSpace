import { useCallback, useEffect, useState } from "react";
import { journalService } from "../services/journalService.js";
import { useNotifications } from "./useNotifications.js";

export function useJournal() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotifications();

  useEffect(() => {
    let isMounted = true;
    journalService.getEntries().then((list) => {
      if (isMounted) {
        setEntries(list);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const addEntry = useCallback(
    async (payload) => {
      const updated = await journalService.addEntry(entries, payload);
      setEntries(updated);
      notify("Nouvelle étape ajoutée à ton journal 🌱", "success");
    },
    [entries, notify]
  );

  return { entries, addEntry, isLoading };
}
