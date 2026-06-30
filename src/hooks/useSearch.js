import { useContext } from "react";
import { SearchContext } from "../contexts/SearchContext.jsx";

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch doit être utilisé dans <SearchProvider>");
  return context;
}
