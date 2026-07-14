import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Send,
  UsersRound,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "../hooks/useAuth.js";
import { useNotifications } from "../hooks/useNotifications.js";
import {
  createDirectConversation,
  getConversations,
} from "../services/api/conversations.api.js";
import {
  createConversationMessage,
  getConversationMessages,
  markMessageAsRead,
} from "../services/api/messages.api.js";
import { searchUsersForMessages } from "../services/api/users.search.api.js";
import {
  connectSocket,
  getSocketInstance,
} from "../services/socket/socket.client.js";
import {
  extractData,
  mapApiConversationToUiConversation,
  mapApiConversationsToUiConversations,
  mapApiMessageToUiMessage,
  mapApiMessagesToUiMessages,
  mapApiUsersToSearchResults,
} from "../services/api/message.mapper.js";
import "../styles/messages.css";

function getSocketStatusLabel(status) {
  return status === "connected"
    ? "Temps réel actif"
    : "Temps réel inactif";
}

function sortMessages(messages) {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );
}

function upsertMessage(messages, message) {
  const exists = messages.some((item) => item.id === message.id);

  if (exists) {
    return messages.map((item) =>
      item.id === message.id ? message : item,
    );
  }

  return sortMessages([...messages, message]);
}

function ConversationAvatar({ conversation }) {
  if (conversation.avatar) {
    return (
      <span className="conversation-avatar">
        <img
          src={conversation.avatar}
          alt={conversation.title}
        />
      </span>
    );
  }

  return (
    <span className="conversation-avatar">
      {conversation.initials}
    </span>
  );
}

