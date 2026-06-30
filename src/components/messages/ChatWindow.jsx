import { useState } from "react";
import { Send } from "lucide-react";
import EmptyState from "../common/EmptyState.jsx";
import { MessageCircle } from "lucide-react";

export default function ChatWindow({ conversation, onSend }) {
  const [draft, setDraft] = useState("");

  if (!conversation) {
    return (
      <EmptyState
        icon={<MessageCircle size={32} />}
        title="Sélectionne une conversation"
        description="Choisis une personne ou un groupe à gauche pour voir l’échange."
      />
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    onSend(conversation.id, draft.trim());
    setDraft("");
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <strong>{conversation.name}</strong>
      </div>

      <div className="chat-thread">
        {conversation.thread.map((message) => (
          <div key={message.id} className={`chat-bubble ${message.from === "me" ? "me" : "them"}`}>
            <p>{message.text}</p>
            <span>{message.time}</span>
          </div>
        ))}
      </div>

      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          placeholder="Écris un message..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" aria-label="Envoyer">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
