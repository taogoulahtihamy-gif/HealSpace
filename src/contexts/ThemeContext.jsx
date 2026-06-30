import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "../utils/constants.js";

export const ThemeContext = createContext(null);

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(STORAGE_KEYS.THEME) || "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    // Pose l'attribut sur <html> : global.css contient déjà les variables
    // CSS pour [data-theme="dark"], prêtes à être activées sans rien casser
    // du mode clair actuel.
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
