import { Bell, Search, Settings, PenLine } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUI } from "../../hooks/useUI.js";
import { useSearch } from "../../hooks/useSearch.js";
import { ROUTES } from "../../utils/constants.js";

const PAGE_TITLES = {
  "/": "Aujourd’hui",
  "/groupes": "Compagnons",
  "/messages": "Écoute",
  "/journal": "Mes étapes",
  "/ressources": "Ressources",
  "/urgence": "Aide immédiate",
  "/profil": "Mon profil",
  "/notifications": "Notifications",
  "/parametres": "Paramètres",
};

export default function Topbar() {
  const { openComposer } = useUI();
  const { query, setQuery } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || "HealSpace";

  return (
    <header className="topbar topbar-v3 topbar-v4">
      <div className="topbar-context">
        <span>Votre espace</span>
        <strong>{pageTitle}</strong>
      </div>

      <label className="searchbar searchbar-v3">
        <Search size={15} />
        <input
          placeholder="Rechercher dans HealSpace"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <kbd>⌘ K</kbd>
      </label>

      <div className="top-actions top-actions-v3">
        <button aria-label="notifications" onClick={() => navigate(ROUTES.NOTIFICATIONS)}>
          <Bell size={17} />
          <span className="notification-dot" />
        </button>
        <button aria-label="paramètres" onClick={() => navigate(ROUTES.SETTINGS)}>
          <Settings size={17} />
        </button>
        <button className="publish-btn" onClick={openComposer}>
          <PenLine size={15} />
          <span>Écrire</span>
        </button>
      </div>
    </header>
  );
}
