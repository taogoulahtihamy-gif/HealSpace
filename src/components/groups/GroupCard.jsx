import { memo } from "react";
import {
  Users,
  HeartCrack,
  MoonStar,
  Sprout,
  GraduationCap,
  ArrowUpRight,
} from "lucide-react";
import { formatCount, parseCount } from "../../utils/formatters.js";

const GROUP_VISUALS = {
  "Rupture récente": { icon: HeartCrack, tone: "rose", label: "Soutien affectif" },
  "Dépression & solitude": { icon: MoonStar, tone: "indigo", label: "Présence et écoute" },
  "Reconstruction personnelle": { icon: Sprout, tone: "sage", label: "Reprendre confiance" },
  "Étudiants sous pression": { icon: GraduationCap, tone: "amber", label: "Charge mentale" },
};

function GroupCard({ group, isJoined, onToggleJoin }) {
  const memberCount = parseCount(group.members) + (isJoined ? 1 : 0);
  const visual = GROUP_VISUALS[group.name] || GROUP_VISUALS["Reconstruction personnelle"];
  const VisualIcon = visual.icon;

  return (
    <article className={`group-card-full group-card-modern group-card-v4 group-card-v4--${visual.tone}`}>
      <div className="group-card-v4__visual" aria-hidden="true">
        <span className="group-card-v4__icon"><VisualIcon /></span>
        <span className="group-card-v4__category">{visual.label}</span>
        <span className="group-card-v4__signal"><i /> En direct</span>
      </div>

      <div className="group-card-body group-card-v4__body">
        <div className="group-card-v4__heading">
          <strong>{group.name}</strong>
          <ArrowUpRight size={18} />
        </div>

        {group.description && <p className="group-card-description">{group.description}</p>}

        <div className="group-card-meta group-card-v4__meta">
          <span><Users size={15} /> {formatCount(memberCount)} compagnons</span>
          {group.lastActivity && <span>{group.lastActivity}</span>}
        </div>

        <div className="group-card-v4__footer">
          {typeof group.activeNow === "number" && (
            <span className="group-card-live" aria-label={`${group.activeNow} personnes présentes`}>
              <span className="group-card-live-dot" />
              <strong>{group.activeNow}</strong>
              <span>présents</span>
            </span>
          )}

          <button
            className={`btn ${isJoined ? "btn-ghost" : "btn-primary"} group-card-cta`}
            onClick={() => onToggleJoin(group.name)}
          >
            {isJoined ? "Déjà rejoint · Quitter" : "Rejoindre l’espace"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(GroupCard);
