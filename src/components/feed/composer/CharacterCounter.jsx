export default function CharacterCounter({ length, max }) {
  const remaining = max - length;
  const isOverLimit = remaining < 0;
  const isNearLimit = !isOverLimit && remaining <= 50;

  return (
    <span className={`char-counter ${isOverLimit ? "over-limit" : ""} ${isNearLimit ? "near-limit" : ""}`}>
      {remaining}
    </span>
  );
}
