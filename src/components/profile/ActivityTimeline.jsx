export default function ActivityTimeline({ items }) {
  if (!items.length) {
    return <p className="comment-empty">Aucune activité récente pour le moment.</p>;
  }

  return (
    <ol className="activity-timeline">
      {items.map((item, index) => (
        <li key={index}>
          <span className="activity-icon">{item.icon}</span>
          <div>
            <p>{item.label}</p>
            <span>{item.time}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
