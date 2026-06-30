import { Home, MessageCircle, Plus, ShieldAlert, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUI } from "../../hooks/useUI.js";
import { ROUTES } from "../../utils/constants.js";

export default function MobileNav() {
  const { openComposer } = useUI();

  return (
    <nav className="mobile-nav">
      <NavLink
        to={ROUTES.HOME}
        end
        aria-label="Accueil"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        <Home />
      </NavLink>
      <NavLink
        to={ROUTES.GROUPS}
        aria-label="Compagnons"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        <Users />
      </NavLink>
      <button className="mobile-plus-btn" onClick={openComposer} aria-label="Publier">
        <Plus className="mobile-plus" />
      </button>
      <NavLink
        to={ROUTES.MESSAGES}
        aria-label="Écoute"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        <MessageCircle />
      </NavLink>
      <NavLink
        to={ROUTES.EMERGENCY}
        aria-label="Aide immédiate"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        <ShieldAlert />
      </NavLink>
    </nav>
  );
}
