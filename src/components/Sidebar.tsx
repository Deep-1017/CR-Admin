import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Music2,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

const navGroups = [
  {
    label: "Overview",
    items: [
      { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
  {
    label: "Management",
    items: [
      { path: "/products", icon: Package, label: "Products" },
      { path: "/orders", icon: ShoppingCart, label: "Orders" },
    ],
  },
  {
    label: "Configuration",
    items: [{ path: "/settings", icon: Settings, label: "Settings" }],
  },
];

export default function Sidebar({
  isOpen,
  isMobile = false,
  onClose,
}: SidebarProps) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // Mobile overlay backdrop
  const showOverlay = isMobile && isOpen;

  // Sidebar visibility for mobile
  const mobileTranslate = isMobile
    ? isOpen
      ? "translateX(0)"
      : "translateX(-100%)"
    : "none";

  return (
    <>
      {/* Mobile backdrop overlay */}
      {showOverlay && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(3px)",
            zIndex: 49,
          }}
        />
      )}

      {/* Sidebar panel */}
      <aside
        style={{
          width: 260,
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          // On mobile: fixed + slide animation; on desktop: fills sticky wrapper
          position: isMobile ? "fixed" : "relative",
          top: 0,
          left: 0,
          zIndex: isMobile ? 50 : "auto",
          transform: mobileTranslate,
          transition: isMobile
            ? "transform 0.28s cubic-bezier(0.4,0,0.2,1)"
            : "none",
        }}
      >
        {/* ── Logo / Brand ── */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1.25rem",
            borderBottom: "1px solid #f1f5f9",
            flexShrink: 0,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
                flexShrink: 0,
              }}
            >
              <Music2 size={18} color="#ffffff" />
            </div>
            <div>
              <p
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                CR Music
              </p>
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "#94a3b8",
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                Admin Panel
              </p>
            </div>
          </div>

          {/* Close button — mobile only */}
          {isMobile && (
            <button
              onClick={onClose}
              style={{
                padding: "0.375rem",
                borderRadius: 6,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
                (e.currentTarget as HTMLElement).style.color = "#374151";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color = "#94a3b8";
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav
          style={{
            flex: 1,
            padding: "1.25rem 0.875rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.75rem",
            overflowY: "auto",
          }}
        >
          {navGroups.map((group) => (
            <div key={group.label}>
              {/* Section label */}
              <p
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  padding: "0 0.5rem",
                  marginBottom: "0.375rem",
                  margin: "0 0 0.5rem",
                }}
              >
                {group.label}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {group.items.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    location.pathname.startsWith(item.path + "/");
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={isMobile ? onClose : undefined}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        padding: "0.5625rem 0.75rem",
                        borderRadius: 8,
                        fontSize: "0.875rem",
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? "#ffffff" : "#64748b",
                        background: isActive ? "#4f46e5" : "transparent",
                        textDecoration: "none",
                        transition: "all 0.15s ease",
                        boxShadow: isActive
                          ? "0 2px 8px rgba(79,70,229,0.25)"
                          : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background =
                            "#f1f5f9";
                          (e.currentTarget as HTMLElement).style.color =
                            "#0f172a";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background =
                            "transparent";
                          (e.currentTarget as HTMLElement).style.color =
                            "#64748b";
                        }
                      }}
                    >
                      <item.icon size={17} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Footer / User card ── */}
        <div
          style={{
            padding: "0.875rem",
            borderTop: "1px solid #f1f5f9",
            flexShrink: 0,
          }}
        >
          {/* User card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.625rem 0.75rem",
              borderRadius: 10,
              background: "#f8fafc",
              marginBottom: "0.375rem",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "0.8125rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              A
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  lineHeight: 1.25,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  margin: 0,
                }}
              >
                Admin User
              </p>
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "#94a3b8",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  margin: 0,
                }}
              >
                admin@crmusic.com
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.5rem 0.75rem",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: "#64748b",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#fef2f2";
              (e.currentTarget as HTMLElement).style.color = "#dc2626";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#64748b";
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
