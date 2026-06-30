import { useCallback, useEffect, useState } from "react";
import { settingsService, DEFAULT_SETTINGS } from "../services/settingsService.js";

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    settingsService.getSettings().then((value) => {
      if (isMounted) {
        setSettings(value);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const updateSetting = useCallback(
    async (key, value) => {
      const updated = await settingsService.updateSettings(settings, { [key]: value });
      setSettings(updated);
    },
    [settings]
  );

  return { settings, updateSetting, isLoading };
}
