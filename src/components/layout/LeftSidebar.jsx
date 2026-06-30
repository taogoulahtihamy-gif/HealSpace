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
  { to: ROUTES.EMERGENCY, icon: <ShieldAlert />, label: "Aide immédiate", danger: true },
];

export default function LeftSidebar() {
  const { user } = useAuth();

  return (
    <aside className="left-sidebar">
      <NavLink to={ROUTES.PROFILE} className="profile-card">
        <span className="profile-avatar-wrap">
          <Avatar initial={user?.initial || "E"} size="lg" />
        </span>
        <div className="profile-card__body">
          <strong className="profile-card__name">{user?.name || "Ezekiel"}</strong>
          <span className="profile-card__status">
            {user?.status || "En reconstruction"}
          </span>
        </div>
      </NavLink>

      {NAV_ITEMS.map((item) => (
        <MenuItem key={item.to} {...item} />
      ))}

      <div className="challenge-card">
        <strong>Défi du jour</strong>
        <p>Ne pas agir sous émotion pendant 24 heures.</p>
        <button>Commencer</button>
      </div>
    </aside>
  );
}

function MenuItem({ to, icon, label, danger }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `menu-item ${isActive ? "active" : ""} ${danger ? "danger" : ""}`.trim()
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
