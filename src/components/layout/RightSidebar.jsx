import { MoreHorizontal, Send, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { groups, conversations } from "../../data/mockData.js";
import Avatar from "../common/Avatar.jsx";
import { ROUTES } from "../../utils/constants.js";

export default function RightSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="right-sidebar">
      <section className="panic-card">
        <div className="panic-icon">
          <ShieldAlert size={24} />
        </div>
        <h3>Besoin d’aide maintenant ?</h3>
        <p>
          Ouvre un espace calme avec respiration, contact proche et ressources d’urgence.
        </p>
        <button onClick={() => navigate(ROUTES.EMERGENCY)}>Ouvrir l’espace urgence</button>
      </section>

      <section className="panel">
        <div className="panel-title">
          <h3>Compagnons suggérés</h3>
          <MoreHorizontal size={18} />
        </div>

        {groups.map((group) => (
          <div className="group-row" key={group.name}>
            <div className="group-icon">{group.icon}</div>
            <div>
              <strong>{group.name}</strong>
              <span>{group.members.replace("membres", "compagnons")}</span>
            </div>
            <button onClick={() => navigate(ROUTES.GROUPS)}>+</button>
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="panel-title">
          <h3>Écoute</h3>
          <Send size={18} />
        </div>

        {conversations.map((conversation) => (
          <button
            className="message-row"
            key={conversation.id}
            onClick={() => navigate(ROUTES.MESSAGES)}
          >
            <Avatar initial={conversation.name[0]} />
            <div>
              <strong>{conversation.name}</strong>
              <p>{conversation.lastMessage}</p>
            </div>
            <span>{conversation.time}</span>
          </button>
        ))}
      </section>
    </aside>
  );
}
