import { MessageCircle } from "lucide-react";

import EmptyState from "../common/EmptyState.jsx";
import PostCard from "./PostCard.jsx";

export default function PostList({
  posts,
  highlight = "",
  isLoading = false,
  error = null,
}) {
  if (isLoading) {
    return (
      <section className="panel">
        <div className="panel-title">
          <h3>Chargement des publications...</h3>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<MessageCircle size={32} />}
        title="Impossible de charger les publications"
        description="Actualise la page ou réessaie dans quelques instants."
      />
    );
  }

  if (!posts.length) {
    return (
      <EmptyState
        icon={<MessageCircle size={32} />}
        title="Aucune publication ici pour le moment"
        description="Sois la première personne à partager ce que tu ressens."
      />
    );
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          highlight={highlight}
        />
      ))}
    </>
  );
}
