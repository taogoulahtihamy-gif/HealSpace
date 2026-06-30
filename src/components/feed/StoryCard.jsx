export default function StoryCard({ emoji, title, active }) {
  return (
    <div className={`story-card ${active ? "active" : ""}`}>
      <span>{emoji}</span>
      <strong>{title}</strong>
    </div>
  );
}
