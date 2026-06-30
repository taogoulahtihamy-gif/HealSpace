import { useState } from "react";
import { BookOpen, Heart, Search, CheckCircle2 } from "lucide-react";
import { resources } from "../data/mockData.js";
import PageHeader from "../components/common/PageHeader.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { useFavorites } from "../hooks/useFavorites.js";
import { STORAGE_KEYS } from "../utils/constants.js";

const CATEGORIES = ["Tous", "Article", "Audio guidé", "Vidéo", "Favoris"];

// Suivi de lecture : Set persisté en localStorage, lu/écrit directement ici
// (pas de nouveau service ce sprint), même format que les autres clés.
function readReadIds() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.RESOURCES_READ);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export default function ResourcesPage() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [query, setQuery] = useState("");
  const [readIds, setReadIds] = useState(readReadIds);

  function markAsRead(resourceId) {
    setReadIds((current) => {
      const updated = new Set(current).add(resourceId);
      window.localStorage.setItem(STORAGE_KEYS.RESOURCES_READ, JSON.stringify(Array.from(updated)));
      return updated;
    });
  }

  const visibleResources = resources
    .filter((resource) => {
      if (activeCategory === "Favoris") return isFavorite(resource.id);
      if (activeCategory === "Tous") return true;
      return resource.type === activeCategory;
    })
    .filter((resource) => resource.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <main className="feed">
      <PageHeader
        title="Ressources"
        subtitle="Des contenus pensés pour t’accompagner à ton rythme."
      />

      <label className="page-searchbar">
        <Search size={18} />
        <input
          placeholder="Rechercher une ressource..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <section className="filters">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={activeCategory === category ? "selected" : ""}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </section>

      <section className="panel">
        {visibleResources.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={32} />}
            title="Aucune ressource ici"
            description="Essaie une autre catégorie ou un autre mot-clé."
          />
        ) : (
          visibleResources.map((resource) => (
            <div className="resource-row" key={resource.id}>
              <div className="resource-icon">
                <BookOpen size={20} />
              </div>
              <div>
                <strong>
                  {resource.title} {readIds.has(resource.id) && <span className="read-tag"><CheckCircle2 size={13} /> Lu</span>}
                </strong>
                <span>{resource.type} · {resource.duration}</span>
              </div>
              <button
                className={`favorite-btn ${isFavorite(resource.id) ? "active" : ""}`}
                onClick={() => toggleFavorite(resource.id)}
                aria-label="Ajouter aux favoris"
                aria-pressed={isFavorite(resource.id)}
              >
                <Heart size={18} />
              </button>
              <button className="btn btn-ghost" onClick={() => markAsRead(resource.id)}>
                Ouvrir
              </button>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
