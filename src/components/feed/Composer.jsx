import { useRef } from "react";
import { Image, Smile, Zap } from "lucide-react";
import Avatar from "../common/Avatar.jsx";
import Switch from "../ui/Switch.jsx";
import { useUI } from "../../hooks/useUI.js";
import { useNotifications } from "../../hooks/useNotifications.js";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from "../../utils/constants.js";

/**
 * Bandeau d'amorce de publication en haut du feed. Chaque bouton a désormais
 * un vrai comportement distinct :
 * - "Image" ouvre directement le sélecteur de fichiers natif, puis pré-remplit
 *   la popup avec l'image choisie (au lieu d'ouvrir une popup vide).
 * - "Anonyme" est un vrai switch ON/OFF, sans ouvrir de popup du tout.
 * - "Humeur"/"Défi" ouvrent la popup, qui contient leurs vrais sélecteurs.
 */
export default function Composer() {
  const { openComposer, quickAnonymous, setQuickAnonymous, setPendingImage } = useUI();
  const { notify } = useNotifications();
  const fileInputRef = useRef(null);

  function handlePickImage() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = ""; // permet de resélectionner le même fichier plus tard
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      notify("Format non supporté. Utilise un JPG, PNG ou WEBP.", "info");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      notify(`Image trop lourde (max ${MAX_IMAGE_SIZE_MB} Mo).`, "info");
      return;
    }

    // Lecture locale en data URL : c'est un stand-in volontairement simple
    // en attendant un vrai upload Cloudinary/S3. Le jour où il sera branché,
    // seule cette fonction changera (upload + URL distante au lieu de dataURL),
    // PublishModal et PostCard resteront identiques côté affichage.
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImage(reader.result);
      openComposer();
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="composer">
      <div className="composer-top">
        <Avatar initial="E" />
        <button className="composer-input" onClick={openComposer}>
          Qu’est-ce que tu ressens aujourd’hui ?
        </button>
      </div>

      <div className="composer-actions">
        <button onClick={handlePickImage}>
          <Image size={18} /> Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="visually-hidden-input"
          onChange={handleFileChange}
        />

        <div className="composer-anonymous-switch">
          <Switch
            checked={quickAnonymous}
            onChange={setQuickAnonymous}
            label="Publier en anonyme par défaut"
          />
          <span>Anonyme</span>
        </div>

        <button onClick={openComposer}><Smile size={18} /> Humeur</button>
        <button onClick={openComposer}><Zap size={18} /> Défi</button>
      </div>

      {quickAnonymous && (
        <p className="composer-anonymous-hint">
          Tes prochaines publications seront anonymes : ton nom ne sera pas affiché, seule ta voix comptera.
        </p>
      )}
    </section>
  );
}
