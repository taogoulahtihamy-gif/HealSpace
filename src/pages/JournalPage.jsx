import { useState } from "react";
import { Flame, PenLine } from "lucide-react";
import { journalQuotes } from "../data/mockData.js";
import { MOODS, JOURNAL_WEEKLY_GOAL } from "../utils/constants.js";
import { useJournal } from "../hooks/useJournal.js";
import PageHeader from "../components/common/PageHeader.jsx";
import { useDisclosure } from "../hooks/useDisclosure.js";

// Petite échelle d'humeur pour transformer chaque emoji en hauteur de barre
// (mood tracker visuel simple, sans librairie de graphique).
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
    <main className="feed">
      <PageHeader
        title="Mes étapes"
        subtitle="Chaque étape compte, même la plus petite."
      />

      <section className="panel journal-progress-card">
        <div className="journal-progress-header">
          <strong>Progression de la semaine</strong>
          <span>{entries.length}/{JOURNAL_WEEKLY_GOAL} étapes notées</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="journal-streak">
          <Flame size={16} /> {streak} jours de suite
        </div>
      </section>

      <section className="panel journal-cta-card">
        {newEntryForm.isOpen ? (
          <form className="journal-entry-form" onSubmit={handleSubmit}>
            <div className="mood-picker">
              {MOODS.map((moodOption) => (
                <button
                  type="button"
                  key={moodOption.id}
                  className={`mood-chip ${selectedMood.id === moodOption.id ? "selected" : ""}`}
                  style={
                    selectedMood.id === moodOption.id
                      ? { backgroundColor: moodOption.color, borderColor: moodOption.color }
                      : { borderColor: `${moodOption.color}55` }
                  }
                  onClick={() => setSelectedMood(moodOption)}
                >
                  {moodOption.emoji}
                </button>
              ))}
            </div>
            <textarea
              autoFocus
              placeholder="Qu'est-ce qui s'est passé aujourd'hui ?"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
            />
            <div className="journal-entry-form-actions">
              <button type="button" className="btn btn-ghost" onClick={newEntryForm.close}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={!note.trim()}>
                Enregistrer cette étape
              </button>
            </div>
          </form>
        ) : (
          <button className="journal-new-entry-btn" onClick={newEntryForm.open}>
            <PenLine size={18} /> Écrire une nouvelle étape
          </button>
        )}
      </section>

      <section className="panel mood-graph-card">
        <div className="panel-title">
          <h3>Ton humeur récente</h3>
        </div>
        <div className="mood-graph">
          {entries
            .slice()
            .reverse()
            .map((entry) => (
              <div className="mood-bar-col" key={entry.id}>
                <div
                  className="mood-bar"
                  style={{ height: `${(MOOD_SCALE[entry.mood] || 3) * 16}px` }}
                  title={entry.mood}
                />
                <span>{entry.mood}</span>
              </div>
            ))}
        </div>
      </section>

      <blockquote className="journal-quote">“{quote}”</blockquote>

      <section className="panel">
        {entries.map((entry) => (
          <div className="journal-row" key={entry.id}>
            <span className="journal-mood">{entry.mood}</span>
            <div>
              <strong>{entry.date}</strong>
              <p>{entry.note}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
