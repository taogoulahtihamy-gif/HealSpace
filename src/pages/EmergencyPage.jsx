import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, PhoneCall, Wind, BookOpen, UserRound } from "lucide-react";
import { emergencyContacts, trustedContact } from "../data/mockData.js";
import PageHeader from "../components/common/PageHeader.jsx";
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
    <main className="feed">
      <PageHeader
        title="Espace urgence"
        subtitle="Tu n’es pas seul·e. De l’aide est disponible immédiatement."
      />

      <section className="panic-card panic-card-full">
        <div className="panic-icon">
          <ShieldAlert size={28} />
        </div>
        <h3>Respire avec nous</h3>
        <p>Inspire 4 secondes, retiens 3 secondes, expire 5 secondes. L’exercice dure 60 secondes.</p>

        {isRunning ? (
          <div className="breathing-exercise">
            <div className={`breathing-circle breathing-circle-${currentPhase?.toLowerCase()}`} aria-hidden="true" />
            <div className="breathing-phase">{currentPhase}</div>
            <div className="breathing-timer">{secondsLeft}s restantes</div>
          </div>
        ) : (
          <button onClick={() => setSecondsLeft(EXERCISE_DURATION)}>
            <Wind size={18} /> Démarrer l’exercice de respiration
          </button>
        )}
      </section>

      <section className="panel crisis-plan">
        <div className="panel-title">
          <h3>Ton plan, étape par étape</h3>
        </div>
        <ol className="crisis-steps">
          <li>Respire. Prends 60 secondes avec l’exercice ci-dessus.</li>
          <li>Préviens quelqu’un de confiance, même par un simple message.</li>
          <li>Si besoin, contacte une ligne d’écoute ou un professionnel ci-dessous.</li>
        </ol>
      </section>

      <section className="panel emergency-actions">
        <button className="btn btn-ghost" onClick={contactPanel.toggle}>
          <UserRound size={18} /> Contacter une personne de confiance
        </button>
        <button className="btn btn-ghost" onClick={() => navigate(ROUTES.RESOURCES)}>
          <BookOpen size={18} /> Ressources d’urgence
        </button>

        {contactPanel.isOpen && (
          <div className="trusted-contact-panel">
            <strong>{trustedContact.name}</strong>
            <span>{trustedContact.relation}</span>
            <span>{trustedContact.phone}</span>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-title">
          <h3>Contacts d’écoute</h3>
        </div>
        {emergencyContacts.map((contact) => (
          <div className="emergency-row" key={contact.id}>
            <div className="resource-icon">
              <PhoneCall size={20} />
            </div>
            <div>
              <strong>{contact.label}</strong>
              <span>{contact.value} · {contact.available}</span>
            </div>
          </div>
        ))}
      </section>

      <p className="emergency-disclaimer">
        HealSpace ne remplace pas un professionnel de santé.
      </p>
    </main>
  );
}
