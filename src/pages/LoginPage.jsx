import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";
import { forgotPassword } from "../services/api/auth.api.js";
import { ROUTES } from "../utils/constants.js";
import "../styles/auth.css";

const LOGIN_INITIAL_STATE = {
  email: "",
  password: "",
};

const REGISTER_INITIAL_STATE = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function getErrorMessage(error, fallback) {
  return (
    error?.body?.message ||
    error?.message ||
    fallback ||
    "Une erreur est survenue."
  );
}

function normalizeUsername(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

export default function LoginPage() {
  const {
    login,
    register,
    isLoading,
    isLoggedIn,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(LOGIN_INITIAL_STATE);
  const [registerForm, setRegisterForm] = useState(
    REGISTER_INITIAL_STATE,
  );
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const redirectPath = location.state?.from?.pathname || ROUTES.HOME;

  const pageTitle = useMemo(() => {
    if (mode === "register") {
      return "Créer un compte";
    }

    if (mode === "forgot") {
      return "Réinitialiser le mot de passe";
    }

    return "Connexion";
  }, [mode]);

  useEffect(() => {
    document.title = `${pageTitle} — HealSpace`;
  }, [pageTitle]);

  if (isLoggedIn) {
    return <Navigate to={redirectPath} replace />;
  }

  function resetFeedback() {
    setErrorMessage("");
    setSuccessMessage("");
  }

  function changeMode(nextMode) {
    resetFeedback();
    setShowPassword(false);
    setMode(nextMode);
  }

  function handleLoginChange(event) {
    resetFeedback();

    const { name, value } = event.target;

    setLoginForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleRegisterChange(event) {
    resetFeedback();

    const { name, value } = event.target;

    setRegisterForm((current) => ({
      ...current,
      [name]:
        name === "username"
          ? normalizeUsername(value)
          : value,
    }));
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    resetFeedback();

    try {
      await login({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Connexion impossible. Vérifiez vos identifiants.",
        ),
      );
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    resetFeedback();

    if (
      registerForm.password !==
      registerForm.confirmPassword
    ) {
      setErrorMessage(
        "Les deux mots de passe ne correspondent pas.",
      );
      return;
    }

    try {
      await register({
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
        username: normalizeUsername(registerForm.username),
        email: registerForm.email.trim(),
        password: registerForm.password,
      });

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "La création du compte a échoué.",
        ),
      );
    }
  }

  async function handleForgotSubmit(event) {
    event.preventDefault();
    resetFeedback();

    try {
      await forgotPassword(forgotEmail.trim());
      setSuccessMessage(
        "Si un compte correspond à cette adresse, une demande de réinitialisation a été prise en compte.",
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "La demande de réinitialisation a échoué.",
        ),
      );
    }
  }

  return (
    <main className="auth-page-clean">
      <section className="auth-left-panel" aria-label="Présentation">
        <div className="auth-left-content">
          <div className="auth-logo-block">
            <span className="auth-logo-symbol">H</span>
            <span>HealSpace</span>
          </div>

          <div className="auth-intro">
            <span className="auth-section-label">
              Espace personnel
            </span>

            <h1>Accédez à votre espace HealSpace.</h1>

            <p>
              Retrouvez votre journal, vos messages, vos groupes
              et vos ressources depuis un accès unique.
            </p>
          </div>

          <div className="auth-side-note">
            <span>Backend connecté</span>
            <strong>healspace-523w.onrender.com</strong>
          </div>
        </div>
      </section>

      <section className="auth-right-panel" aria-label="Authentification">
        <div className="auth-card-clean">
          <header className="auth-card-title">
            <span>Accès au compte</span>
            <h2>{pageTitle}</h2>
          </header>

          {mode !== "forgot" && (
            <div className="auth-switcher" role="tablist">
              <button
                type="button"
                className={mode === "login" ? "is-active" : ""}
                onClick={() => changeMode("login")}
              >
                Se connecter
              </button>

              <button
                type="button"
                className={
                  mode === "register" ? "is-active" : ""
                }
                onClick={() => changeMode("register")}
              >
                Créer un compte
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="auth-message auth-message-error">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="auth-message auth-message-success">
              {successMessage}
            </div>
          )}

          {mode === "login" && (
            <form
              className="auth-form-clean"
              onSubmit={handleLoginSubmit}
            >
              <label className="auth-control">
                <span>Adresse email</span>
                <div className="auth-control-input">
                  <Mail size={18} />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="adresse@email.com"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
              </label>

              <label className="auth-control">
                <span>Mot de passe</span>
                <div className="auth-control-input">
                  <Lock size={18} />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Votre mot de passe"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>

              <div className="auth-form-row">
                <span>Connexion sécurisée</span>
                <button
                  type="button"
                  onClick={() => changeMode("forgot")}
                >
                  Mot de passe oublié
                </button>
              </div>

              <button
                type="submit"
                className="auth-primary-button"
                disabled={isLoading}
              >
                <span>
                  {isLoading
                    ? "Connexion en cours..."
                    : "Se connecter"}
                </span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {mode === "register" && (
            <form
              className="auth-form-clean"
              onSubmit={handleRegisterSubmit}
            >
              <div className="auth-form-grid">
                <label className="auth-control">
                  <span>Prénom</span>
                  <div className="auth-control-input">
                    <User size={18} />
                    <input
                      name="firstName"
                      autoComplete="given-name"
                      placeholder="Votre prénom"
                      value={registerForm.firstName}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                </label>

                <label className="auth-control">
                  <span>Nom</span>
                  <div className="auth-control-input">
                    <User size={18} />
                    <input
                      name="lastName"
                      autoComplete="family-name"
                      placeholder="Votre nom"
                      value={registerForm.lastName}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                </label>
              </div>

              <label className="auth-control">
                <span>Nom d’utilisateur</span>
                <div className="auth-control-input">
                  <User size={18} />
                  <input
                    name="username"
                    autoComplete="username"
                    placeholder="nom_utilisateur"
                    value={registerForm.username}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
              </label>

              <label className="auth-control">
                <span>Adresse email</span>
                <div className="auth-control-input">
                  <Mail size={18} />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="adresse@email.com"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
              </label>

              <div className="auth-form-grid">
                <label className="auth-control">
                  <span>Mot de passe</span>
                  <div className="auth-control-input">
                    <Lock size={18} />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Minimum 8 caractères"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      minLength={8}
                      required
                    />
                  </div>
                </label>

                <label className="auth-control">
                  <span>Confirmation</span>
                  <div className="auth-control-input">
                    <Lock size={18} />
                    <input
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirmer"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      minLength={8}
                      required
                    />
                  </div>
                </label>
              </div>

              <button
                type="button"
                className="auth-secondary-button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
              >
                {showPassword
                  ? "Masquer les mots de passe"
                  : "Afficher les mots de passe"}
              </button>

              <button
                type="submit"
                className="auth-primary-button"
                disabled={isLoading}
              >
                <span>
                  {isLoading
                    ? "Création en cours..."
                    : "Créer le compte"}
                </span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {mode === "forgot" && (
            <form
              className="auth-form-clean"
              onSubmit={handleForgotSubmit}
            >
              <p className="auth-helper-text">
                Indiquez l’adresse associée au compte.
              </p>

              <label className="auth-control">
                <span>Adresse email</span>
                <div className="auth-control-input">
                  <Mail size={18} />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="adresse@email.com"
                    value={forgotEmail}
                    onChange={(event) => {
                      resetFeedback();
                      setForgotEmail(event.target.value);
                    }}
                    required
                  />
                </div>
              </label>

              <button
                type="submit"
                className="auth-primary-button"
                disabled={isLoading}
              >
                <span>
                  {isLoading
                    ? "Traitement..."
                    : "Envoyer la demande"}
                </span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="auth-secondary-button"
                onClick={() => changeMode("login")}
              >
                Retour à la connexion
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
