import { HeartHandshake, Lock, ShieldCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../utils/constants.js";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  async function handleLogin() {
    await login({ email: "ezekiel@healspace.app", password: "12345678" });
    navigate(ROUTES.HOME);
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="login-brand">
          <div className="logo-mark">H</div>
          <span>HealSpace</span>
        </div>

        <h1>Un réseau social pour parler, respirer et se reconstruire.</h1>

        <p>
          Une communauté de soutien émotionnel avec publications anonymes,
          groupes privés, messagerie et espace d’aide immédiate.
        </p>

        <div className="feature-list">
          <Feature icon={<Users />} title="Groupes de soutien" />
          <Feature icon={<HeartHandshake />} title="Réactions bienveillantes" />
          <Feature icon={<ShieldCheck />} title="Espace sécurisé" />
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-icon">
          <Lock />
        </div>

        <h2>Connexion démo</h2>
        <p>Prototype exécutable — aucune donnée réelle n’est envoyée.</p>

        <label>Email</label>
        <input value="ezekiel@healspace.app" readOnly />

        <label>Mot de passe</label>
        <input value="12345678" type="password" readOnly />

        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? "Connexion..." : "Entrer dans HealSpace"}
        </button>

        <small>
          La vraie authentification sera ajoutée avec Node.js, JWT et PostgreSQL.
        </small>
      </section>
    </main>
  );
}

function Feature({ icon, title }) {
  return (
    <div className="feature-pill">
      {icon}
      <span>{title}</span>
    </div>
  );
}
