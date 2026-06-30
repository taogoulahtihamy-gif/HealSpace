import PostCard from "./PostCard.jsx";
import EmptyState from "../common/EmptyState.jsx";
import { MessageCircle } from "lucide-react";

export default function PostList({ posts, highlight = "" }) {
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
        <PostCard key={post.id} post={post} highlight={highlight} />
      ))}
    </>
  );
}
