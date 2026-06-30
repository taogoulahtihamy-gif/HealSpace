import GroupCard from "./GroupCard.jsx";
import EmptyState from "../common/EmptyState.jsx";
import { Users } from "lucide-react";

export default function GroupList({ groups, isJoined, onToggleJoin }) {
  if (!groups.length) {
    return (
      <EmptyState
        icon={<Users size={32} />}
        title="Aucun groupe ici"
        description="Essaie un autre onglet pour découvrir d'autres communautés."
      />
    );
  }

  return (
    <div className="group-grid">
      {groups.map((group) => (
        <GroupCard
          key={group.name}
          group={group}
          isJoined={isJoined(group.name)}
          onToggleJoin={onToggleJoin}
        />
      ))}
    </div>
  );
}
