import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { PostsProvider } from "./contexts/PostsContext.jsx";
import { SearchProvider } from "./contexts/SearchContext.jsx";
import { UIProvider } from "./contexts/UIContext.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import GroupsPage from "./pages/GroupsPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import JournalPage from "./pages/JournalPage.jsx";
import ResourcesPage from "./pages/ResourcesPage.jsx";
import EmergencyPage from "./pages/EmergencyPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import { ROUTES } from "./utils/constants.js";

/**
 * Point d'entrée applicatif. Les providers de contexte enveloppent toute
 * l'app une seule fois ici : aucune page ni aucun composant n'a besoin de
 * savoir comment l'auth, le thème, les posts ou les modales sont gérés.
 *
 * Le routage remplace le simple "isLoggedIn ? HomePage : LoginPage" d'origine
 * par un vrai système de navigation interne (Accueil, Groupes, Messages,
 * Journal, Ressources, Urgence, Profil, Notifications, Paramètres), sans
 * toucher au design existant : AppLayout réutilise Topbar/sidebars/MobileNav
 * tels qu'ils étaient.
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
                  <Routes>
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />

                    <Route
                      path={ROUTES.HOME}
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<HomePage />} />
                      <Route path="groupes" element={<GroupsPage />} />
                      <Route path="messages" element={<MessagesPage />} />
                      <Route path="journal" element={<JournalPage />} />
                      <Route path="ressources" element={<ResourcesPage />} />
                      <Route path="urgence" element={<EmergencyPage />} />
                      <Route path="profil" element={<ProfilePage />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="parametres" element={<SettingsPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
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
