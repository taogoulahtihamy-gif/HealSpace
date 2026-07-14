import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { PostsProvider } from "./contexts/PostsContext.jsx";
import { SearchProvider } from "./contexts/SearchContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { UIProvider } from "./contexts/UIContext.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import EmergencyPage from "./pages/EmergencyPage.jsx";
import GroupsPage from "./pages/GroupsPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import JournalPage from "./pages/JournalPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ResourcesPage from "./pages/ResourcesPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import { ROUTES } from "./utils/constants.js";

/**
 * Point d'entrée applicatif.
 *
 * Les providers de contexte enveloppent toute l'application une seule fois :
 * auth, thème, notifications, posts, recherche et UI globale.
 *
 * Le badge API est temporaire pour valider la connexion entre le frontend
 * local et le backend Render.
 */
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <PostsProvider>
            <SearchProvider>
              <UIProvider>
                <BrowserRouter>
                  <div
                    style={{
                      position: "fixed",
                      right: 16,
                      bottom: 16,
                      zIndex: 9999,
                      padding: "8px 12px",
                      borderRadius: 999,
                      background: "rgba(15, 23, 42, 0.92)",
                      color: "#ffffff",
                      fontSize: 13,
                      fontWeight: 600,
                      boxShadow:
                        "0 10px 30px rgba(15, 23, 42, 0.25)",
                    }}
                  >

                  </div>

                  <Routes>
                    <Route
                      path={ROUTES.LOGIN}
                      element={<LoginPage />}
                    />

                    <Route
                      path={ROUTES.HOME}
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<HomePage />} />

                      <Route
                        path="groupes"
                        element={<GroupsPage />}
                      />

                      <Route
                        path="messages"
                        element={<MessagesPage />}
                      />

                      <Route
                        path="journal"
                        element={<JournalPage />}
                      />

                      <Route
                        path="ressources"
                        element={<ResourcesPage />}
                      />

                      <Route
                        path="urgence"
                        element={<EmergencyPage />}
                      />

                      <Route
                        path="profil"
                        element={<ProfilePage />}
                      />

                      <Route
                        path="notifications"
                        element={<NotificationsPage />}
                      />

                      <Route
                        path="parametres"
                        element={<SettingsPage />}
                      />
                    </Route>

                    <Route
                      path="*"
                      element={
                        <Navigate
                          to={ROUTES.HOME}
                          replace
                        />
                      }
                    />
                  </Routes>
                </BrowserRouter>
              </UIProvider>
            </SearchProvider>
          </PostsProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}