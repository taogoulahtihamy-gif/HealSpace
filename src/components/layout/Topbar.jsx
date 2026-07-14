import {
  Bell,
  LogOut,
  PenLine,
  Search,
  Settings,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.js";
import { useNotifications } from "../../hooks/useNotifications.js";
import { useSearch } from "../../hooks/useSearch.js";
import { useUI } from "../../hooks/useUI.js";
import { ROUTES } from "../../utils/constants.js";
import "../../styles/profile.css";
import "../../styles/notifications.css";

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

function getFullName(user) {
  return [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getInitials(user) {
  const source =
    getFullName(user) ||
    user?.username ||
    user?.email ||
    "Utilisateur";

  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Topbar() {
  const { openComposer } = useUI();
  const { query, setQuery } = useSearch();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] || "HealSpace";
  const displayName =
    getFullName(user) || user?.username || "Profil";

  async function handleLogout() {
    await logout();

    navigate(ROUTES.LOGIN, {
      replace: true,
    });
  }

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
        <button
          className="topbar-notification-button"
          aria-label="notifications"
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
        >
          <Bell size={17} />

          {unreadCount > 0 && (
            <span className="topbar-notification-count">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <button
          aria-label="paramètres"
          onClick={() => navigate(ROUTES.SETTINGS)}
        >
          <Settings size={17} />
        </button>

        <button className="publish-btn" onClick={openComposer}>
          <PenLine size={15} />
          <span>Écrire</span>
        </button>

        <button
          type="button"
          className="topbar-profile-button"
          onClick={() => navigate(ROUTES.PROFILE)}
          title={displayName}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={displayName} />
          ) : (
            <span>{getInitials(user)}</span>
          )}
        </button>

        <button
          type="button"
          className="topbar-logout-button"
          onClick={handleLogout}
          aria-label="Se déconnecter"
          title="Se déconnecter"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
