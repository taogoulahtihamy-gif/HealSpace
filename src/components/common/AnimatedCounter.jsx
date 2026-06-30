import { useEffect, useRef, useState } from "react";

/**
 * Anime un compteur numérique d'une valeur à l'autre (ex: 1 248 -> 1 249)
 * avec un léger ressort, façon Facebook/LinkedIn. Composant 100% autonome :
 * ne touche à aucun hook/service/contexte existant.
 */
export default function AnimatedCounter({ value, formatter = (n) => n }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const frameRef = useRef(null);

  useEffect(() => {
    const from = previousValue.current;
    const to = value;
    if (from === to) return;

    const start = performance.now();
    const duration = 320;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(from + (to - from) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        previousValue.current = to;
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  return <span className="animated-counter">{formatter(displayValue)}</span>;
}
