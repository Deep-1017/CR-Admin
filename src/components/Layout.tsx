import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* ── Desktop sidebar — sticky, always visible, part of flex flow ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: 260,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          alignSelf: "flex-start",
        }}
      >
        <Sidebar isOpen={true} isMobile={false} onClose={() => {}} />
      </div>

      {/* ── Mobile sidebar — fixed overlay, only when open ── */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={sidebarOpen}
          isMobile={true}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* ── Main content column ── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sticky top header */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable page body */}
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <div
            style={{
              maxWidth: 1400,
              margin: "0 auto",
              padding: "2.5rem 2.5rem 4rem",
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}