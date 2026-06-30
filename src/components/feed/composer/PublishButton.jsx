export default function PublishButton({ disabled, isSubmitting }) {
  return (
    <button type="submit" className="publish-submit publish-submit-premium" disabled={disabled}>
      {isSubmitting ? (
        <>
          <span className="publish-spinner" aria-hidden="true" />
          Publication...
        </>
      ) : (
        "Publier"
      )}
    </button>
  );
}
