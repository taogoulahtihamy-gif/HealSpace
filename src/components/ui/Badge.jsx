export default function Badge({ children, color, variant = "soft" }) {
  const style = color
    ? variant === "soft"
      ? { backgroundColor: `${color}1f`, color }
      : { backgroundColor: color, color: "#fff" }
    : undefined;

  return (
    <span className={`ui-badge ui-badge-${variant}`} style={style}>
      {children}
    </span>
  );
}
