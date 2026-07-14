import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../utils/constants.js";

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="session-check-screen">
        <div className="session-check-card">
          <strong>HealSpace</strong>
          <span>Vérification de la session</span>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}
