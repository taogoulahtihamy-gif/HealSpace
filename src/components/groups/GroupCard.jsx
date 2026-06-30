import { memo } from "react";
import { Users } from "lucide-react";
import { formatCount, parseCount } from "../../utils/formatters.js";

function GroupCard({ group, isJoined, onToggleJoin }) {
  // Le compteur de compagnons reste basé sur la donnée mock, +1 localement
  // si l'utilisateur courant a rejoint le groupe (persisté via useGroups).
  const memberCount = parseCount(group.members) + (isJoined ? 1 : 0);

  return (
    <article className="group-card-full group-card-modern">
      <div className="group-card-cover" aria-hidden="true">
        <span className="group-card-emoji">{group.icon}</span>
      </div>

      <div className="group-card-body">
        <strong>{group.name}</strong>
        {group.description && <p className="group-card-description">{group.description}</p>}

        <div className="group-card-meta">
          <span><Users size={13} /> {formatCount(memberCount)} compagnons</span>
          {group.lastActivity && <span className="group-card-activity">{group.lastActivity}</span>}
        </div>

        {typeof group.activeNow === "number" && (
          <span className="group-card-live">
            <span className="group-card-live-dot" /> {group.activeNow} en ligne maintenant
          </span>
        )}

        <button
          className={`btn ${isJoined ? "btn-ghost" : "btn-primary"} group-card-cta`}
          onClick={() => onToggleJoin(group.name)}
        >
          {isJoined ? "Quitter" : "Devenir compagnon"}
        </button>
      </div>
    </article>
  );
}

export default memo(GroupCard);
