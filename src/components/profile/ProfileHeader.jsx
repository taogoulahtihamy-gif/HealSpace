import { Pencil, Flame } from "lucide-react";
import Avatar from "../common/Avatar.jsx";

export default function ProfileHeader({ user, badges = [], streak = 0 }) {
  return (
    <section className="profile-header-card">
      <div className="profile-cover" aria-hidden="true" />

      <div className="profile-header-body">
        <div className="profile-avatar-ring">
          <Avatar initial={user?.initial || "?"} size="lg" />
        </div>

        <div className="profile-identity">
          <h2>{user?.name || "Invité"}</h2>
          <span className="profile-status-badge">
            {user?.status || "Membre HealSpace"}
          </span>
        </div>

        {user?.bio && <p className="profile-bio">{user.bio}</p>}

        {(badges.length > 0 || streak > 0) && (
          <div className="profile-badges">
            {streak > 0 && (
              <span className="profile-badge profile-streak">
                <Flame size={14} /> {streak} jours de suite
              </span>
            )}
            {badges.map((badge) => (
              <span className="profile-badge" key={badge.label}>
                {badge.icon} {badge.label}
              </span>
            ))}
          </div>
        )}

        {/* Bouton volontairement non fonctionnel pour l'instant (cf. consigne) :
            visible pour préparer l'arrivée d'un vrai formulaire d'édition. */}
        <button className="btn btn-ghost profile-edit-btn" type="button">
          <Pencil size={16} /> Modifier le profil
        </button>
      </div>
    </section>
  );
}
