import { useState } from "react";
import { Send, CornerDownRight, Pencil, Trash2, X, Check } from "lucide-react";
import Avatar from "../common/Avatar.jsx";

const REPLY_MARKER = /^↳@@(.+?)@@ ([\s\S]*)$/;

function encodeReply(parentId, text) {
  return `↳@@${parentId}@@ ${text}`;
}

function parseComment(comment) {
  const match = comment.text.match(REPLY_MARKER);
  if (!match) return { ...comment, parentId: null, displayText: comment.text };
  return { ...comment, parentId: match[1], displayText: match[2] };
}

function CommentBubble({ comment, isOwn, isEditing, onStartEdit, onCancelEdit, onSaveEdit, onDelete, onReply, showReply }) {
  const [editValue, setEditValue] = useState(comment.displayText);

  return (
    <div className="comment-item">
      <Avatar initial={comment.avatar} />
      <div className="comment-bubble-wrap">
        {isEditing ? (
          <form
            className="comment-edit-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!editValue.trim()) return;
              onSaveEdit(editValue.trim());
            }}
          >
            <input
              value={editValue}
              onChange={(event) => setEditValue(event.target.value)}
              autoFocus
              aria-label="Modifier ton commentaire"
            />
            <button type="submit" aria-label="Valider la modification"><Check size={16} /></button>
            <button type="button" aria-label="Annuler la modification" onClick={onCancelEdit}><X size={16} /></button>
          </form>
        ) : (
          <div className="comment-bubble">
            <strong>{comment.author}</strong>
            <p>{comment.displayText}{comment.edited && <span className="comment-edited-tag"> (modifié)</span>}</p>
            <span>{comment.time}</span>
          </div>
        )}

        <div className="comment-bubble-actions">
          {showReply && (
            <button onClick={onReply}>
              <CornerDownRight size={13} /> Répondre
            </button>
          )}
          {isOwn && !isEditing && (
            <>
              <button onClick={onStartEdit}>
                <Pencil size={13} /> Modifier
              </button>
              <button className="danger" onClick={onDelete}>
                <Trash2 size={13} /> Supprimer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Section commentaires d'un post : bulles + réponses imbriquées (1 niveau).
 *
 * Les réponses sont persistées via le commentService existant sans le
 * dénaturer : elles sont encodées comme des commentaires normaux avec un
 * préfixe "↳@@parentId@@" reconnu ici à l'affichage. "Modifier"/"Supprimer"
 * appellent désormais updateComment/deleteComment (persistance réelle,
 * survit à un rechargement de page).
 */
export default function CommentSection({ comments, onAddComment, onUpdateComment, onDeleteComment, currentUser }) {
  const [draft, setDraft] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [expandedThreads, setExpandedThreads] = useState(() => new Set());
  const [editingId, setEditingId] = useState(null);

  const parsed = comments.map(parseComment);
  const topLevel = parsed.filter((comment) => !comment.parentId);
  const repliesByParent = parsed.reduce((map, comment) => {
    if (!comment.parentId) return map;
    map[comment.parentId] = map[comment.parentId] || [];
    map[comment.parentId].push(comment);
    return map;
  }, {});

  function toggleThread(id) {
    setExpandedThreads((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    if (replyingToId) {
      onAddComment(encodeReply(replyingToId, trimmed));
      setExpandedThreads((current) => new Set(current).add(replyingToId));
    } else {
      onAddComment(trimmed);
    }

    setDraft("");
    setReplyingToId(null);
  }

  function isOwnComment(comment) {
    return Boolean(currentUser?.name) && comment.author === currentUser.name;
  }

  function renderBubble(comment, { showReply }) {
    return (
      <CommentBubble
        key={comment.id}
        comment={comment}
        isOwn={isOwnComment(comment)}
        isEditing={editingId === comment.id}
        showReply={showReply}
        onReply={() => {
          setReplyingToId(comment.id);
          setDraft("");
        }}
        onStartEdit={() => setEditingId(comment.id)}
        onCancelEdit={() => setEditingId(null)}
        onSaveEdit={(newText) => {
          // Si c'est une réponse, on ré-encode le préfixe pour qu'elle reste
          // rattachée au bon parent après modification.
          const finalText = comment.parentId ? encodeReply(comment.parentId, newText) : newText;
          onUpdateComment(comment.id, finalText);
          setEditingId(null);
        }}
        onDelete={() => onDeleteComment(comment.id)}
      />
    );
  }

  return (
    <div className="comment-section">
      <div className="comment-list" aria-live="polite">
        {topLevel.length === 0 ? (
          <p className="comment-empty">Sois la première personne à répondre avec bienveillance.</p>
        ) : (
          topLevel.map((comment) => {
            const replies = repliesByParent[comment.id] || [];
            const isExpanded = expandedThreads.has(comment.id);

            return (
              <div className="comment-thread comment-thread-enter" key={comment.id}>
                {renderBubble(comment, { showReply: true })}

                {replies.length > 0 && (
                  <button className="comment-thread-toggle" onClick={() => toggleThread(comment.id)}>
                    {isExpanded ? "Masquer" : "Voir"} {replies.length} réponse{replies.length > 1 ? "s" : ""}
                  </button>
                )}

                {isExpanded && (
                  <div className="comment-replies">
                    {replies.map((reply) => renderBubble(reply, { showReply: false }))}
                  </div>
                )}

                {replyingToId === comment.id && (
                  <form className="comment-reply-form" onSubmit={handleSubmit}>
                    <input
                      autoFocus
                      placeholder={`Répondre à ${comment.author}...`}
                      aria-label={`Répondre à ${comment.author}`}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                    />
                    <button type="submit" disabled={!draft.trim()} aria-label="Envoyer la réponse">
                      <Send size={15} />
                    </button>
                    <button type="button" aria-label="Annuler la réponse" onClick={() => setReplyingToId(null)}>
                      <X size={15} />
                    </button>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>

      {!replyingToId && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <Avatar initial={currentUser?.initial || "T"} />
          <input
            placeholder="Écris une réponse bienveillante..."
            aria-label="Écrire un commentaire"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" aria-label="Envoyer le commentaire" disabled={!draft.trim()}>
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
}
