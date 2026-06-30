import { useState } from "react";
import { conversations as initialConversations } from "../data/mockData.js";
import ConversationList from "../components/messages/ConversationList.jsx";
import ChatWindow from "../components/messages/ChatWindow.jsx";
import PageHeader from "../components/common/PageHeader.jsx";

export default function MessagesPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0]?.id ?? null);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // Envoi local pour l'instant. Le jour où Socket.io sera branché,
  // cette fonction émettra l'événement réseau au lieu de muter le state ici —
  // ConversationList et ChatWindow n'auront besoin d'aucune modification.
  function handleSend(conversationId, text) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              lastMessage: text,
              time: "à l’instant",
              thread: [
                ...conversation.thread,
                { id: conversation.thread.length + 1, from: "me", text, time: "maintenant" },
              ],
            }
          : conversation
      )
    );
  }

  return (
    <main className="feed">
      <PageHeader title="Écoute" subtitle="Des oreilles attentives, toujours là pour toi." />

      <section className="messages-layout">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
        />
        <ChatWindow conversation={activeConversation} onSend={handleSend} />
      </section>
    </main>
  );
}
