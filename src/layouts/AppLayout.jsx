import { Outlet } from "react-router-dom";
import Topbar from "../components/layout/Topbar.jsx";
import LeftSidebar from "../components/layout/LeftSidebar.jsx";
import RightSidebar from "../components/layout/RightSidebar.jsx";
import MobileNav from "../components/layout/MobileNav.jsx";
import PublishModal from "../components/feed/PublishModal.jsx";
import ToastContainer from "../components/ui/Toast.jsx";

/**
 * Coquille visuelle commune à toutes les pages connectées.
 * Topbar, sidebars et navigation mobile restent strictement identiques
 * à l'existant : seul le contenu central change selon la route active.
 */
export default function AppLayout() {
  return (
    <div className="app-shell">
      <Topbar />
      <LeftSidebar />
      <Outlet />
      <RightSidebar />
      <MobileNav />
      <PublishModal />
      <ToastContainer />
    </div>
  );
}
