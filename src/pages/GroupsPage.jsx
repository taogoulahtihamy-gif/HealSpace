import { useMemo, useState } from "react";
import { Search, UsersRound, Radio, ShieldCheck } from "lucide-react";
import { groups } from "../data/mockData.js";
import GroupList from "../components/groups/GroupList.jsx";
import { useGroups } from "../hooks/useGroups.js";
import { parseCount } from "../utils/formatters.js";
import { POPULAR_GROUP_THRESHOLD } from "../utils/constants.js";

const TABS = ["Tous", "Mes compagnons", "Populaires"];

export default function GroupsPage() {
  const { isJoined, toggleJoin } = useGroups();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [query, setQuery] = useState("");

  const visibleGroups = groups
    .filter((group) => {
      if (activeTab === "Mes compagnons") return isJoined(group.name);
      if (activeTab === "Populaires") return parseCount(group.members) >= POPULAR_GROUP_THRESHOLD;
      return true;
    })
    .filter((group) => group.name.toLowerCase().includes(query.trim().toLowerCase()));

  const activeNow = useMemo(
    () => groups.reduce((total, group) => total + (group.activeNow || 0), 0),
    []
  );

  return (
    <main className="feed page-v4 groups-page-v4">
      <section className="page-intro-v4 page-intro-v4--groups">
        <div className="page-intro-v4__copy">
          <span className="page-kicker-v4">Communautés confidentielles</span>
          <h1>Tu n’as pas à tout traverser seul.</h1>
          <p>
            Rejoins des espaces modérés, échange à ton rythme et retrouve des personnes
            qui comprennent réellement ce que tu vis.
          </p>
          <div className="page-trust-v4">
            <span><ShieldCheck size={16} /> Modération active</span>
            <span><UsersRound size={16} /> Échanges bienveillants</span>
          </div>
        </div>

        <div className="page-intro-v4__metric" aria-label={`${activeNow} personnes en ligne`}>
          <span className="metric-pulse-v4" />
          <strong>{activeNow}</strong>
          <span>personnes en ligne maintenant</span>
        </div>
      </section>

      <section className="page-controls-v4">
        <label className="page-searchbar page-searchbar-v4">
          <Search size={19} />
          <input
            placeholder="Rechercher une communauté"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="filters group-tabs group-tabs-v4" role="tablist" aria-label="Filtrer les communautés">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={activeTab === tab ? "selected" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Tous" && <Radio size={15} />}
              {tab}
            </button>
          ))}
        </div>
      </section>

      <GroupList groups={visibleGroups} isJoined={isJoined} onToggleJoin={toggleJoin} />
    </main>
  );
}
