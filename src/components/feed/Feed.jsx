import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { usePosts } from "../../hooks/usePosts.js";
import { useSearch } from "../../hooks/useSearch.js";
import { useUI } from "../../hooks/useUI.js";
import { filterPostsByCategory, filterPostsBySearch } from "../../utils/postFilters.js";
import { FEED_FILTERS } from "../../utils/constants.js";
import Composer from "./Composer.jsx";
import PostList from "./PostList.jsx";
import StoriesRow from "./StoriesRow.jsx";
import EmptyState from "../common/EmptyState.jsx";

export default function Feed() {
  const { posts } = usePosts();
  const { query, setQuery } = useSearch();
  const { openComposer } = useUI();
  const [activeFilter, setActiveFilter] = useState(FEED_FILTERS[0]);

  const categoryFiltered = filterPostsByCategory(posts, activeFilter);
  const visiblePosts = filterPostsBySearch(categoryFiltered, query);

  return (
    <main className="feed feed-v3">
      <section className="hero-card hero-card-v3">
        <div className="hero-copy">
          <p className="eyebrow">Point d’ancrage</p>
          <h1>Un endroit calme pour remettre les choses à leur place.</h1>
          <p>Écris ce qui pèse, écoute les autres et avance sans pression.</p>
        </div>

        <div className="hero-side">
          <span className="hero-side__label"><Sparkles size={13} /> Question du jour</span>
          <p>De quoi as-tu besoin pour traverser cette journée plus sereinement ?</p>
          <button onClick={openComposer}>Répondre <ArrowRight size={15} /></button>
        </div>
      </section>

      <StoriesRow />
      <Composer />

      <div className="feed-toolbar">
        <div>
          <span className="feed-toolbar__eyebrow">Communauté</span>
          <h2>Le fil</h2>
        </div>
        <section className="filters filters-v3" aria-label="Filtrer le fil">
          {FEED_FILTERS.map((filter) => (
            <button
              key={filter}
              className={activeFilter === filter ? "selected" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </section>
      </div>

      {query.trim() && visiblePosts.length === 0 ? (
        <EmptyState
          icon={<Search size={24} />}
          title="Aucun résultat pour le moment"
          description={`Rien ne correspond à « ${query} ». Essaie un autre mot ou reviens au fil complet.`}
          actionLabel="Réinitialiser"
          onAction={() => setQuery("")}
        />
      ) : (
        <PostList posts={visiblePosts} highlight={query} />
      )}
    </main>
  );
}
