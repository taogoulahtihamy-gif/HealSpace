import { useState } from "react";
import { Search } from "lucide-react";
import { groups } from "../data/mockData.js";
import GroupList from "../components/groups/GroupList.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
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

  return (
    <main className="feed">
      <PageHeader
        title="Compagnons"
        subtitle="Rejoins une communauté qui comprend ce que tu traverses."
      />

      <label className="page-searchbar">
        <Search size={18} />
        <input
          placeholder="Rechercher un groupe..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <section className="filters group-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "selected" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </section>

      <GroupList groups={visibleGroups} isJoined={isJoined} onToggleJoin={toggleJoin} />
    </main>
  );
}
