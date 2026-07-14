import { Expand, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import "../../styles/post-media.css";

function isImageSource(value) {
  return (
    typeof value === "string" &&
    (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:image/") ||
      value.startsWith("blob:")
    )
  );
}

export default function PostImage({
  imageId,
  imageUrl,
  alt = "Image de la publication",
  onExpandPlaceholder,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const source = imageUrl || imageId;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (!source) {
    return null;
  }

  if (!isImageSource(source)) {
    return (
      <button
        type="button"
        className="post-image-placeholder"
        onClick={onExpandPlaceholder}
      >
        Image jointe
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className="post-image-adaptive"
        onClick={() => setIsOpen(true)}
      >
        <img src={source} alt={alt} loading="lazy" />

        <span className="post-image-expand-button">
          <Expand size={16} />
        </span>
      </button>

      {isOpen &&
        createPortal(
          <div
            className="post-image-viewer"
            role="dialog"
            aria-modal="true"
            onClick={() => setIsOpen(false)}
          >
            <button
              type="button"
              className="post-image-viewer-close"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer l'image"
            >
              <X size={20} />
            </button>

            <div className="post-image-viewer-frame">
              <img
                src={source}
                alt={alt}
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
