import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Topbar from "../components/layout/Topbar.jsx";
import LeftSidebar from "../components/layout/LeftSidebar.jsx";
import RightSidebar from "../components/layout/RightSidebar.jsx";
import MobileNav from "../components/layout/MobileNav.jsx";
import PublishModal from "../components/feed/PublishModal.jsx";
import ToastContainer from "../components/ui/Toast.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export default function AppLayout() {
  return (
    <div className="app-shell app-shell-v3 app-shell-v4">
      <ScrollToTop />
      <LeftSidebar />
      <section className="workspace workspace-v4">
        <Topbar />
        <Outlet />
      </section>
      <RightSidebar />
      <MobileNav />
      <PublishModal />
      <ToastContainer />
    </div>
  );
}
