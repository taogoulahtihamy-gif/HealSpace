import { Sparkles, Search } from "lucide-react";
import { useState } from "react";
import { usePosts } from "../../hooks/usePosts.js";
import { useSearch } from "../../hooks/useSearch.js";
import { filterPostsByCategory, filterPostsBySearch } from "../../utils/postFilters.js";
import { FEED_FILTERS } from "../../utils/constants.js";
import Composer from "./Composer.jsx";
import PostList from "./PostList.jsx";
import StoriesRow from "./StoriesRow.jsx";
import EmptyState from "../common/EmptyState.jsx";

export default function Feed() {
  const { posts } = usePosts();
  const { query, setQuery } = useSearch();
  const [activeFilter, setActiveFilter] = useState(FEED_FILTERS[0]);

  // Recherche (topbar) appliquée en plus du filtre de catégorie sélectionné,
  // sans jamais muter la liste de posts elle-même.
  const categoryFiltered = filterPostsByCategory(posts, activeFilter);
  const visiblePosts = filterPostsBySearch(categoryFiltered, query);

  return (
    <main className="feed">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Espace sécurisé</p>
          <h1>Parle, respire, reconstruis-toi.</h1>
          <p>
            Partage ce que tu ressens, rejoins des groupes de soutien et avance étape par étape.
          </p>
        </div>

        <button>
          <Sparkles size={18} />
          Faire le point
        </button>
      </section>

      <StoriesRow />

      <Composer />

      <section className="filters">
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

      {query.trim() && visiblePosts.length === 0 ? (
        <EmptyState
          icon={<Search size={32} />}
          title="Aucun résultat pour le moment"
          description={`On n’a rien trouvé pour "${query}", mais ce n’est pas grave — essaie un autre mot, ou reviens au fil complet.`}
          actionLabel="Réinitialiser la recherche"
          onAction={() => setQuery("")}
        />
      ) : (
        <PostList posts={visiblePosts} highlight={query} />
      )}
    </main>
  );
}
