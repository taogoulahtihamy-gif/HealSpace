import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  PhoneCall,
  Wind,
  BookOpen,
  UserRound,
  ArrowUpRight,
  MessageCircleMore,
  Check,
} from "lucide-react";
import { emergencyContacts, trustedContact } from "../data/mockData.js";
import { useDisclosure } from "../hooks/useDisclosure.js";
import { ROUTES } from "../utils/constants.js";

const BREATHING_PHASES = [
  { label: "Inspire", seconds: 4 },
  { label: "Retiens", seconds: 3 },
  { label: "Expire", seconds: 5 },
];
const CYCLE_LENGTH = BREATHING_PHASES.reduce((total, phase) => total + phase.seconds, 0);
const EXERCISE_DURATION = 60;

function getPhaseAtElapsed(elapsedSeconds) {
  const positionInCycle = elapsedSeconds % CYCLE_LENGTH;
  let cursor = 0;
  for (const phase of BREATHING_PHASES) {
    cursor += phase.seconds;
    if (positionInCycle < cursor) return phase.label;
  }
  return BREATHING_PHASES[0].label;
}

export default function EmergencyPage() {
  const navigate = useNavigate();
  const contactPanel = useDisclosure(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const isRunning = secondsLeft > 0;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isRunning) {
      window.clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(value - 1, 0));
    }, 1000);
    return () => window.clearInterval(intervalRef.current);
  }, [isRunning]);

  const elapsed = EXERCISE_DURATION - secondsLeft;
  const currentPhase = isRunning ? getPhaseAtElapsed(elapsed) : null;

  return (
    <main className="feed page-v4 emergency-page-v4">
      <section className="emergency-heading-v4">
        <span className="emergency-heading-v4__icon"><ShieldAlert /></span>
        <div>
          <span className="page-kicker-v4">Accès immédiat et discret</span>
          <h1>On commence par une seule chose : respirer.</h1>
          <p>Reste ici quelques instants. Tu peux ensuite choisir la prochaine étape qui te paraît possible.</p>
        </div>
      </section>

      <section className="emergency-hero-grid-v4">
        <article className={`breathing-card-v4 ${isRunning ? "is-running" : ""}`}>
          <div className="breathing-card-v4__copy">
            <span className="page-kicker-v4">Exercice de 60 secondes</span>
            <h2>{isRunning ? currentPhase : "Respiration guidée"}</h2>
            <p>Inspire 4 secondes, retiens 3 secondes, puis expire doucement pendant 5 secondes.</p>
          </div>

          <div className="breathing-visual-v4" aria-hidden="true">
            <div className={`breathing-orb-v4 breathing-orb-v4--${currentPhase?.toLowerCase() || "idle"}`}>
              <span>{isRunning ? secondsLeft : "60"}</span>
              <small>{isRunning ? "secondes" : "sec"}</small>
            </div>
          </div>

          <button className="breathing-start-v4" onClick={() => setSecondsLeft(isRunning ? 0 : EXERCISE_DURATION)}>
            <Wind size={19} /> {isRunning ? "Arrêter l’exercice" : "Commencer maintenant"}
          </button>
        </article>

        <article className="support-plan-v4">
          <span className="page-kicker-v4">Ton plan immédiat</span>
          <h2>Une étape à la fois</h2>
          <ol>
            <li><span><Check /></span><div><strong>Reviens au présent</strong><p>Pose les pieds au sol et termine une respiration complète.</p></div></li>
            <li><span><Check /></span><div><strong>Ne reste pas isolé·e</strong><p>Écris à une personne de confiance, même avec un message très court.</p></div></li>
            <li><span><Check /></span><div><strong>Demande un soutien direct</strong><p>Utilise l’un des contacts disponibles ci-dessous si tu en as besoin.</p></div></li>
          </ol>

          <div className="support-plan-v4__actions">
            <button onClick={contactPanel.toggle}><UserRound size={18} /> Personne de confiance</button>
            <button onClick={() => navigate(ROUTES.RESOURCES)}><BookOpen size={18} /> Ressources</button>
          </div>

          {contactPanel.isOpen && (
            <div className="trusted-contact-panel trusted-contact-panel-v4">
              <span className="trusted-contact-panel-v4__avatar">{trustedContact.name.charAt(0)}</span>
              <div>
                <strong>{trustedContact.name}</strong>
                <span>{trustedContact.relation}</span>
              </div>
              <a href={`tel:${trustedContact.phone.replace(/\s/g, "")}`}>{trustedContact.phone}</a>
            </div>
          )}
        </article>
      </section>

      <section className="emergency-contacts-v4">
        <div className="emergency-contacts-v4__heading">
          <div>
            <span className="page-kicker-v4">Présence humaine</span>
            <h2>Contacts d’écoute</h2>
            <p>Choisis le canal qui te demande le moins d’effort maintenant.</p>
          </div>
          <span className="availability-v4"><i /> Disponibles 24h/24</span>
        </div>

        <div className="emergency-contact-grid-v4">
          {emergencyContacts.map((contact, index) => {
            const isPhone = index === 0;
            const href = isPhone ? `tel:${contact.value.replace(/\s/g, "")}` : undefined;
            const Tag = isPhone ? "a" : "button";
            return (
              <Tag className="emergency-contact-card-v4" key={contact.id} href={href} type={isPhone ? undefined : "button"}>
                <span className="emergency-contact-card-v4__icon">
                  {isPhone ? <PhoneCall /> : <MessageCircleMore />}
                </span>
                <span className="emergency-contact-card-v4__copy">
                  <strong>{contact.label}</strong>
                  <span className="contact-value-v4">{contact.value}</span>
                  <small>{contact.available}</small>
                </span>
                <ArrowUpRight className="emergency-contact-card-v4__arrow" />
              </Tag>
            );
          })}
        </div>
      </section>

      <p className="emergency-disclaimer emergency-disclaimer-v4">
        HealSpace propose un espace de soutien et ne remplace pas un professionnel de santé ou les services d’urgence.
      </p>
    </main>
  );
}
