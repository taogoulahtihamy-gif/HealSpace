import { useContext } from "react";
import { UIContext } from "../contexts/UIContext.jsx";

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI doit être utilisé dans <UIProvider>");
  return context;
}
