import { MessageCircleHeart } from "lucide-react";

export default function ComposerHeader() {
  return (
    <div className="composer-header composer-header-v4">
      <span className="composer-header-v4__icon"><MessageCircleHeart /></span>
      <div>
        <h2 className="composer-title">Comment te sens-tu aujourd’hui ?</h2>
        <p className="composer-subtitle">
          Écris simplement ce que tu ressens. Tu peux rester anonyme et modifier tes choix avant de publier.
        </p>
      </div>
    </div>
  );
}
