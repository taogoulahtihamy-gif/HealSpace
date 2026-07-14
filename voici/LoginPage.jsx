import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
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
    <main className="login-page login-page-v3">
      <section className="login-hero login-hero-v3">
        <div className="login-brand login-brand-v3">
          <span className="brand-orbit" aria-hidden="true"><i /><i /><i /></span>
          <span>HealSpace</span>
        </div>

        <div className="login-editorial">
          <span className="login-index">01 — ESPACE SÛR</span>
          <h1>Vous n’avez pas besoin d’aller bien pour être entendu.</h1>
          <p>Un réseau de soutien conçu pour parler avec sincérité, sans bruit et sans jugement.</p>
        </div>

        <div className="login-proof">
          <ShieldCheck size={16} />
          <span>Confidentialité, anonymat et contrôle de vos publications.</span>
        </div>
      </section>

      <section className="auth-card auth-card-v3">
        <div className="auth-card__topline">
          <span>Accès prototype</span>
          <Lock size={16} />
        </div>
        <h2>Reprendre là où vous vous êtes arrêté.</h2>
        <p>Utilisez les identifiants de démonstration déjà préparés.</p>

        <label>Email</label>
        <input value="ezekiel@healspace.app" readOnly />

        <label>Mot de passe</label>
        <input value="12345678" type="password" readOnly />

        <button onClick={handleLogin} disabled={isLoading}>
          <span>{isLoading ? "Connexion..." : "Entrer dans HealSpace"}</span>
          <ArrowRight size={16} />
        </button>

        <small>Prototype local : aucune donnée réelle n’est envoyée.</small>
      </section>
    </main>
  );
}
