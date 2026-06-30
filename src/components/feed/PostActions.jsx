import { HeartHandshake, MessageCircle, Send } from "lucide-react";
import AnimatedCounter from "../common/AnimatedCounter.jsx";
import { formatCount } from "../../utils/formatters.js";

export default function PostActions({
  supportCount,
  commentCount,
  shareCount,
  liked,
  isPopping,
  onSupportClick,
  showComments,
  onToggleComments,
  onShareClick,
}) {
  return (
    <>
      <div className="post-stats">
        <span>
          💙 <AnimatedCounter value={supportCount} formatter={formatCount} /> soutiens
        </span>
        <span>
          <AnimatedCounter value={commentCount} /> commentaires · {shareCount} partages
        </span>
      </div>

      <div className="post-actions">
        <button
          className={`support-btn ${liked ? "active" : ""} ${isPopping ? "pop" : ""}`.trim()}
          onClick={onSupportClick}
          aria-pressed={liked}
          aria-label={liked ? "Retirer ton soutien" : "Soutenir cette publication"}
        >
          <HeartHandshake size={18} /> Soutenir
        </button>
        <button
          className={`comment-toggle-btn ${showComments ? "active" : ""}`.trim()}
          onClick={onToggleComments}
          aria-expanded={showComments}
          aria-label="Afficher ou masquer les commentaires"
        >
          <MessageCircle size={18} /> Commenter
        </button>
        <button className="share-btn" onClick={onShareClick} aria-label="Partager cette publication">
          <Send size={18} /> Partager
        </button>
      </div>
    </>
  );
}
