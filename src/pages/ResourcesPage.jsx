import { useState } from "react";
import {
  BookOpen,
  Heart,
  Search,
  CheckCircle2,
  Headphones,
  PlayCircle,
  ArrowUpRight,
  Clock3,
} from "lucide-react";
import { resources } from "../data/mockData.js";
import EmptyState from "../components/common/EmptyState.jsx";
import { useFavorites } from "../hooks/useFavorites.js";
import { STORAGE_KEYS } from "../utils/constants.js";

const CATEGORIES = ["Tous", "Article", "Audio guidé", "Vidéo", "Favoris"];

function readReadIds() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.RESOURCES_READ);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function ResourceIcon({ type }) {
  if (type === "Audio guidé") return <Headphones />;
  if (type === "Vidéo") return <PlayCircle />;
  return <BookOpen />;
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
    <main className="feed page-v4 resources-page-v4">
      <section className="page-intro-v4 page-intro-v4--resources">
        <div className="page-intro-v4__copy">
          <span className="page-kicker-v4">Bibliothèque apaisée</span>
          <h1>Des outils simples pour retrouver de l’espace mental.</h1>
          <p>Lis, écoute ou regarde un contenu court, choisi pour être utile sans te surcharger.</p>
        </div>
        <div className="resource-feature-v4">
          <span className="resource-feature-v4__icon"><Headphones /></span>
          <div>
            <span>À écouter aujourd’hui</span>
            <strong>Respiration guidée · 8 min</strong>
          </div>
          <button aria-label="Ouvrir la ressource" onClick={() => markAsRead("res_2")}><ArrowUpRight /></button>
        </div>
      </section>

      <section className="page-controls-v4 page-controls-v4--resources">
        <label className="page-searchbar page-searchbar-v4">
          <Search size={19} />
          <input
            placeholder="Rechercher un thème ou un exercice"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="filters resource-tabs-v4" role="tablist">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              role="tab"
              aria-selected={activeCategory === category}
              className={activeCategory === category ? "selected" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {visibleResources.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={32} />}
          title="Aucune ressource ici"
          description="Essaie une autre catégorie ou un autre mot-clé."
        />
      ) : (
        <section className="resource-grid-v4">
          {visibleResources.map((resource, index) => (
            <article className={`resource-card-v4 resource-card-v4--${index % 3}`} key={resource.id}>
              <div className="resource-card-v4__top">
                <span className="resource-card-v4__icon"><ResourceIcon type={resource.type} /></span>
                <button
                  className={`favorite-btn ${isFavorite(resource.id) ? "active" : ""}`}
                  aria-label={isFavorite(resource.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                  onClick={() => toggleFavorite(resource.id)}
                >
                  <Heart size={19} fill={isFavorite(resource.id) ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="resource-card-v4__content">
                <span className="resource-card-v4__type">{resource.type}</span>
                <h2>{resource.title}</h2>
                <p>Un format court et concret à utiliser maintenant ou à garder pour plus tard.</p>
              </div>

              <div className="resource-card-v4__footer">
                <span><Clock3 size={15} /> {resource.duration}</span>
                {readIds.has(resource.id) ? (
                  <span className="read-tag"><CheckCircle2 size={15} /> Terminé</span>
                ) : (
                  <button className="resource-open-btn-v4" onClick={() => markAsRead(resource.id)}>
                    Ouvrir <ArrowUpRight size={16} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
