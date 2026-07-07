import {
  ArrowUpRight,
  ChevronRight,
  ShieldAlert,
  HeartCrack,
  MoonStar,
  Sprout,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { groups, conversations } from "../../data/mockData.js";
import Avatar from "../common/Avatar.jsx";
import { ROUTES } from "../../utils/constants.js";

const GROUP_ICONS = [HeartCrack, MoonStar, Sprout];

export default function RightSidebar() {
  const navigate = useNavigate();
  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <aside className="right-sidebar right-sidebar-v3 right-sidebar-v4 right-sidebar-v5">
      <div className="right-dayline right-dayline-v4 right-dayline-v5">
        <span>Aujourd’hui</span>
        <strong>{today}</strong>
      </div>

      <button className="panic-card panic-card-v3 panic-card-v4 panic-card-v5" onClick={() => navigate(ROUTES.EMERGENCY)}>
        <span className="panic-icon"><ShieldAlert size={19} /></span>
        <span>
          <strong>Besoin d’aide maintenant ?</strong>
          <small>Accéder à l’espace de soutien</small>
        </span>
        <ArrowUpRight size={17} />
      </button>

      <section className="panel panel-v3 panel-v4 sidebar-panel-v5">
        <div className="panel-title panel-title-v3 panel-title-v4 sidebar-panel-title-v5">
          <div>
            <span>À découvrir</span>
            <h3>Communautés actives</h3>
          </div>
          <button onClick={() => navigate(ROUTES.GROUPS)}>Voir tout</button>
        </div>

        <div className="compact-list compact-list-v4 compact-list-v5">
          {groups.slice(0, 3).map((group, index) => {
            const GroupIcon = GROUP_ICONS[index] || Sprout;
            return (
              <button className="group-row group-row-v3 group-row-v4 group-row-v5" key={group.name} onClick={() => navigate(ROUTES.GROUPS)}>
                <span className="group-symbol group-symbol-v4 group-symbol-v5" aria-hidden="true"><GroupIcon /></span>
                <span className="group-copy">
                  <strong>{group.name}</strong>
                  <small className="group-presence-v5"><i /> {group.activeNow} personnes présentes</small>
                </span>
                <ChevronRight size={16} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel panel-v3 panel-v4 sidebar-panel-v5">
        <div className="panel-title panel-title-v3 panel-title-v4 sidebar-panel-title-v5">
          <div>
            <span>Messages récents</span>
            <h3>Ton espace d’écoute</h3>
          </div>
          <button onClick={() => navigate(ROUTES.MESSAGES)}>Ouvrir</button>
        </div>

        <div className="compact-list compact-list-v4 compact-list-v5">
          {conversations.slice(0, 3).map((conversation) => (
            <button className="message-row message-row-v3 message-row-v4 message-row-v5" key={conversation.id} onClick={() => navigate(ROUTES.MESSAGES)}>
              <Avatar initial={conversation.name[0]} />
              <span className="message-copy">
                <strong>{conversation.name}</strong>
                <small>{conversation.lastMessage}</small>
              </span>
              <time>{conversation.time}</time>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
