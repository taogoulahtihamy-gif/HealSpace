import {
  Camera,
  Check,
  Edit3,
  Eye,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Save,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ActivityTimeline from "../components/profile/ActivityTimeline.jsx";
import PostList from "../components/feed/PostList.jsx";
import ProfileStats from "../components/profile/ProfileStats.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useGroups } from "../hooks/useGroups.js";
import { useJournal } from "../hooks/useJournal.js";
import { usePosts } from "../hooks/usePosts.js";
import { commentService } from "../services/commentService.js";
import { uploadMedia } from "../services/api/media.api.js";
import { updateMyProfile } from "../services/api/users.api.js";
import { parseCount } from "../utils/formatters.js";
import "../styles/profile.css";

const DEFAULT_PROFILE_FORM = {
  firstName: "",
  lastName: "",
  username: "",
  bio: "",
  city: "",
  country: "",
  currentMood: "",
};

const MOOD_OPTIONS = [
  { value: "", label: "Non renseigné" },
  { value: "CALM", label: "Calme" },
  { value: "HAPPY", label: "Bien" },
  { value: "SAD", label: "Triste" },
  { value: "ANXIOUS", label: "Anxieux(se)" },
  { value: "ANGRY", label: "Énervé(e)" },
  { value: "TIRED", label: "Fatigué(e)" },
];

function getFullName(user) {
  const fullName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user?.username || user?.email || "Utilisateur";
}

function getInitials(user) {
  const source = getFullName(user);

  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getAuthorKeys(user) {
  return [
    user?.name,
    getFullName(user),
    user?.username,
    user?.email,
  ].filter(Boolean);
}

function extractMediaUrl(response) {
  return (
    response?.data?.url ||
    response?.url ||
    response?.data?.media?.url ||
    ""
  );
}

function buildInitialForm(user) {
  return {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    bio: user?.bio || "",
    city: user?.city || "",
    country: user?.country || "",
    currentMood: user?.currentMood || "",
  };
}

export default function ProfilePage() {
  const { user, refreshCurrentUser } = useAuth();
  const { posts } = usePosts();
  const { joinedNames } = useGroups();
  const { entries: journalEntries } = useJournal();

  const fileInputRef = useRef(null);

  const [commentsWritten, setCommentsWritten] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState(DEFAULT_PROFILE_FORM);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isAvatarViewerOpen, setIsAvatarViewerOpen] = useState(false);

  const displayName = getFullName(user);
  const initials = getInitials(user);
  const authorKeys = useMemo(() => getAuthorKeys(user), [user]);

  const avatarUrl = avatarPreview || user?.avatar || "";

  const myPosts = useMemo(
    () =>
      posts.filter((post) =>
        authorKeys.some(
          (authorKey) =>
            post.author === authorKey ||
            post.authorId === user?.id,
        ),
      ),
    [posts, authorKeys, user?.id],
  );

  const supportsReceived = myPosts.reduce(
    (total, post) => total + parseCount(post.support),
    0,
  );

  useEffect(() => {
    setProfileForm(buildInitialForm(user));
    setAvatarPreview("");
  }, [user]);

  useEffect(() => {
    function closeAvatarMenu(event) {
      if (!event.target.closest(".profile-avatar-zone")) {
        setIsAvatarMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeAvatarMenu);

    return () => {
      document.removeEventListener("mousedown", closeAvatarMenu);
    };
  }, []);

  useEffect(() => {
    if (!displayName) {
      return undefined;
    }

    let isMounted = true;

    commentService.getCountByAuthor(displayName).then((count) => {
      if (isMounted) {
        setCommentsWritten(count);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [displayName]);

  const stats = [
    { label: "Publications", value: myPosts.length },
    { label: "Soutiens reçus", value: supportsReceived },
    { label: "Commentaires écrits", value: commentsWritten },
    { label: "Compagnons rejoints", value: joinedNames.size },
  ];

  const badges = [
    myPosts.length >= 1 && {
      icon: "🌱",
      label: "Premier pas",
    },
    joinedNames.size >= 1 && {
      icon: "🤝",
      label: "Compagnon actif",
    },
    supportsReceived >= 10 && {
      icon: "🏅",
      label: "Soutenu·e par la communauté",
    },
  ].filter(Boolean);

  const streak = journalEntries.length;

  const activityItems = [
    ...myPosts.map((post) => ({
      icon: post.mood || "💬",
      label: `Publication : "${post.content.slice(0, 60)}${
        post.content.length > 60 ? "…" : ""
      }"`,
      time: post.time,
    })),
    ...journalEntries.slice(0, 3).map((entry) => ({
      icon: entry.mood,
      label: `Étape de journal : ${entry.note}`,
      time: entry.date,
    })),
  ];

  function resetFeedback() {
    setProfileMessage("");
    setProfileError("");
  }

  function handleFormChange(event) {
    resetFeedback();

    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: name === "username" ? value.trim().toLowerCase() : value,
    }));
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    resetFeedback();

    if (!file.type.startsWith("image/")) {
      setProfileError("Le fichier sélectionné doit être une image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      setIsUploadingAvatar(true);

      const mediaResponse = await uploadMedia(file);
      const uploadedUrl = extractMediaUrl(mediaResponse);

      if (!uploadedUrl) {
        throw new Error("L'URL de la photo n'a pas été retournée.");
      }

      await updateMyProfile({
        avatar: uploadedUrl,
      });

      await refreshCurrentUser();

      setAvatarPreview("");
      setProfileMessage("Photo de profil mise à jour.");
    } catch (error) {
      setAvatarPreview("");
      setProfileError(
        error?.body?.message ||
          error?.message ||
          "La photo de profil n'a pas pu être mise à jour.",
      );
    } finally {
      setIsUploadingAvatar(false);
      setIsAvatarMenuOpen(false);
      event.target.value = "";
      URL.revokeObjectURL(previewUrl);
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    resetFeedback();

    try {
      setIsSavingProfile(true);

      await updateMyProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        username: profileForm.username.trim(),
        bio: profileForm.bio.trim() || null,
        city: profileForm.city.trim() || null,
        country: profileForm.country.trim() || null,
        currentMood: profileForm.currentMood || null,
      });

      await refreshCurrentUser();

      setIsEditing(false);
      setProfileMessage("Profil mis à jour.");
    } catch (error) {
      setProfileError(
        error?.body?.message ||
          error?.message ||
          "La mise à jour du profil a échoué.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  function cancelEdition() {
    resetFeedback();
    setProfileForm(buildInitialForm(user));
    setIsEditing(false);
  }

  return (
    <main className="feed profile-page">
      <section className="profile-hero-card">
        <div className="profile-cover" />

        <div className="profile-main-row">
          <div className="profile-avatar-zone">
            <button
              type="button"
              className="profile-avatar-button"
              onClick={() =>
                setIsAvatarMenuOpen((current) => !current)
              }
              disabled={isUploadingAvatar}
              aria-label="Options de la photo de profil"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} />
              ) : (
                <span>{initials}</span>
              )}

              <span className="profile-avatar-overlay">
                {isUploadingAvatar ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <Camera size={18} />
                )}
              </span>
            </button>

            {isAvatarMenuOpen && (
              <div className="profile-avatar-menu">
                <button
                  type="button"
                  onClick={() => {
                    setIsAvatarMenuOpen(false);
                    setIsAvatarViewerOpen(true);
                  }}
                  disabled={!avatarUrl}
                >
                  <Eye size={16} />
                  Voir la photo
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAvatarMenuOpen(false);
                    fileInputRef.current?.click();
                  }}
                >
                  <ImagePlus size={16} />
                  Modifier la photo
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="profile-file-input"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="profile-identity">
            <div className="profile-title-line">
              <div>
                <h2>{displayName}</h2>
                <p>@{user?.username || "utilisateur"}</p>
              </div>

              {user?.isVerified && (
                <span className="profile-status-badge">
                  <Check size={14} />
                  Vérifié
                </span>
              )}
            </div>

            <div className="profile-meta-row">
              <span>
                <Mail size={15} />
                {user?.email || "Email non renseigné"}
              </span>

              {(user?.city || user?.country) && (
                <span>
                  <MapPin size={15} />
                  {[user?.city, user?.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}

              {user?.currentMood && (
                <span>
                  <UserRound size={15} />
                  Humeur : {user.currentMood}
                </span>
              )}
            </div>

            {user?.bio && <p className="profile-bio">{user.bio}</p>}

            {(badges.length > 0 || streak > 0) && (
              <div className="profile-badges">
                {badges.map((badge) => (
                  <span key={badge.label}>
                    {badge.icon} {badge.label}
                  </span>
                ))}

                {streak > 0 && (
                  <span>🔥 {streak} jour(s) de journal</span>
                )}
              </div>
            )}
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button
                type="button"
                className="profile-edit-button"
                onClick={() => {
                  resetFeedback();
                  setIsEditing(true);
                }}
              >
                <Edit3 size={16} />
                Modifier
              </button>
            ) : (
              <button
                type="button"
                className="profile-cancel-button"
                onClick={cancelEdition}
              >
                <X size={16} />
                Annuler
              </button>
            )}
          </div>
        </div>
      </section>

      {(profileMessage || profileError) && (
        <div
          className={
            profileError
              ? "profile-feedback profile-feedback-error"
              : "profile-feedback profile-feedback-success"
          }
        >
          {profileError || profileMessage}
        </div>
      )}

      {isEditing && (
        <section className="panel profile-edit-panel">
          <div className="panel-title">
            <h3>Informations du profil</h3>
          </div>

          <form
            className="profile-form"
            onSubmit={handleProfileSubmit}
          >
            <div className="profile-form-grid">
              <label>
                <span>Prénom</span>
                <input
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleFormChange}
                  required
                />
              </label>

              <label>
                <span>Nom</span>
                <input
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleFormChange}
                  required
                />
              </label>
            </div>

            <div className="profile-form-grid">
              <label>
                <span>Nom d’utilisateur</span>
                <input
                  name="username"
                  value={profileForm.username}
                  onChange={handleFormChange}
                  required
                />
              </label>

              <label>
                <span>Humeur actuelle</span>
                <select
                  name="currentMood"
                  value={profileForm.currentMood}
                  onChange={handleFormChange}
                >
                  {MOOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              <span>Bio</span>
              <textarea
                name="bio"
                rows={4}
                value={profileForm.bio}
                onChange={handleFormChange}
                placeholder="Présentez brièvement votre espace ou votre état d’esprit."
              />
            </label>

            <div className="profile-form-grid">
              <label>
                <span>Ville</span>
                <input
                  name="city"
                  value={profileForm.city}
                  onChange={handleFormChange}
                  placeholder="Ville"
                />
              </label>

              <label>
                <span>Pays</span>
                <input
                  name="country"
                  value={profileForm.country}
                  onChange={handleFormChange}
                  placeholder="Pays"
                />
              </label>
            </div>

            <div className="profile-form-actions">
              <button
                type="button"
                className="profile-cancel-button"
                onClick={cancelEdition}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="profile-save-button"
                disabled={isSavingProfile}
              >
                {isSavingProfile ? (
                  <Loader2 size={16} className="spin" />
                ) : (
                  <Save size={16} />
                )}
                Enregistrer
              </button>
            </div>
          </form>
        </section>
      )}

      <ProfileStats stats={stats} />

      <section className="panel">
        <div className="panel-title">
          <h3>Activité récente</h3>
        </div>
        <ActivityTimeline items={activityItems} />
      </section>

      <PostList posts={myPosts} />

      {isAvatarViewerOpen && (
        <div
          className="profile-avatar-viewer"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsAvatarViewerOpen(false)}
        >
          <button
            type="button"
            className="profile-avatar-viewer-close"
            onClick={() => setIsAvatarViewerOpen(false)}
          >
            <X size={18} />
          </button>

          <img
            src={avatarUrl}
            alt={displayName}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
