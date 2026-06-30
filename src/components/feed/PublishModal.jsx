import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import Modal from "../common/Modal.jsx";
import PostImagePicker from "./PostImagePicker.jsx";
import ComposerHeader from "./composer/ComposerHeader.jsx";
import ComposerTextarea from "./composer/ComposerTextarea.jsx";
import DraftBanner from "./composer/DraftBanner.jsx";
import ImageUploader from "./composer/ImageUploader.jsx";
import MoodSelector from "./composer/MoodSelector.jsx";
import ChallengeSelector from "./composer/ChallengeSelector.jsx";
import IntentSelector from "./composer/IntentSelector.jsx";
import ComposerPreview from "./composer/ComposerPreview.jsx";
import ComposerFooter from "./composer/ComposerFooter.jsx";
import { useUI } from "../../hooks/useUI.js";
import { usePosts } from "../../hooks/usePosts.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotifications } from "../../hooks/useNotifications.js";
import { groups } from "../../data/mockData.js";
import {
  MOODS,
  CHALLENGES,
  DEFAULT_GROUP_OPTION,
  MAX_POST_LENGTH,
  STORAGE_KEYS,
} from "../../utils/constants.js";

// Brouillon automatique : lecture/écriture directe de localStorage (clé déjà
// existante STORAGE_KEYS.POST_DRAFT, aucun nouveau service nécessaire).
function readDraft() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.POST_DRAFT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeDraft(draft) {
  if (!draft || !draft.content) {
    window.localStorage.removeItem(STORAGE_KEYS.POST_DRAFT);
    return;
  }
  window.localStorage.setItem(STORAGE_KEYS.POST_DRAFT, JSON.stringify(draft));
}

function draftToState(draft) {
  return {
    content: draft.content || "",
    group: draft.group || DEFAULT_GROUP_OPTION,
    image: draft.image || null,
    mood: MOODS.find((m) => m.id === draft.moodId) || null,
    challenge: CHALLENGES.find((c) => c.id === draft.challengeId) || null,
  };
}

/**
 * Popup de création de publication ("Composer"). Orchestration uniquement :
 * chaque section (texte, photo, humeur, défi, intention, visibilité,
 * anonymat, aperçu, publication) est un composant dédié sous
 * components/feed/composer/, avec une seule responsabilité chacun.
 *
 * Toute la logique de soumission passe par PostsContext.addPost(), qui
 * appelle aujourd'hui postsService (local) et demain une vraie API REST —
 * ce composant n'aura rien à changer le jour où le backend sera branché.
 */
