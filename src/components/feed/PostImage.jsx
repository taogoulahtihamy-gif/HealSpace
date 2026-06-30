import { Maximize2 } from "lucide-react";
import { POST_IMAGES } from "../../utils/constants.js";

/** Affiche soit une vraie image uploadée (data URL), soit un dégradé prédéfini. */
export default function PostImage({ imageId, onExpandPlaceholder }) {
  if (!imageId) return null;

  const isRealImage = typeof imageId === "string" && imageId.startsWith("data:");
  const preset = isRealImage ? null : POST_IMAGES.find((option) => option.id === imageId);
  if (!isRealImage && !preset) return null;

  return (
    <div className="post-image-frame">
      {isRealImage ? (
        <img src={imageId} alt="" className="post-image post-image-real" />
      ) : (
        <div className={`post-image ${preset.className}`} aria-hidden="true" />
      )}
      <button
        type="button"
        className="post-image-expand-btn"
        aria-label="Agrandir l’image (bientôt disponible)"
        onClick={() => onExpandPlaceholder?.()}
      >
        <Maximize2 size={16} />
      </button>
    </div>
  );
}
