import { useState } from "react";
import { Flame, PenLine, TrendingUp, CalendarCheck2 } from "lucide-react";
import { journalQuotes } from "../data/mockData.js";
import { MOODS, JOURNAL_WEEKLY_GOAL } from "../utils/constants.js";
import { useJournal } from "../hooks/useJournal.js";
import { useDisclosure } from "../hooks/useDisclosure.js";

const MOOD_SCALE = { "😊": 5, "😔": 2, "😡": 2, "😰": 2, "😌": 4, "🥹": 4, "😴": 3, "❤️": 5, "😶": 3, "🌱": 4, "💪": 5, "✨": 5 };

export default function JournalPage() {
  const { entries, addEntry } = useJournal();
  const newEntryForm = useDisclosure(false);
  const [note, setNote] = useState("");
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);

  const progress = Math.min(entries.length / JOURNAL_WEEKLY_GOAL, 1);
  const streak = entries.length;
  const quote = journalQuotes[streak % journalQuotes.length];

  function handleSubmit(event) {
    event.preventDefault();
    if (!note.trim()) return;
    addEntry({ mood: selectedMood.emoji, note: note.trim() });
    setNote("");
    newEntryForm.close();
  }

  return (
    <main className="feed page-v4 journal-page-v4">
      <section className="page-intro-v4 page-intro-v4--journal">
        <div className="page-intro-v4__copy">
          <span className="page-kicker-v4">Journal personnel</span>
          <h1>Observe ton chemin, sans te juger.</h1>
          <p>Quelques mots suffisent pour voir les progrès que les journées difficiles cachent parfois.</p>
        </div>
        <button className="page-primary-action-v4" onClick={newEntryForm.open}>
          <PenLine size={18} /> Noter mon étape
        </button>
      </section>

      {newEntryForm.isOpen && (
        <section className="panel journal-entry-card-v4">
          <form className="journal-entry-form" onSubmit={handleSubmit}>
            <div className="journal-entry-card-v4__header">
              <div>
                <span className="page-kicker-v4">Nouveau repère</span>
                <h2>Comment s’est passée ta journée ?</h2>
              </div>
              <div className="mood-picker mood-picker-v4" aria-label="Choisir une humeur">
                {MOODS.map((moodOption) => (
                  <button
                    type="button"
                    key={moodOption.id}
                    className={`mood-chip ${selectedMood.id === moodOption.id ? "selected" : ""}`}
                    onClick={() => setSelectedMood(moodOption)}
                    title={moodOption.label}
                  >
                    {moodOption.emoji}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              autoFocus
              placeholder="Écris librement ce que tu veux retenir…"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
            />
            <div className="journal-entry-form-actions">
              <button type="button" className="btn btn-ghost" onClick={newEntryForm.close}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={!note.trim()}>Enregistrer</button>
            </div>
          </form>
        </section>
      )}

      <section className="journal-dashboard-v4">
        <article className="panel journal-progress-card journal-progress-card-v4">
          <div className="journal-card-icon-v4"><TrendingUp /></div>
          <div className="journal-progress-header">
            <div>
              <span className="page-kicker-v4">Cette semaine</span>
              <strong>{entries.length} étapes sur {JOURNAL_WEEKLY_GOAL}</strong>
            </div>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progress * 100}%` }} /></div>
          <div className="journal-streak"><Flame size={17} /> {streak} jours de continuité</div>
        </article>

        <article className="panel mood-graph-card mood-graph-card-v4">
          <div className="journal-card-icon-v4"><CalendarCheck2 /></div>
          <div className="panel-title">
            <div>
              <span className="page-kicker-v4">Tendance récente</span>
              <h3>Ton énergie au fil des jours</h3>
            </div>
          </div>
          <div className="mood-graph mood-graph-v4">
            {entries.slice().reverse().map((entry) => (
              <div className="mood-bar-col" key={entry.id} title={`${entry.date} : ${entry.mood}`}>
                <div className="mood-bar" style={{ height: `${(MOOD_SCALE[entry.mood] || 3) * 18}px` }} />
                <span>{entry.mood}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <blockquote className="journal-quote journal-quote-v4">“{quote}”</blockquote>

      <section className="panel journal-timeline-v4">
        <div className="panel-title journal-timeline-v4__title">
          <div>
            <span className="page-kicker-v4">Tes repères</span>
            <h3>Dernières étapes</h3>
          </div>
          {!newEntryForm.isOpen && (
            <button className="journal-inline-action-v4" onClick={newEntryForm.open}><PenLine size={16} /> Ajouter</button>
          )}
        </div>
        <div className="journal-timeline-v4__list">
          {entries.map((entry, index) => (
            <article className="journal-row journal-row-v4" key={entry.id}>
              <div className="journal-row-v4__rail"><i />{index < entries.length - 1 && <span />}</div>
              <span className="journal-mood">{entry.mood}</span>
              <div>
                <strong>{entry.date}</strong>
                <p>{entry.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
