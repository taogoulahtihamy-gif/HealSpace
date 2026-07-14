import { useApiHealth } from "../hooks/useApiHealth.js";

export function ApiStatusBadge() {
  const { loading, online, message, error } = useApiHealth();

  if (loading) {
    return <span title="Vérification API">API : vérification...</span>;
  }

  if (!online) {
    return (
      <span title={error?.message || "API indisponible"}>
        API : hors ligne
      </span>
    );
  }

  return <span title={message}>API : en ligne</span>;
}
