# components/ui

Réservé aux composants UI **atomiques et purement visuels**, sans logique
métier ni appel à un contexte/service (ex: Badge, Tag, Spinner, Tooltip,
Skeleton...).

Différence avec `components/common` :
- `common/` peut contenir un peu de logique (Modal gère l'échap clavier,
  ProtectedRoute lit l'auth...).
- `ui/` ne doit contenir que du rendu pur piloté par des props, réutilisable
  dans n'importe quel projet React.

À mesure que l'app grandit (plusieurs centaines de composants visés), ce
dossier accueillera les briques de base d'un futur design system.
