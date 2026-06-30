import Avatar from "../../common/Avatar.jsx";

export default function ComposerPreview({ authorName, authorInitial, content, mood, image, challenge }) {
  return (
    <div className="publish-preview">
      <span className="publish-preview-label">Aperçu</span>
      <div className="publish-preview-card">
        <div className="publish-preview-header">
          <Avatar initial={authorInitial} />
          <strong>{authorName}</strong>
          {mood && (
            <span className="publish-preview-mood" style={{ color: mood.color }}>
              {mood.emoji} {mood.label}
            </span>
          )}
        </div>

        <p>{content}</p>

        {image && <img src={image} alt="" className="publish-preview-image-real" />}

        {challenge && (
          <span className="publish-preview-challenge">
            {challenge.emoji} Défi : {challenge.label}
          </span>
        )}
      </div>
    </div>
  );
}
