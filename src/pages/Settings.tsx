import { useState } from "react";
import {
  Globe,
  Bell,
  Shield,
  CreditCard,
  Users,
  Save,
  AlertTriangle,
  Check,
} from "lucide-react";
import { ToastContainer, type ToastType } from "../components/ui/Toast";
import { formatINR } from "../lib/utils";

interface ToastMsg {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

const settingsNav = [
  { id: "general", label: "General", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "team", label: "Team", icon: Users },
  { id: "billing", label: "Billing", icon: CreditCard },
];

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label style={{ cursor: "pointer", display: "block" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ display: "none" }}
      />
      <div
        style={{
          width: 44,
          height: 24,
          borderRadius: 99,
          background: checked ? "#4f46e5" : "#d1d5db",
          position: "relative",
          transition: "background 0.2s ease",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 22 : 2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "left 0.2s ease",
          }}
        />
      </div>
    </label>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    customerReviews: false,
    marketingEmails: false,
  });

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const handleSave = (section: string) => {
    addToast(
      "success",
      `${section} Saved`,
      "Your changes have been saved successfully.",
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #f8fafc, #ffffff, #f8fafc)",
        paddingLeft: "1rem",
        paddingRight: "1rem",
        paddingTop: "2rem",
        paddingBottom: "2rem",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .fadeIn { animation: fadeIn 0.3s ease; }
        .slideInUp { animation: slideInUp 0.3s ease; }
        .slideInLeft { animation: slideInLeft 0.3s ease; }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          border-color: #4f46e5;
        }
        @media (max-width: 768px) {
          body { font-size: 14px; }
        }
      `}</style>

      <div
        style={{
          maxWidth: "1400px",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            paddingBottom: "1.5rem",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(1.75rem, 5vw, 2rem)",
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: "0.5rem",
              letterSpacing: "-0.02em",
              margin: "0 0 0.5rem 0",
            }}
          >
            Settings
          </h1>
          <p
            style={{
              color: "#64748b",
              margin: 0,
              fontSize: "clamp(0.875rem, 2vw, 0.9375rem)",
              lineHeight: 1.5,
            }}
          >
            Manage your store configuration and preferences
          </p>
        </div>

        {/* Main Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "250px 1fr",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Left Nav */}
          <div
            style={{
              display: "block",
            }}
          >
            <nav
              style={{
                background: "#ffffff",
                border: "1px solid #f0f4f8",
                borderRadius: "10px",
                padding: "0.75rem",
                position: "sticky",
                top: "2rem",
              }}
            >
              {settingsNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.6875rem 1rem",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#4f46e5" : "#64748b",
                      background: isActive ? "#eef2ff" : "transparent",
                      fontFamily: "inherit",
                      transition: "all 0.15s ease",
                      textAlign: "left",
                      marginBottom: "2px",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background =
                          "#f8fafc";
                        (e.currentTarget as HTMLElement).style.color =
                          "#374151";
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
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              minWidth: 0,
            }}
          >
            {/* GENERAL */}
            {activeSection === "general" && (
              <>
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #f0f4f8",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "clamp(1rem, 4vw, 1.5rem)",
                      borderBottom: "1px solid #f0f4f8",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                        marginBottom: "0.375rem",
                      }}
                    >
                      Store Information
                    </h3>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "#94a3b8",
                        margin: 0,
                      }}
                    >
                      Update your store's basic details
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "clamp(1rem, 4vw, 1.5rem)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(clamp(200px, 100%, 250px), 1fr))",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#0f172a",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Store Name
                        </label>
                        <input
                          type="text"
                          defaultValue="CR Music Store"
                          style={{
                            width: "100%",
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                            paddingTop: "0.5rem",
                            paddingBottom: "0.5rem",
                            border: "1px solid #e0e7ff",
                            borderRadius: "0.5rem",
                            fontSize: "0.9375rem",
                            boxSizing: "border-box",
                            transition: "all 0.2s ease",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#0f172a",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Store Email
                        </label>
                        <input
                          type="email"
                          defaultValue="admin@crmusic.com"
                          style={{
                            width: "100%",
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                            paddingTop: "0.5rem",
                            paddingBottom: "0.5rem",
                            border: "1px solid #e0e7ff",
                            borderRadius: "0.5rem",
                            fontSize: "0.9375rem",
                            boxSizing: "border-box",
                            transition: "all 0.2s ease",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#0f172a",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Support Phone
                        </label>
                        <input
                          type="tel"
                          defaultValue="+1 (555) 123-4567"
                          style={{
                            width: "100%",
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                            paddingTop: "0.5rem",
                            paddingBottom: "0.5rem",
                            border: "1px solid #e0e7ff",
                            borderRadius: "0.5rem",
                            fontSize: "0.9375rem",
                            boxSizing: "border-box",
                            transition: "all 0.2s ease",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#0f172a",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Website URL
                        </label>
                        <input
                          type="url"
                          defaultValue="https://crmusic.com"
                          style={{
                            width: "100%",
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                            paddingTop: "0.5rem",
                            paddingBottom: "0.5rem",
                            border: "1px solid #e0e7ff",
                            borderRadius: "0.5rem",
                            fontSize: "0.9375rem",
                            boxSizing: "border-box",
                            transition: "all 0.2s ease",
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "#0f172a",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Store Address
                      </label>
                      <textarea
                        defaultValue="123 Music Lane, Nashville, TN 37201"
                        style={{
                          width: "100%",
                          paddingLeft: "0.75rem",
                          paddingRight: "0.75rem",
                          paddingTop: "0.5rem",
                          paddingBottom: "0.5rem",
                          border: "1px solid #e0e7ff",
                          borderRadius: "0.5rem",
                          fontSize: "0.9375rem",
                          boxSizing: "border-box",
                          minHeight: "100px",
                          fontFamily: "inherit",
                          transition: "all 0.2s ease",
                          resize: "vertical",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #f0f4f8",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "clamp(1rem, 4vw, 1.5rem)",
                      borderBottom: "1px solid #f0f4f8",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Regional Settings
                    </h3>
                  </div>
                  <div
                    style={{
                      padding: "clamp(1rem, 4vw, 1.5rem)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(clamp(150px, 100%, 200px), 1fr))",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#0f172a",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Currency
                        </label>
                        <select
                          style={{
                            width: "100%",
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                            paddingTop: "0.5rem",
                            paddingBottom: "0.5rem",
                            border: "1px solid #e0e7ff",
                            borderRadius: "0.5rem",
                            fontSize: "0.9375rem",
                            boxSizing: "border-box",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <option>USD – US Dollar</option>
                          <option>EUR – Euro</option>
                          <option>GBP – British Pound</option>
                          <option>INR – Indian Rupee</option>
                        </select>
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#0f172a",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Timezone
                        </label>
                        <select
                          style={{
                            width: "100%",
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                            paddingTop: "0.5rem",
                            paddingBottom: "0.5rem",
                            border: "1px solid #e0e7ff",
                            borderRadius: "0.5rem",
                            fontSize: "0.9375rem",
                            boxSizing: "border-box",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <option>Asia/Kolkata (IST)</option>
                          <option>America/New_York (EST)</option>
                          <option>America/Los_Angeles (PST)</option>
                          <option>Europe/London (GMT)</option>
                        </select>
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#0f172a",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Language
                        </label>
                        <select
                          style={{
                            width: "100%",
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                            paddingTop: "0.5rem",
                            paddingBottom: "0.5rem",
                            border: "1px solid #e0e7ff",
                            borderRadius: "0.5rem",
                            fontSize: "0.9375rem",
                            boxSizing: "border-box",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <option>English (US)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #f0f4f8",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "clamp(1rem, 4vw, 1.5rem)",
                      borderBottom: "1px solid #f0f4f8",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Display
                    </h3>
                  </div>
                  <div
                    style={{
                      padding: "clamp(1rem, 4vw, 1.5rem)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 600,
                            color: "#0f172a",
                            margin: 0,
                            fontSize: "0.9375rem",
                          }}
                        >
                          Theme Mode
                        </p>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "#94a3b8",
                            margin: "0.125rem 0 0",
                          }}
                        >
                          Select your preferred interface theme
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.375rem",
                          background: "#f1f5f9",
                          borderRadius: 8,
                          padding: "0.25rem",
                        }}
                      >
                        {["Light", "Dark"].map((mode) => (
                          <button
                            key={mode}
                            style={{
                              padding: "0.375rem 0.875rem",
                              borderRadius: 6,
                              border: "none",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              fontFamily: "inherit",
                              background:
                                mode === "Light" ? "#fff" : "transparent",
                              color: mode === "Light" ? "#0f172a" : "#64748b",
                              boxShadow:
                                mode === "Light"
                                  ? "0 1px 3px rgba(0,0,0,0.08)"
                                  : "none",
                              transition: "all 0.15s",
                            }}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div
                      style={{
                        borderTop: "1px solid #f0f4f8",
                        paddingTop: "1.5rem",
                      }}
                    />
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          color: "#0f172a",
                          margin: "0 0 0.75rem",
                          fontSize: "0.9375rem",
                        }}
                      >
                        Display Density
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {["Compact", "Default", "Comfortable"].map(
                          (density, i) => (
                            <label
                              key={density}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="radio"
                                name="density"
                                defaultChecked={i === 1}
                                style={{ accentColor: "#4f46e5" }}
                              />
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  color: "#374151",
                                }}
                              >
                                {density}
                              </span>
                            </label>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fee2e2",
                    borderRadius: "10px",
                    padding: "clamp(1rem, 4vw, 1.5rem)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      marginBottom: "0.875rem",
                    }}
                  >
                    <AlertTriangle size={17} style={{ color: "#dc2626" }} />
                    <h3
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        color: "#dc2626",
                        margin: 0,
                      }}
                    >
                      Danger Zone
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#7f1d1d",
                      margin: "0 0 1rem",
                    }}
                  >
                    Resetting your settings will revert all configurations back
                    to their default values. This action cannot be undone.
                  </p>
                  <button
                    style={{
                      paddingLeft: "0.75rem",
                      paddingRight: "0.75rem",
                      paddingTop: "0.5rem",
                      paddingBottom: "0.5rem",
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "#b91c1c";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "#dc2626";
                    }}
                  >
                    Reset All Settings
                  </button>
                </div>
              </>
            )}

            {/* NOTIFICATIONS */}
            {activeSection === "notifications" && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #f0f4f8",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "clamp(1rem, 4vw, 1.5rem)",
                    borderBottom: "1px solid #f0f4f8",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: 0,
                      marginBottom: "0.375rem",
                    }}
                  >
                    Notification Preferences
                  </h3>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "#94a3b8",
                      margin: 0,
                    }}
                  >
                    Choose when and how you receive notifications
                  </p>
                </div>
                <div style={{ padding: "clamp(1rem, 4vw, 1.5rem)" }}>
                  {(
                    [
                      {
                        key: "newOrders",
                        label: "New Orders",
                        desc: "Get notified when a new order is placed",
                      },
                      {
                        key: "lowStock",
                        label: "Low Stock Alerts",
                        desc: "Receive alerts when products fall below threshold",
                      },
                      {
                        key: "customerReviews",
                        label: "Customer Reviews",
                        desc: "Notification when a customer leaves a review",
                      },
                      {
                        key: "marketingEmails",
                        label: "Marketing Emails",
                        desc: "Receive promotional offers and news from CR Music",
                      },
                    ] as const
                  ).map((item, i, arr) => (
                    <div
                      key={item.key}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "1rem",
                        padding: "1.375rem 0",
                        borderBottom:
                          i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 600,
                            color: "#0f172a",
                            margin: 0,
                            fontSize: "0.9375rem",
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "#94a3b8",
                            margin: "0.25rem 0 0",
                          }}
                        >
                          {item.desc}
                        </p>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        <ToggleSwitch
                          checked={notifications[item.key]}
                          onChange={(val) =>
                            setNotifications((prev) => ({
                              ...prev,
                              [item.key]: val,
                            }))
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECURITY */}
            {activeSection === "security" && (
              <>
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #f0f4f8",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "clamp(1rem, 4vw, 1.5rem)",
                      borderBottom: "1px solid #f0f4f8",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Change Password
                    </h3>
                  </div>
                  <div
                    style={{
                      padding: "clamp(1rem, 4vw, 1.5rem)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "#0f172a",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        style={{
                          width: "100%",
                          paddingLeft: "0.75rem",
                          paddingRight: "0.75rem",
                          paddingTop: "0.5rem",
                          paddingBottom: "0.5rem",
                          border: "1px solid #e0e7ff",
                          borderRadius: "0.5rem",
                          fontSize: "0.9375rem",
                          boxSizing: "border-box",
                          transition: "all 0.2s ease",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "#0f172a",
                          marginBottom: "0.5rem",
                        }}
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        style={{
                          width: "100%",
                          paddingLeft: "0.75rem",
                          paddingRight: "0.75rem",
                          paddingTop: "0.5rem",
                          paddingBottom: "0.5rem",
                          border: "1px solid #e0e7ff",
                          borderRadius: "0.5rem",
                          fontSize: "0.9375rem",
                          boxSizing: "border-box",
                          transition: "all 0.2s ease",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "#0f172a",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        style={{
                          width: "100%",
                          paddingLeft: "0.75rem",
                          paddingRight: "0.75rem",
                          paddingTop: "0.5rem",
                          paddingBottom: "0.5rem",
                          border: "1px solid #e0e7ff",
                          borderRadius: "0.5rem",
                          fontSize: "0.9375rem",
                          boxSizing: "border-box",
                          transition: "all 0.2s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #f0f4f8",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "clamp(1rem, 4vw, 1.5rem)",
                      borderBottom: "1px solid #f0f4f8",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Two-Factor Authentication
                    </h3>
                  </div>
                  <div
                    style={{
                      padding: "clamp(1rem, 4vw, 1.5rem)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.9375rem",
                        color: "#374151",
                        marginBottom: "1rem",
                        lineHeight: 1.6,
                      }}
                    >
                      Add an extra layer of security to your account by enabling
                      two-factor authentication.
                    </p>
                    <button
                      style={{
                        paddingLeft: "0.75rem",
                        paddingRight: "0.75rem",
                        paddingTop: "0.5rem",
                        paddingBottom: "0.5rem",
                        background: "#4f46e5",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "#4338ca";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "#4f46e5";
                      }}
                    >
                      <Shield size={15} />
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #f0f4f8",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "clamp(1rem, 4vw, 1.5rem)",
                      borderBottom: "1px solid #f0f4f8",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Active Sessions
                    </h3>
                  </div>
                  <div
                    style={{
                      padding: "clamp(1rem, 4vw, 1.5rem)",
                    }}
                  >
                    {[
                      {
                        device: "Chrome on Windows",
                        time: "Just now",
                        current: true,
                      },
                      {
                        device: "Safari on iPhone",
                        time: "2 hours ago",
                        current: false,
                      },
                    ].map((session, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "1rem",
                          padding: i > 0 ? "1.375rem 0 0" : "0 0 1.375rem",
                          borderBottom: i === 0 ? "1px solid #f1f5f9" : "none",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontWeight: 600,
                              color: "#0f172a",
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {session.device}
                          </p>
                          <p
                            style={{
                              fontSize: "0.8125rem",
                              color: "#94a3b8",
                              margin: "0.25rem 0 0",
                            }}
                          >
                            Last active: {session.time}
                          </p>
                        </div>
                        {session.current ? (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "#15803d",
                              background: "#dcfce7",
                              padding: "0.25rem 0.625rem",
                              borderRadius: 6,
                              flexShrink: 0,
                            }}
                          >
                            Current
                          </span>
                        ) : (
                          <button
                            style={{
                              fontSize: "0.875rem",
                              color: "#dc2626",
                              fontWeight: 500,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              flexShrink: 0,
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.color =
                                "#b91c1c";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.color =
                                "#dc2626";
                            }}
                          >
                            Logout
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TEAM */}
            {activeSection === "team" && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #f0f4f8",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "clamp(1rem, 4vw, 1.5rem)",
                    borderBottom: "1px solid #f0f4f8",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                        marginBottom: "0.375rem",
                      }}
                    >
                      Team Members
                    </h3>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "#94a3b8",
                        margin: 0,
                      }}
                    >
                      Manage who has access to the admin panel
                    </p>
                  </div>
                  <button
                    style={{
                      paddingLeft: "0.75rem",
                      paddingRight: "0.75rem",
                      paddingTop: "0.5rem",
                      paddingBottom: "0.5rem",
                      background: "#4f46e5",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "#4338ca";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "#4f46e5";
                    }}
                  >
                    <Users size={14} />
                    Invite Member
                  </button>
                </div>
                <div style={{ padding: "clamp(1rem, 4vw, 1.5rem)" }}>
                  {[
                    {
                      name: "Admin User (You)",
                      email: "admin@crmusic.com",
                      role: "Owner",
                      joined: "Jan 1, 2024",
                      initials: "AU",
                    },
                    {
                      name: "Sarah Johnson",
                      email: "sarah@crmusic.com",
                      role: "Manager",
                      joined: "Feb 15, 2024",
                      initials: "SJ",
                    },
                    {
                      name: "Mike Davis",
                      email: "mike@crmusic.com",
                      role: "Operator",
                      joined: "Mar 1, 2024",
                      initials: "MD",
                    },
                  ].map((member, i, arr) => (
                    <div
                      key={member.email}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem",
                        padding: "1.25rem 0",
                        borderBottom:
                          i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "#eef2ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "#4f46e5",
                            }}
                          >
                            {member.initials}
                          </span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              fontWeight: 600,
                              color: "#0f172a",
                              margin: 0,
                              fontSize: "0.9375rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {member.name}
                          </p>
                          <p
                            style={{
                              fontSize: "0.8125rem",
                              color: "#94a3b8",
                              margin: "0.125rem 0 0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          flexShrink: 0,
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color:
                              member.role === "Owner" ? "#4f46e5" : "#64748b",
                            background:
                              member.role === "Owner" ? "#eef2ff" : "#f1f5f9",
                            padding: "0.25rem 0.75rem",
                            borderRadius: 6,
                          }}
                        >
                          {member.role}
                        </span>
                        {member.role !== "Owner" && (
                          <button
                            style={{
                              fontSize: "0.875rem",
                              color: "#dc2626",
                              fontWeight: 500,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.color =
                                "#b91c1c";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.color =
                                "#dc2626";
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BILLING */}
            {activeSection === "billing" && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #f0f4f8",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "clamp(1rem, 4vw, 1.5rem)",
                    borderBottom: "1px solid #f0f4f8",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    Current Plan
                  </h3>
                </div>
                <div
                  style={{
                    padding: "clamp(1rem, 4vw, 1.5rem)",
                  }}
                >
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: "clamp(1rem, 4vw, 1.5rem)",
                      background: "#ffffff",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "1.125rem",
                            fontWeight: 700,
                            color: "#0f172a",
                            margin: 0,
                          }}
                        >
                          Professional Plan
                        </p>
                        <p
                          style={{
                            fontSize: "0.9375rem",
                            color: "#64748b",
                            margin: "0.25rem 0 0",
                          }}
                        >
                          {formatINR(99)}/month · Billed monthly
                        </p>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "#94a3b8",
                            margin: "0.375rem 0 0",
                          }}
                        >
                          Next billing: April 1, 2026
                        </p>
                      </div>
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#15803d",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "0.25rem 0.75rem",
                          borderRadius: 6,
                          flexShrink: 0,
                        }}
                      >
                        Active
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    {[
                      "Up to 1,000 products",
                      "Unlimited orders",
                      "Advanced analytics",
                      "Priority email support",
                      "Team access",
                    ].map((f) => (
                      <div
                        key={f}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.625rem",
                        }}
                      >
                        <Check
                          size={14}
                          style={{ color: "#22c55e", flexShrink: 0 }}
                        />
                        <span
                          style={{ fontSize: "0.9375rem", color: "#374151" }}
                        >
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      style={{
                        paddingLeft: "0.75rem",
                        paddingRight: "0.75rem",
                        paddingTop: "0.5rem",
                        paddingBottom: "0.5rem",
                        background: "#e4e4e7",
                        color: "#52525b",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "#d4d4d8";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "#e4e4e7";
                      }}
                    >
                      Change Plan
                    </button>
                    <button
                      style={{
                        paddingLeft: "0.75rem",
                        paddingRight: "0.75rem",
                        paddingTop: "0.5rem",
                        paddingBottom: "0.5rem",
                        background: "#e4e4e7",
                        color: "#52525b",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "#d4d4d8";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "#e4e4e7";
                      }}
                    >
                      Update Payment Method
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sticky Save Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                paddingTop: "1rem",
                borderTop: "1px solid #f1f5f9",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() =>
                  addToast(
                    "info",
                    "Changes Discarded",
                    "No changes were saved.",
                  )
                }
                style={{
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  background: "#e4e4e7",
                  color: "#52525b",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#d4d4d8";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#e4e4e7";
                }}
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleSave(
                    settingsNav.find((n) => n.id === activeSection)?.label ||
                      "Settings",
                  )
                }
                style={{
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  background: "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#4338ca";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#4f46e5";
                }}
              >
                <Save size={15} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        toasts={toasts}
        onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
