import { CheckCircle2, Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications.js";

const ICONS = {
  success: <CheckCircle2 size={18} />,
  like: <Heart size={18} />,
  comment: <MessageCircle size={18} />,
  share: <Send size={18} />,
  delete: <Trash2 size={18} />,
  info: <CheckCircle2 size={18} />,
};

function Toast({ toast, onDismiss }) {
  return (
    <div className={`toast toast-${toast.type}`} role="status">
      <span className="toast-icon">{ICONS[toast.type] || ICONS.info}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Fermer la notification">
        ×
      </button>
    </div>
  );
}

/**
 * Conteneur global des toasts. Monté une seule fois (cf. AppLayout) :
 * tous les hooks/services peuvent déclencher une notification via
 * useNotifications().notify(...) sans avoir à se soucier de l'affichage.
 */
export default function ToastContainer() {
  const { toasts, dismiss } = useNotifications();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}
