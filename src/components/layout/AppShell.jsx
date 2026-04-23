import { Outlet, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import Navbar from "../Navbar";
import Sidebar from "./Sidebar";

export default function AppShell({ role, navItems }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentItem = useMemo(
    () => navItems.find((item) => item.to === location.pathname) || navItems[0],
    [location.pathname, navItems]
  );

  return (
    <div className="app-layout">
      <Sidebar
        role={role}
        navItems={navItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="app-content">
        <Navbar
          title={currentItem.label}
          subtitle={currentItem.description}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <div className="container-fluid py-4 px-3 px-lg-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
