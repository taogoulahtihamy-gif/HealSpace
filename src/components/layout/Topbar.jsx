import { Bell, Search, Settings, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUI } from "../../hooks/useUI.js";
import { useSearch } from "../../hooks/useSearch.js";
import { ROUTES } from "../../utils/constants.js";

export default function Topbar() {
  const { openComposer } = useUI();
  const { query, setQuery } = useSearch();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">H</div>
        <span>HealSpace</span>
      </div>

      <label className="searchbar">
        <Search size={18} />
        <input
          placeholder="Rechercher une personne, un groupe, un sujet..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="top-actions">
        <button aria-label="vidéo"><Video size={20} /></button>
        <button aria-label="notifications" onClick={() => navigate(ROUTES.NOTIFICATIONS)}>
          <Bell size={20} />
        </button>
        <button aria-label="paramètres" onClick={() => navigate(ROUTES.SETTINGS)}>
          <Settings size={20} />
        </button>
        <button className="publish-btn" onClick={openComposer}>Publier</button>
      </div>
    </header>
  );
}
