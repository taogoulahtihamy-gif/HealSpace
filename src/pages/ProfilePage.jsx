import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { usePosts } from "../hooks/usePosts.js";
import { useGroups } from "../hooks/useGroups.js";
import { useJournal } from "../hooks/useJournal.js";
import { commentService } from "../services/commentService.js";
import { parseCount } from "../utils/formatters.js";
import ProfileHeader from "../components/profile/ProfileHeader.jsx";
import ProfileStats from "../components/profile/ProfileStats.jsx";
import ActivityTimeline from "../components/profile/ActivityTimeline.jsx";
import PostList from "../components/feed/PostList.jsx";

export default function ProfilePage() {
  const { user } = useAuth();
  const { posts } = usePosts();
  const { joinedNames } = useGroups();
  const { entries: journalEntries } = useJournal();
  const [commentsWritten, setCommentsWritten] = useState(0);

  const myPosts = posts.filter((post) => post.author === user?.name);

  const supportsReceived = myPosts.reduce((total, post) => total + parseCount(post.support), 0);

  useEffect(() => {
    if (!user?.name) return;
    let isMounted = true;
    commentService.getCountByAuthor(user.name).then((count) => {
      if (isMounted) setCommentsWritten(count);
    });
    return () => {
      isMounted = false;
    };
  }, [user?.name]);

  const stats = [
    { label: "Publications", value: myPosts.length },
    { label: "Soutiens reçus", value: supportsReceived },
    { label: "Commentaires écrits", value: commentsWritten },
    { label: "Compagnons rejoints", value: joinedNames.size },
  ];

  const badges = [
    myPosts.length >= 1 && { icon: "🌱", label: "Premier pas" },
    joinedNames.size >= 1 && { icon: "🤝", label: "Compagnon actif" },
    supportsReceived >= 10 && { icon: "🏅", label: "Soutenu·e par la communauté" },
  ].filter(Boolean);

  // Streak simplifié : nombre d'entrées de journal consécutives connues
  // (données mock = "Aujourd'hui", "Hier", "Il y a 2 jours" -> 3 jours de suite).
  const streak = journalEntries.length;

  // Activité récente : combine publications et étapes de journal, triées
  // par ordre d'apparition existant (pas de vraie date unifiée pour l'instant).
  const activityItems = [
    ...myPosts.map((post) => ({ icon: post.mood || "💬", label: `Publication : "${post.content.slice(0, 60)}${post.content.length > 60 ? "…" : ""}"`, time: post.time })),
    ...journalEntries.slice(0, 3).map((entry) => ({ icon: entry.mood, label: `Étape de journal : ${entry.note}`, time: entry.date })),
  ];

  return (
    <main className="feed">
      <ProfileHeader user={user} badges={badges} streak={streak} />
      <ProfileStats stats={stats} />

      <section className="panel">
        <div className="panel-title">
          <h3>Activité récente</h3>
        </div>
        <ActivityTimeline items={activityItems} />
      </section>

      <PostList posts={myPosts} />
    </main>
  );
}