function MessageAvatar({ message }) {
  if (message.sender?.avatar) {
    return (
      <span className="message-avatar">
        <img
          src={message.sender.avatar}
          alt={message.sender.name}
        />
      </span>
    );
  }

  return (
    <span className="message-avatar">
      {message.sender?.initials || "?"}
    </span>
  );
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { notify } = useNotifications();

  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messagesByConversation, setMessagesByConversation] =
    useState({});
  const [isLoadingConversations, setIsLoadingConversations] =
    useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isNewConversationOpen, setIsNewConversationOpen] =
    useState(false);
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [typingUsers, setTypingUsers] = useState({});

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  );

  const activeMessages =
    messagesByConversation[activeConversationId] || [];

  const filteredConversations = useMemo(() => {
    const query = conversationSearch.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      conversation.title.toLowerCase().includes(query),
    );
  }, [conversations, conversationSearch]);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);

      const response = await getConversations();
      const mapped = mapApiConversationsToUiConversations(
        response,
        user?.id,
      );

      setConversations(mapped);

      if (!activeConversationId && mapped[0]?.id) {
        setActiveConversationId(mapped[0].id);
      }

      return mapped;
    } catch {
      notify("Impossible de charger les conversations.", "error");
      return [];
    } finally {
      setIsLoadingConversations(false);
    }
  }, [activeConversationId, notify, user?.id]);

  const loadMessages = useCallback(
    async (conversationId) => {
      if (!conversationId) {
        return [];
      }

      try {
        setIsLoadingMessages(true);

        const response =
          await getConversationMessages(conversationId);

        const mapped = mapApiMessagesToUiMessages(response);

        setMessagesByConversation((current) => ({
          ...current,
          [conversationId]: mapped,
        }));

        return mapped;
      } catch {
        notify("Impossible de charger les messages.", "error");
        return [];
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [activeMessages.length, activeConversationId]);

  useEffect(() => {
    const socket = connectSocket();

    if (!socket) {
      setSocketStatus("disconnected");
      return undefined;
    }

    function handleConnect() {
      setSocketStatus("connected");
    }

    function handleDisconnect() {
      setSocketStatus("disconnected");
    }

    function handleReady() {
      setSocketStatus("connected");
    }

    function handleMessageNew(payload) {
      const mappedMessage = mapApiMessageToUiMessage(payload);

      setMessagesByConversation((current) => ({
        ...current,
        [mappedMessage.conversationId]: upsertMessage(
          current[mappedMessage.conversationId] || [],
          mappedMessage,
        ),
      }));

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === mappedMessage.conversationId
            ? {
                ...conversation,
                updatedAt: mappedMessage.createdAt,
                time: mappedMessage.time,
              }
            : conversation,
        ),
      );

      if (
        mappedMessage.conversationId === activeConversationId &&
        mappedMessage.senderId !== user?.id
      ) {
        markMessageAsRead(mappedMessage.id).catch(() => {});
      }
    }

    function handleMessageUpdated(payload) {
      const mappedMessage = mapApiMessageToUiMessage(payload);

      setMessagesByConversation((current) => ({
        ...current,
        [mappedMessage.conversationId]: (
          current[mappedMessage.conversationId] || []
        ).map((message) =>
          message.id === mappedMessage.id
            ? mappedMessage
            : message,
        ),
      }));
    }

    function handleMessageDeleted(payload) {
      const conversationId = payload?.conversationId;
      const messageId = payload?.id || payload?.messageId;

      if (!conversationId || !messageId) {
        return;
      }

      setMessagesByConversation((current) => ({
        ...current,
        [conversationId]: (
          current[conversationId] || []
        ).filter((message) => message.id !== messageId),
      }));
    }

    function handleTyping(payload) {
      if (!payload?.conversationId || !payload?.user?.id) {
        return;
      }

      if (payload.user.id === user?.id) {
        return;
      }

      setTypingUsers((current) => ({
        ...current,
        [payload.conversationId]: payload.user,
      }));
    }

    function handleStopTyping(payload) {
      if (!payload?.conversationId) {
        return;
      }

      setTypingUsers((current) => {
        const next = { ...current };
        delete next[payload.conversationId];
        return next;
      });
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connection:ready", handleReady);
    socket.on("message:new", handleMessageNew);
    socket.on("message:updated", handleMessageUpdated);
    socket.on("message:deleted", handleMessageDeleted);
    socket.on("conversation:typing", handleTyping);
    socket.on("conversation:stop-typing", handleStopTyping);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connection:ready", handleReady);
      socket.off("message:new", handleMessageNew);
      socket.off("message:updated", handleMessageUpdated);
      socket.off("message:deleted", handleMessageDeleted);
      socket.off("conversation:typing", handleTyping);
      socket.off("conversation:stop-typing", handleStopTyping);
    };
  }, [activeConversationId, user?.id]);

  useEffect(() => {
    if (!activeConversationId) {
      return undefined;
    }

    const socket = getSocketInstance() || connectSocket();

    if (!socket) {
      return undefined;
    }

    socket.emit(
      "conversation:join",
      {
        conversationId: activeConversationId,
      },
      () => {},
    );

    return () => {
      socket.emit(
        "conversation:leave",
        {
          conversationId: activeConversationId,
        },
        () => {},
      );
    };
  }, [activeConversationId]);

  useEffect(() => {
    const query = userSearchQuery.trim();

    if (query.length < 2) {
      setUserSearchResults([]);
      return undefined;
    }

    let isActive = true;
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearchingUsers(true);
const response = await searchUsersForMessages(query, 10);
        if (!isActive) {
          return;
        }

        setUserSearchResults(
          mapApiUsersToSearchResults(response).filter(
            (item) => item.id !== user?.id,
          ),
        );
      } catch {
        if (isActive) {
          setUserSearchResults([]);
        }
      } finally {
        if (isActive) {
          setIsSearchingUsers(false);
        }
      }
    }, 350);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [userSearchQuery, user?.id]);

  async function handleSendMessage(event) {
    event.preventDefault();

    const content = messageInput.trim();

    if (!content || !activeConversationId) {
      return;
    }

    setMessageInput("");

    try {
      const response = await createConversationMessage(
        activeConversationId,
        content,
      );

      const createdMessage = mapApiMessageToUiMessage(
        extractData(response),
      );

      setMessagesByConversation((current) => ({
        ...current,
        [activeConversationId]: upsertMessage(
          current[activeConversationId] || [],
          createdMessage,
        ),
      }));
    } catch {
      setMessageInput(content);
      notify("Le message n'a pas pu être envoyé.", "error");
    }
  }

  function handleTypingChange(event) {
    setMessageInput(event.target.value);

    const socket = getSocketInstance();

    if (!socket || !activeConversationId) {
      return;
    }

    socket.emit("conversation:typing", {
      conversationId: activeConversationId,
    });

    window.clearTimeout(handleTypingChange.stopTimer);
    handleTypingChange.stopTimer = window.setTimeout(() => {
      socket.emit("conversation:stop-typing", {
        conversationId: activeConversationId,
      });
    }, 900);
  }

  async function handleCreateDirectConversation(participantId) {
    try {
      const response = await createDirectConversation(participantId);

      const createdConversation = mapApiConversationToUiConversation(
        extractData(response),
        user?.id,
      );

      setConversations((current) => {
        const exists = current.some(
          (conversation) =>
            conversation.id === createdConversation.id,
        );

        if (exists) {
          return current;
        }

        return [createdConversation, ...current];
      });

      setActiveConversationId(createdConversation.id);
      setIsNewConversationOpen(false);
      setUserSearchQuery("");
      setUserSearchResults([]);
    } catch {
      notify("Impossible de créer la conversation.", "error");
    }
  }

  return (
    <main className="messages-page">
      <section className="messages-shell">
        <aside className="conversation-sidebar">
          <div className="conversation-sidebar-header">
            <div>
              <span>Écoute privée</span>
              <h2>Messages</h2>
            </div>

            <button
              type="button"
              onClick={() =>
                setIsNewConversationOpen((current) => !current)
              }
              title="Nouvelle conversation"
            >
              {isNewConversationOpen ? (
                <X size={18} />
              ) : (
                <Plus size={18} />
              )}
            </button>
          </div>

          <label className="conversation-search">
            <Search size={16} />
            <input
              placeholder="Rechercher une conversation"
              value={conversationSearch}
              onChange={(event) =>
                setConversationSearch(event.target.value)
              }
            />
          </label>

          {isNewConversationOpen && (
            <div className="new-conversation-card">
              <label>
                <Search size={15} />
                <input
                  placeholder="Nom, username ou email"
                  value={userSearchQuery}
                  onChange={(event) =>
                    setUserSearchQuery(event.target.value)
                  }
                />
              </label>

              {isSearchingUsers && (
                <span className="message-mini-state">
                  Recherche...
                </span>
              )}

              <div className="user-search-results">
                {userSearchResults.map((result) => (
                  <button
                    type="button"
                    key={result.id}
                    onClick={() =>
                      handleCreateDirectConversation(result.id)
                    }
                  >
                    {result.avatar ? (
                      <img src={result.avatar} alt={result.name} />
                    ) : (
                      <span>{result.initials}</span>
                    )}

                    <strong>{result.name}</strong>
                    <small>@{result.username}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="conversation-list">
            {isLoadingConversations && (
              <div className="message-state">
                <Loader2 className="spin" size={18} />
                Chargement...
              </div>
            )}

            {!isLoadingConversations &&
              filteredConversations.length === 0 && (
                <div className="message-empty">
                  <UsersRound size={28} />
                  <strong>Aucune conversation</strong>
                  <span>
                    Lance une discussion depuis le bouton plus.
                  </span>
                </div>
              )}

            {filteredConversations.map((conversation) => (
              <button
                type="button"
                key={conversation.id}
                className={`conversation-item ${
                  activeConversationId === conversation.id
                    ? "is-active"
                    : ""
                }`}
                onClick={() =>
                  setActiveConversationId(conversation.id)
                }
              >
                <ConversationAvatar conversation={conversation} />

                <span>
                  <strong>{conversation.title}</strong>
                  <small>
                    {conversation.participantCount} participant(s)
                  </small>
                </span>

                <time>{conversation.time}</time>
              </button>
            ))}
          </div>
        </aside>

        <section className="chat-panel">
          {!activeConversation ? (
            <div className="chat-empty-state">
              <MessageCircle size={44} />
              <strong>Sélectionne une conversation</strong>
              <span>
                Tes messages privés apparaîtront ici.
              </span>
            </div>
          ) : (
            <>
              <header className="chat-header">
                <button
                  type="button"
                  className="chat-back-button"
                  onClick={() => setActiveConversationId("")}
                >
                  <ArrowLeft size={18} />
                </button>

                <ConversationAvatar conversation={activeConversation} />

                <div>
                  <strong>{activeConversation.title}</strong>
                  <span>
                    {activeConversation.participantCount} participant(s)
                  </span>
                </div>

                <span
                  className={`message-socket-status message-socket-status-${socketStatus}`}
                >
                  {socketStatus === "connected" ? (
                    <Wifi size={15} />
                  ) : (
                    <WifiOff size={15} />
                  )}
                  {getSocketStatusLabel(socketStatus)}
                </span>
              </header>

              <div className="messages-list">
                {isLoadingMessages && (
                  <div className="message-state">
                    <Loader2 className="spin" size={18} />
                    Chargement des messages...
                  </div>
                )}

                {!isLoadingMessages &&
                  activeMessages.length === 0 && (
                    <div className="chat-empty-state compact">
                      <MessageCircle size={34} />
                      <strong>Aucun message</strong>
                      <span>
                        Écris le premier message de cette conversation.
                      </span>
                    </div>
                  )}

                {activeMessages.map((message) => {
                  const isMine = message.senderId === user?.id;

                  return (
                    <article
                      key={message.id}
                      className={`message-bubble-row ${
                        isMine ? "is-mine" : "is-other"
                      }`}
                    >
                      {!isMine && <MessageAvatar message={message} />}

                      <div className="message-bubble">
                        {!isMine && (
                          <strong>{message.sender?.name}</strong>
                        )}
                        <p>{message.content}</p>
                        <small>{message.time}</small>
                      </div>
                    </article>
                  );
                })}

                {typingUsers[activeConversationId] && (
                  <div className="typing-indicator">
                    {typingUsers[activeConversationId].username ||
                      "Quelqu’un"}{" "}
                    écrit...
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form
                className="message-composer"
                onSubmit={handleSendMessage}
              >
                <input
                  placeholder="Écrire un message..."
                  value={messageInput}
                  onChange={handleTypingChange}
                />

                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
