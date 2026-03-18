import { Menu, Search, Bell, ChevronDown } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  toggleSidebar: () => void;
}

const notifications = [
  {
    id: 1,
    title: "New Order Received",
    desc: "Order #84564568 has been placed",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    title: "Low Stock Alert",
    desc: "Yamaha P-515 has only 3 units left",
    time: "18m ago",
    unread: true,
  },
  {
    id: 3,
    title: "Order Approved",
    desc: "Order #84564566 was approved",
    time: "1h ago",
    unread: false,
  },
];

export default function Header({ toggleSidebar }: HeaderProps) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <header
      style={{
        height: 64,
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        position: "sticky",
        top: 0,
        zIndex: 40,
        boxShadow: "0 1px 0 #f1f5f9",
        flexShrink: 0,
      }}
    >
      {/* Left */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          flex: 1,
        }}
      >
        <button
          onClick={toggleSidebar}
          className="lg:hidden"
          style={{
            padding: "0.5rem",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "0.5rem 0.875rem",
            maxWidth: 320,
            width: "100%",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          className="hidden md:flex"
          onFocus={(e) => {
            const div = e.currentTarget as HTMLElement;
            div.style.borderColor = "#4f46e5";
            div.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
          }}
          onBlur={(e) => {
            const div = e.currentTarget as HTMLElement;
            div.style.borderColor = "#e2e8f0";
            div.style.boxShadow = "none";
          }}
        >
          <Search size={16} style={{ color: "#94a3b8", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search products, orders..."
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "0.875rem",
              color: "#0f172a",
              width: "100%",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setUserMenuOpen(false);
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  background: "#ef4444",
                  borderRadius: "50%",
                  border: "2px solid #fff",
                }}
                className="animate-pulse-dot"
              />
            )}
          </button>

          {notificationOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 320,
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                zIndex: 9999,
                overflow: "hidden",
                animation: "slideUp 0.2s ease",
              }}
            >
              <div
                style={{
                  padding: "0.875rem 1rem",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    className="badge badge-primary"
                    style={{ fontSize: "0.6875rem" }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "0.75rem 1rem",
                    borderBottom: "1px solid #f8fafc",
                    cursor: "pointer",
                    background: n.unread ? "#fafbff" : "#fff",
                    transition: "background 0.1s",
                    display: "flex",
                    gap: "0.625rem",
                    alignItems: "flex-start",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "#f1f5f9";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = n.unread
                      ? "#fafbff"
                      : "#fff";
                  }}
                >
                  {n.unread && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        background: "#4f46e5",
                        borderRadius: "50%",
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, paddingLeft: n.unread ? 0 : 16 }}>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "#0f172a",
                        marginBottom: "0.125rem",
                      }}
                    >
                      {n.title}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {n.desc}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      color: "#94a3b8",
                      flexShrink: 0,
                    }}
                  >
                    {n.time}
                  </span>
                </div>
              ))}
              <div style={{ padding: "0.625rem 1rem", textAlign: "center" }}>
                <button
                  style={{
                    fontSize: "0.8125rem",
                    color: "#4f46e5",
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 28,
            background: "#e2e8f0",
            margin: "0 0.25rem",
          }}
        />

        {/* User Menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotificationOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.375rem 0.625rem",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
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
            <div className="hidden sm:block" style={{ textAlign: "left" }}>
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  lineHeight: 1.2,
                }}
              >
                Admin
              </p>
              <p style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>
                Super Admin
              </p>
            </div>
            <ChevronDown
              size={14}
              style={{ color: "#94a3b8" }}
              className="hidden sm:block"
            />
          </button>

          {userMenuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 200,
                background: "#fff",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                zIndex: 9999,
                overflow: "hidden",
                animation: "slideUp 0.2s ease",
              }}
            >
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#0f172a",
                  }}
                >
                  Admin User
                </p>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  admin@crmusic.com
                </p>
              </div>
              {[
                { label: "Profile Settings" },
                { label: "Change Password" },
                { label: "Activity Log" },
              ].map((item) => (
                <button
                  key={item.label}
                  style={{
                    width: "100%",
                    padding: "0.625rem 1rem",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#374151",
                    textAlign: "left",
                    fontFamily: "inherit",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }}
                >
                  {item.label}
                </button>
              ))}
              <div
                style={{ borderTop: "1px solid #f1f5f9", padding: "0.375rem" }}
              >
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.625rem",
                    borderRadius: 6,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#dc2626",
                    textAlign: "left",
                    fontFamily: "inherit",
                    fontWeight: 500,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "#fef2f2";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
