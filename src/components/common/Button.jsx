/**
 * Bouton générique. Les classes CSS existantes (.publish-btn, .ghost-btn...)
 * restent disponibles via la prop `className` pour ne rien casser visuellement ;
 * ce composant sert surtout à unifier les nouveaux boutons (popup, pages).
 */
export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <button className={`btn btn-${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
