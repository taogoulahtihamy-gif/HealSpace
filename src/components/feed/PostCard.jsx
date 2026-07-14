import {
  memo,
  useEffect,
  useState,
} from "react";

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
import {
  MOOD_COLOR_BY_EMOJI,
  STORAGE_KEYS,
} from "../../utils/constants.js";
import "../../styles/post-media.css";

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

  window.localStorage.setItem(
    key,
    JSON.stringify(Array.from(set)),
  );

  return set;
}

function isImageSource(value) {
  return (
    typeof value === "string" &&
    (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:image/") ||
      value.startsWith("blob:")
    )
  );
}

function FeedAvatar({ initial, imageUrl, name }) {
  if (isImageSource(imageUrl)) {
    return (
      <span className="feed-avatar feed-avatar-image">
        <img src={imageUrl} alt={name || "Profil"} />
      </span>
    );
  }

  return (
    <span className="feed-avatar">
      {initial || "?"}
    </span>
  );
}

const DELETE_ANIMATION_MS = 260;

function getCurrentUserName(user) {
  const fullName = [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user?.username || "Toi";
}

function SharedPostPreview({ sharedFrom }) {
  return (
    <div className="shared-post-preview">
      <div className="shared-post-preview-header">
        <FeedAvatar
          initial={sharedFrom.avatar}
          imageUrl={sharedFrom.avatarUrl}
          name={sharedFrom.author}
        />
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
  const {
    isLiked,
    toggleLike,
    loadReactionState,
    getSupportCount,
  } = useLikes();

  const {
    comments,
    addComment,
    updateComment,
    deleteComment,
  } = useComments(post.id);

  const { user } = useAuth();
  const {
    updatePost,
    deletePost,
    sharePost,
  } = usePosts();
  const { notify } = useNotifications();

  const menu = useDisclosure(false);
  const editModal = useDisclosure(false);
  const deleteDialog = useDisclosure(false);
  const shareModal = useDisclosure(false);

  const [isPopping, setIsPopping] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isSaved, setIsSaved] = useState(() =>
    readIdSet(STORAGE_KEYS.SAVED_POSTS).has(post.id),
  );
  const [isHidden, setIsHidden] = useState(() =>
    readIdSet(STORAGE_KEYS.HIDDEN_POSTS).has(post.id),
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadReactionState(post.id, user?.id);
  }, [loadReactionState, post.id, user?.id]);

  const liked = isLiked(post.id);
  const supportCount = getSupportCount(
    post.id,
    parseCount(post.support),
  );
  const commentCount = comments.length || post.comments || 0;

  const isOwner = Boolean(post.ownerId) && post.ownerId === user?.id;
  const moodColor = MOOD_COLOR_BY_EMOJI[post.mood];

  async function handleSupportClick() {
    try {
      await toggleLike(post.id);
      setIsPopping(true);
      window.setTimeout(() => setIsPopping(false), 260);
    } catch {
      notify(
        "Le soutien n'a pas pu être enregistré.",
        "error",
      );
    }
  }

  async function handleAddComment(text) {
    try {
      await addComment({
        text,
        author: getCurrentUserName(user),
        avatar:
          user?.username?.[0]?.toUpperCase() ||
          getCurrentUserName(user)[0] ||
          "T",
        avatarUrl: user?.avatar || null,
      });
    } catch {
      notify(
        "Le commentaire n'a pas pu être envoyé.",
        "error",
      );
    }
  }

  async function handleSaveEdit(newContent) {
    try {
      await updatePost(post.id, {
        content: newContent,
      });

      editModal.close();
    } catch {
      notify(
        "La modification n'a pas pu être enregistrée.",
        "error",
      );
    }
  }

  function handleConfirmDelete() {
    deleteDialog.close();
    setIsDeleting(true);

    window.setTimeout(
      () => deletePost(post.id),
      DELETE_ANIMATION_MS,
    );
  }

  function handleShareInHealSpace(comment) {
    sharePost(post.id, {
      author: user,
      comment,
    });

    shareModal.close();
  }

  function handleToggleSave() {
    const updated = toggleIdInSet(
      STORAGE_KEYS.SAVED_POSTS,
      post.id,
    );

    const nowSaved = updated.has(post.id);

    setIsSaved(nowSaved);

    notify(
      nowSaved
        ? "Publication enregistrée"
        : "Retirée de tes enregistrements",
      "info",
    );

    menu.close();
  }

  function handleCopyLink() {
    const link = `${window.location.origin}/post/${post.id}`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(link)
        .then(() =>
          notify(
            "Lien copié dans le presse-papiers",
            "info",
          ),
        );
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
    notify(
      "Signalement envoyé. Notre équipe va l’examiner.",
      "info",
    );

    menu.close();
  }

  function handleExpandImagePlaceholder() {
    notify("Cette image n’est pas encore disponible.", "info");
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
    <article
      className={`post-card post-card-animated ${
        isDeleting ? "post-card-deleting" : ""
      }`.trim()}
    >
      <div className="post-header">
        <FeedAvatar
          initial={post.avatar}
          imageUrl={post.avatarUrl}
          name={post.author}
        />

        <div>
          <strong>{post.author}</strong>
          <div className="post-header-badges">
            <Badge variant="soft">{post.group}</Badge>
            {moodColor && (
              <Badge color={moodColor}>{post.mood}</Badge>
            )}
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

      <p className="post-content">
        <HighlightText text={post.content} query={highlight} />
      </p>

      <PostImage
        imageId={post.image}
        alt={`Image publiée par ${post.author}`}
        onExpandPlaceholder={handleExpandImagePlaceholder}
      />

      {post.challenge && (
        <Badge variant="solid" color="#8b5cf6">
          {post.challenge.emoji} Défi : {post.challenge.label}
        </Badge>
      )}

      {post.sharedFrom && (
        <SharedPostPreview sharedFrom={post.sharedFrom} />
      )}

      <PostActions
        supportCount={supportCount}
        commentCount={commentCount}
        shareCount={post.shares}
        liked={liked}
        isPopping={isPopping}
        onSupportClick={handleSupportClick}
        showComments={showComments}
        onToggleComments={() =>
          setShowComments((value) => !value)
        }
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

export default memo(PostCard);
