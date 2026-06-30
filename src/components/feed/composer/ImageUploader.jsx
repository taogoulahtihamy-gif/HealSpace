import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from "../../../utils/constants.js";

/**
 * Sélecteur de photo du Composer. Ouvre directement le sélecteur de fichiers
 * natif (input type="file" accept="image/*") : explorateur sur ordinateur,
 * galerie/caméra sur mobile selon l'appareil.
 *
 * Stockage actuel : lecture locale en data URL (FileReader), simple et
 * suffisant pour le prototype. Pour brancher un vrai upload Cloudinary :
 * remplacer uniquement le corps de handleFileChange ci-dessous par un appel
 * d'upload retournant une URL distante, et passer cette URL à onChange.
 * Le reste du Composer (PublishModal, ComposerPreview, PostCard) n'aurait
 * rien à changer, puisqu'il manipule déjà `image` comme une simple chaîne.
 */
export default function ImageUploader({ image, onChange, onError }) {
  const fileInputRef = useRef(null);

  function handleTriggerClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = ""; // permet de resélectionner le même fichier ensuite
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      onError?.("Format non supporté. Utilise un JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      onError?.(`Image trop lourde (max ${MAX_IMAGE_SIZE_MB} Mo).`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className="image-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="visually-hidden-input"
        onChange={handleFileChange}
      />

      {image ? (
        <div className="uploaded-image-preview">
          <img src={image} alt="Aperçu de l’image choisie" />
          <div className="uploaded-image-actions">
            <button type="button" className="btn btn-ghost" onClick={handleTriggerClick}>
              Remplacer
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => onChange(null)}>
              <X size={14} /> Supprimer
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="upload-trigger-btn" onClick={handleTriggerClick}>
          <Upload size={16} /> Ajouter une photo (JPG, PNG, WEBP)
        </button>
      )}
    </div>
  );
}
