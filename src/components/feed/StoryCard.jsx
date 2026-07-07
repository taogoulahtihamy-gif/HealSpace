export default function StoryCard({ emoji, title, active }) {
  return (
    <button className={`story-card story-card-v3 ${active ? "active" : ""}`}>
      <span aria-hidden="true">{emoji}</span>
      <strong>{title}</strong>
    </button>
  );
}
