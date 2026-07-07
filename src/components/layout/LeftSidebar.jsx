import {
  Bookmark,
  CalendarDays,
  Home,
  MessageCircle,
  ShieldAlert,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import Avatar from "../common/Avatar.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../utils/constants.js";

const NAV_ITEMS = [
  { to: ROUTES.HOME, icon: <Home />, label: "Accueil" },
  { to: ROUTES.GROUPS, icon: <Users />, label: "Compagnons" },
  { to: ROUTES.MESSAGES, icon: <MessageCircle />, label: "Écoute" },
  { to: ROUTES.JOURNAL, icon: <CalendarDays />, label: "Étapes" },
  { to: ROUTES.RESOURCES, icon: <Bookmark />, label: "Ressources" },
];

export default function LeftSidebar() {
  const { user } = useAuth();

  return (
    <aside className="left-sidebar left-sidebar-v3 left-sidebar-v4">
      <div className="sidebar-brand" aria-label="HealSpace">
        <span className="brand-orbit" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>HealSpace</span>
      </div>

      <div className="sidebar-section-label">Mon espace</div>
      <nav className="sidebar-nav" aria-label="Navigation principale">
        {NAV_ITEMS.map((item) => (
          <MenuItem key={item.to} {...item} />
        ))}
      </nav>

      <NavLink to={ROUTES.EMERGENCY} className="sidebar-help-link">
        <ShieldAlert />
        <span>
          <strong>Aide immédiate</strong>
          <small>Accès discret et rapide</small>
        </span>
      </NavLink>

      <section className="challenge-card challenge-card-v3">
        <div className="challenge-card__meta">
          <span>Rituel du jour</span>
          <strong>01</strong>
        </div>
        <p>Prends deux minutes avant de répondre sous le coup de l’émotion.</p>
        <button>Commencer</button>
      </section>

      <NavLink to={ROUTES.PROFILE} className="profile-card profile-card-v3">
        <Avatar initial={user?.initial || "E"} />
        <div className="profile-card__body">
          <strong className="profile-card__name">{user?.name || "Ezekiel"}</strong>
          <span className="profile-card__status">{user?.status || "En reconstruction"}</span>
        </div>
        <span className="profile-chevron" aria-hidden="true">›</span>
      </NavLink>
    </aside>
  );
}

function MenuItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`.trim()}
    >
      <span className="menu-item__icon">{icon}</span>
      <span>{label}</span>
      <i className="menu-item__indicator" aria-hidden="true" />
    </NavLink>
  );
}