export default function PublishModal() {
  const { isComposerOpen, closeComposer, quickAnonymous, setQuickAnonymous, pendingImage, setPendingImage } = useUI();
  const { addPost } = usePosts();
  const { user } = useAuth();
  const { notify } = useNotifications();

  const [content, setContent] = useState("");
  const [group, setGroup] = useState(DEFAULT_GROUP_OPTION);
  const [mood, setMood] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [intent, setIntent] = useState(null);
  const [visibilityId, setVisibilityId] = useState("public");
  const [image, setImage] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(null);

  // À l'ouverture : si une image a été choisie depuis le bandeau du feed
  // (Composer.jsx), on l'applique directement. Sinon, si un brouillon existe,
  // on affiche une bannière plutôt que de le restaurer silencieusement.
  useEffect(() => {
    if (!isComposerOpen) return;

    if (pendingImage) {
      setImage(pendingImage);
      setPendingImage(null);
      return;
    }

    const draft = readDraft();
    if (draft && draft.content) {
      setPendingDraft(draft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComposerOpen]);

  // Sauvegarde continue du brouillon pendant la frappe (tant qu'aucune
  // bannière n'est en attente d'une réponse de l'utilisateur).
  useEffect(() => {
    if (!isComposerOpen || pendingDraft) return;
    writeDraft({ content, group, image, moodId: mood?.id, challengeId: challenge?.id });
  }, [isComposerOpen, pendingDraft, content, group, image, mood, challenge]);

  function resetForm() {
    setContent("");
    setGroup(DEFAULT_GROUP_OPTION);
    setMood(null);
    setChallenge(null);
    setIntent(null);
    setVisibilityId("public");
    setImage(null);
    setScheduledAt("");
    setPendingDraft(null);
  }

  function handleClose() {
    closeComposer();
  }

  function handleResumeDraft() {
    const restored = draftToState(pendingDraft);
    setContent(restored.content);
    setGroup(restored.group);
    setImage(restored.image);
    setMood(restored.mood);
    setChallenge(restored.challenge);
    setPendingDraft(null);
  }

  function handleDiscardDraft() {
    writeDraft(null);
    setPendingDraft(null);
  }

  function handleImageError(message) {
    notify(message, "info");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim() || isSubmitting || content.length > MAX_POST_LENGTH) return;

    setIsSubmitting(true);
    try {
      await addPost({
        content: content.trim(),
        anonymous: quickAnonymous,
        group,
        mood,
        image,
        challenge,
        intent,
        visibility: visibilityId,
        author: user || { name: "Toi", initial: "T" },
      });
      writeDraft(null);
      resetForm();
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  const authorName = quickAnonymous ? "Anonyme #••••" : user?.name || "Toi";
  const authorInitial = quickAnonymous ? "A" : user?.initial || "T";

  return (
    <Modal title="Créer une publication" isOpen={isComposerOpen} onClose={handleClose}>
      <form className="publish-form composer-premium" onSubmit={handleSubmit}>
        <ComposerHeader />

        {pendingDraft && (
          <DraftBanner onResume={handleResumeDraft} onDiscard={handleDiscardDraft} />
        )}

        <ComposerTextarea value={content} onChange={setContent} />

        {content.trim() && (
          <ComposerPreview
            authorName={authorName}
            authorInitial={authorInitial}
            content={content}
            mood={mood}
            image={image}
            challenge={challenge}
          />
        )}

        <div className="publish-field">
          <label>Photo</label>
          <ImageUploader image={image} onChange={setImage} onError={handleImageError} />

          {!image && (
            <>
              <span className="publish-field-or">ou choisis une ambiance</span>
              <PostImagePicker selectedId={image} onSelect={setImage} />
            </>
          )}
        </div>

        <div className="publish-field">
          <label>Humeur</label>
          <MoodSelector selected={mood} onSelect={setMood} />
        </div>

        <div className="publish-field">
          <label>Défi (facultatif)</label>
          <ChallengeSelector selected={challenge} onSelect={setChallenge} />
        </div>

        <div className="publish-field">
          <label>🤝 Que recherches-tu aujourd’hui ?</label>
          <IntentSelector selected={intent} onSelect={setIntent} />
        </div>

        <div className="publish-field">
          <label>Groupe</label>
          <select value={group} onChange={(event) => setGroup(event.target.value)}>
            <option value={DEFAULT_GROUP_OPTION}>{DEFAULT_GROUP_OPTION}</option>
            {groups.map((groupOption) => (
              <option key={groupOption.name} value={groupOption.name}>
                {groupOption.name}
              </option>
            ))}
          </select>
        </div>

        <div className="publish-field">
          <label>
            <Clock size={14} /> Publication programmée (bientôt disponible)
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            disabled
            className="scheduled-input-disabled"
          />
        </div>

        <ComposerFooter
          anonymous={quickAnonymous}
          onAnonymousChange={setQuickAnonymous}
          visibilityId={visibilityId}
          onVisibilityChange={setVisibilityId}
          canSubmit={Boolean(content.trim()) && content.length <= MAX_POST_LENGTH && !isSubmitting}
          isSubmitting={isSubmitting}
        />
      </form>
    </Modal>
  );
}
