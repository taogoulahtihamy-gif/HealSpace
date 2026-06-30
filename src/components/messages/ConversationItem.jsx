import Avatar from "../common/Avatar.jsx";

export default function ConversationItem({ conversation, isActive, onSelect }) {
  return (
    <button
      className={`conversation-item ${isActive ? "active" : ""}`}
      onClick={() => onSelect(conversation.id)}
    >
      <Avatar initial={conversation.name[0]} />
      <div>
        <strong>{conversation.name}</strong>
        <p>{conversation.lastMessage}</p>
      </div>
      <span>{conversation.time}</span>
    </button>
  );
}
