import Feed from "../components/feed/Feed.jsx";

/**
 * Page Accueil = le fil d'actualité. Le composant reste minimal :
 * toute la logique vit dans Feed.jsx (cf. components/feed/).
 */
export default function HomePage() {
  return <Feed />;
}
