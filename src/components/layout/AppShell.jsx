import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "./Sidebar";

export default function AppShell({ role, navItems }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const currentItem = useMemo(
    () =>
      navItems.find(
        (item) =>
          item.to === location.pathname || location.pathname.startsWith(`${item.to}/`)
      ) || navItems[0],
    [location.pathname, navItems]
  );

  return (
    <div className="app-container">
      <Sidebar
        role={role}
        navItems={navItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main-content">
        <Navbar
          title={currentItem.label}
          subtitle={currentItem.description}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
