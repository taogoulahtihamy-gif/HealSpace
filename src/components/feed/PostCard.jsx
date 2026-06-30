import { memo, useState } from "react";
import Avatar from "../common/Avatar.jsx";
import HighlightText from "../common/HighlightText.jsx";
import Badge from "../ui/Badge.jsx";
import ConfirmDialog from "../ui/ConfirmDialog.jsx";
import CommentSection from "./CommentSection.jsx";
import EditPostModal from "./EditPostModal.jsx";
import SharePostModal from "./SharePostModal.jsx";
import PostMenu from "./PostMenu.jsx";
import PostActions from "./PostActions.jsx";
import PostImage from "./PostImage.jsx";
import { useLikes } from "../../hooks/useLikes.js";
import { useComments } from "../../hooks/useComments.js";
import { useAuth } from "../../hooks/useAuth.js";
import { usePosts } from "../../hooks/usePosts.js";
import { useDisclosure } from "../../hooks/useDisclosure.js";
import { useNotifications } from "../../hooks/useNotifications.js";
import { parseCount } from "../../utils/formatters.js";
import { STORAGE_KEYS, MOOD_COLOR_BY_EMOJI } from "../../utils/constants.js";

// Petites fonctions locales de persistance (lecture/écriture directe de
// localStorage), gardées dans ce composant plutôt que dans un nouveau
// service, sur le même format que likeService/groupService (Set sérialisé).
function readIdSet(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function toggleIdInSet(key, id) {
  const set = readIdSet(key);
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
  window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
  return set;
}

// Durée de l'animation de suppression douce avant que le post ne disparaisse
// réellement du feed (cf. handleConfirmDelete plus bas).
const DELETE_ANIMATION_MS = 260;

function SharedPostPreview({ sharedFrom }) {
  return (
    <div className="shared-post-preview">
      <div className="shared-post-preview-header">
        <Avatar initial={sharedFrom.avatar} />
        <strong>{sharedFrom.author}</strong>
      </div>
      <p>
        <span>{sharedFrom.mood}</span> {sharedFrom.content}
      </p>
      <PostImage imageId={sharedFrom.image} />
    </div>
  );
}

function PostCard({ post, highlight = "" }) {
  const { isLiked, toggleLike } = useLikes();
  const { comments, addComment, updateComment, deleteComment } = useComments(post.id);
  const { user } = useAuth();
  const { updatePost, deletePost, sharePost } = usePosts();
  const { notify } = useNotifications();

  const menu = useDisclosure(false);
  const editModal = useDisclosure(false);
  const deleteDialog = useDisclosure(false);
  const shareModal = useDisclosure(false);

  const [isPopping, setIsPopping] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isSaved, setIsSaved] = useState(() => readIdSet(STORAGE_KEYS.SAVED_POSTS).has(post.id));
  const [isHidden, setIsHidden] = useState(() => readIdSet(STORAGE_KEYS.HIDDEN_POSTS).has(post.id));
  const [isDeleting, setIsDeleting] = useState(false);

  const liked = isLiked(post.id);
  const supportCount = parseCount(post.support) + (liked ? 1 : 0);
  const commentCount = post.comments + comments.length;

  const isOwner = Boolean(post.ownerId) && post.ownerId === user?.id;
  const moodColor = MOOD_COLOR_BY_EMOJI[post.mood];

  function handleSupportClick() {
    toggleLike(post.id);
    setIsPopping(true);
    window.setTimeout(() => setIsPopping(false), 260);
  }

  function handleAddComment(text) {
    addComment({
      text,
      author: user?.name || "Toi",
      avatar: user?.initial || "T",
    });
  }

  function handleSaveEdit(newContent) {
    updatePost(post.id, { content: newContent });
    editModal.close();
  }

  function handleConfirmDelete() {
    deleteDialog.close();
    // Animation de suppression douce : on laisse la carte s'estomper avant
    // de retirer réellement le post du feed (PostsContext.deletePost).
    setIsDeleting(true);
    window.setTimeout(() => deletePost(post.id), DELETE_ANIMATION_MS);
  }

  function handleShareInHealSpace(comment) {
    sharePost(post.id, { author: user, comment });
    shareModal.close();
  }

  function handleToggleSave() {
    const updated = toggleIdInSet(STORAGE_KEYS.SAVED_POSTS, post.id);
    const nowSaved = updated.has(post.id);
    setIsSaved(nowSaved);
    notify(nowSaved ? "Publication enregistrée 🔖" : "Retirée de tes enregistrements", "info");
    menu.close();
  }

  function handleCopyLink() {
    const fakeLink = `https://healspace.app/post/${post.id}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(fakeLink).then(() => notify("Lien copié dans le presse-papiers", "info"));
    }
    menu.close();
  }

  function handleToggleHide() {
    toggleIdInSet(STORAGE_KEYS.HIDDEN_POSTS, post.id);
    setIsHidden(true);
    menu.close();
  }

  function handleUnhide() {
    toggleIdInSet(STORAGE_KEYS.HIDDEN_POSTS, post.id);
    setIsHidden(false);
  }

  function handleReport() {
    notify("Signalement envoyé. Notre équipe va l’examiner. 🙏", "info");
    menu.close();
  }

  function handleExpandImagePlaceholder() {
    notify("L’agrandissement d’image arrive bientôt 🖼️", "info");
  }

  if (isHidden) {
    return (
      <article className="post-card post-card-hidden">
        <span>Publication masquée.</span>
        <button className="btn btn-ghost" onClick={handleUnhide}>
          Afficher quand même
        </button>
      </article>
    );
  }

  return (
    <article className={`post-card post-card-animated ${isDeleting ? "post-card-deleting" : ""}`.trim()}>
      <div className="post-header">
        <Avatar initial={post.avatar} />
        <div>
          <strong>{post.author}</strong>
          <div className="post-header-badges">
            <Badge variant="soft">{post.group}</Badge>
            {moodColor && <Badge color={moodColor}>{post.mood}</Badge>}
            <span className="post-time">{post.time}</span>
          </div>
        </div>

        <PostMenu
          isOpen={menu.isOpen}
          onToggle={menu.toggle}
          onClose={menu.close}
          isSaved={isSaved}
          isOwner={isOwner}
          onToggleSave={handleToggleSave}
          onCopyLink={handleCopyLink}
          onToggleHide={handleToggleHide}
          onEdit={() => {
            editModal.open();
            menu.close();
          }}
          onDelete={() => {
            deleteDialog.open();
            menu.close();
          }}
          onReport={handleReport}
        />
      </div>

      <p className="post-content"><HighlightText text={post.content} query={highlight} /></p>

      <PostImage imageId={post.image} onExpandPlaceholder={handleExpandImagePlaceholder} />

      {post.challenge && (
        <Badge variant="solid" color="#8b5cf6">
          {post.challenge.emoji} Défi : {post.challenge.label}
        </Badge>
      )}

      {post.sharedFrom && <SharedPostPreview sharedFrom={post.sharedFrom} />}

      <PostActions
        supportCount={supportCount}
        commentCount={commentCount}
        shareCount={post.shares}
        liked={liked}
        isPopping={isPopping}
        onSupportClick={handleSupportClick}
        showComments={showComments}
        onToggleComments={() => setShowComments((value) => !value)}
        onShareClick={shareModal.open}
      />

      {showComments && (
        <CommentSection
          comments={comments}
          onAddComment={handleAddComment}
          onUpdateComment={updateComment}
          onDeleteComment={deleteComment}
          currentUser={user}
        />
      )}

      {editModal.isOpen && (
        <EditPostModal
          isOpen={editModal.isOpen}
          initialContent={post.content}
          onClose={editModal.close}
          onSave={handleSaveEdit}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Supprimer la publication"
        message="Cette action est définitive. Les soutiens et commentaires liés seront aussi supprimés."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={deleteDialog.close}
      />

      {shareModal.isOpen && (
        <SharePostModal
          isOpen={shareModal.isOpen}
          post={post}
          onClose={shareModal.close}
          onShareInHealSpace={handleShareInHealSpace}
        />
      )}
    </article>
  );
}

// Évite les re-rendus inutiles de chaque carte quand seul un autre post
// du feed change (ex: ajout d'une nouvelle publication en tête de liste).
export default memo(PostCard);
