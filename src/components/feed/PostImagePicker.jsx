import { Check } from "lucide-react";
import { POST_IMAGES } from "../../utils/constants.js";

/**
 * Sélecteur d'image "fictive" : pas d'upload réel pour l'instant, juste
 * un identifiant choisi parmi 4 dégradés prédéfinis (cf. POST_IMAGES).
 * Le jour où un vrai upload (Cloudinary/S3) sera branché, seul le champ
 * `image` changera de nature (id -> URL) ; ce composant et son usage dans
 * PublishModal/PostCard resteront structurellement identiques.
 */
export default function PostImagePicker({ selectedId, onSelect }) {
  return (
    <div className="image-picker">
      {POST_IMAGES.map((image) => (
        <button
          type="button"
          key={image.id}
          className={`image-option ${image.className} ${selectedId === image.id ? "selected" : ""}`}
          onClick={() => onSelect(selectedId === image.id ? null : image.id)}
          aria-label={image.label}
        >
          {selectedId === image.id && <Check size={18} />}
        </button>
      ))}
    </div>
  );
}
