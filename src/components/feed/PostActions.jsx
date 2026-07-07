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
      <div className="post-stats post-stats-v3">
        <span><AnimatedCounter value={supportCount} formatter={formatCount} /> soutiens</span>
        <span><AnimatedCounter value={commentCount} /> réponses · {shareCount} partages</span>
      </div>

      <div className="post-actions post-actions-v3">
        <button
          className={`support-btn ${liked ? "active" : ""} ${isPopping ? "pop" : ""}`.trim()}
          onClick={onSupportClick}
          aria-pressed={liked}
        >
          <HeartHandshake size={15} /> Soutenir
        </button>
        <button
          className={`comment-toggle-btn ${showComments ? "active" : ""}`.trim()}
          onClick={onToggleComments}
          aria-expanded={showComments}
        >
          <MessageCircle size={15} /> Répondre
        </button>
        <button className="share-btn" onClick={onShareClick}>
          <Send size={15} /> Partager
        </button>
      </div>
    </>
  );
}
