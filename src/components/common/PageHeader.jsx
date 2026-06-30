export default function PageHeader({ title, subtitle }) {
  return (
    <section className="page-header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </section>
  );
}
