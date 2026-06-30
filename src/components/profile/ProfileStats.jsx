export default function ProfileStats({ stats }) {
  return (
    <section className="profile-stats">
      {stats.map((stat) => (
        <div className="profile-stat" key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </section>
  );
}
