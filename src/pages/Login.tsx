import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Music2, Lock } from "lucide-react";

const API_URL = "http://localhost:5000/api/v1";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      const token = res.data?.token || res.data?.data?.token;
      if (!token) throw new Error("No token received");
      localStorage.setItem("token", token);
      onLogin();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid email or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "'Inter', sans-serif",
        background: "#ffffff",
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .spin { animation: spin 0.7s linear infinite; }
        .fadeIn { animation: fadeIn 0.3s ease; }
        .slideInRight { animation: slideInRight 0.4s ease; }
        .slideInUp { animation: slideInUp 0.4s ease; }
        
        input:focus, select:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          border-color: #4f46e5;
        }
        
        @media (max-width: 1024px) {
          .hidden-mobile { display: none; }
        }
        @media (min-width: 1024px) {
          .hidden-desktop { display: none; }
        }
      `}</style>

      {/* Left Panel - Hidden on mobile */}
      <div
        style={{
          width: "50%",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "clamp(2rem, 5vw, 4rem)",
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden-mobile"
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "-50%",
            right: "-10%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30%",
            left: "-5%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "4rem",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                background: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Music2 size={24} color="#ffffff" strokeWidth={1.5} />
            </div>
            <div>
              <p
                style={{
                  color: "#fff",
                  fontSize: "clamp(1rem, 3vw, 1.25rem)",
                  fontWeight: 800,
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                CR Music
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  margin: "0.25rem 0 0 0",
                }}
              >
                Admin Panel
              </p>
            </div>
          </div>

          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(2rem, 6vw, 2.5rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "1.5rem",
              letterSpacing: "-0.02em",
            }}
          >
            Welcome
            <br />
            Admin
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "clamp(0.9375rem, 2vw, 1rem)",
              lineHeight: 1.6,
              marginBottom: 0,
              maxWidth: "90%",
            }}
          >
            Manage your music store inventory, orders, and analytics with our
            powerful admin panel.
          </p>
        </div>

        {/* Footer Text */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          © 2026 CR Music Administration
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(1.5rem, 4vw, 3rem)",
          background: "linear-gradient(to bottom right, #ffffff, #f8fafc)",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            animation: "slideInUp 0.4s ease",
          }}
        >
          {/* Mobile logo - Hidden on desktop */}
          <div
            style={{
              display: "none",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "2.5rem",
            }}
            className="hidden-desktop"
            onLoad={(e) => {
              (e.currentTarget as HTMLElement).style.display = "flex";
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
              }}
            >
              <Music2 size={20} color="#fff" strokeWidth={1.5} />
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.125rem",
                color: "#0f172a",
                letterSpacing: "-0.01em",
              }}
            >
              CR Music
            </span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 5vw, 2rem)",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "0.5rem",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Sign In
            </h2>
            <p
              style={{
                fontSize: "clamp(0.875rem, 2vw, 0.9375rem)",
                color: "#64748b",
                lineHeight: 1.5,
                margin: "0.5rem 0 0 0",
              }}
            >
              Access your admin dashboard
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "1rem",
                background: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                animation: "fadeIn 0.3s ease",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  background: "#dc2626",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "0.125rem",
                }}
              >
                <span style={{ color: "#fff", fontSize: "0.875rem", fontWeight: "bold" }}>!</span>
              </div>
              <span style={{ fontSize: "0.875rem", color: "#7f1d1d", lineHeight: 1.5 }}>
                {error}
              </span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  marginBottom: "0.5rem",
                }}
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="admin@crmusic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                style={{
                  width: "100%",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.75rem",
                  paddingBottom: "0.75rem",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  fontSize: "0.9375rem",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="login-password"
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  marginBottom: "0.5rem",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    paddingLeft: "1rem",
                    paddingRight: "2.75rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    fontSize: "0.9375rem",
                    boxSizing: "border-box",
                    transition: "all 0.2s ease",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    padding: "0.375rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#64748b";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.875rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  const input = (e.currentTarget as HTMLElement).querySelector(
                    "input"
                  ) as HTMLInputElement;
                  if (input) {
                    input.style.borderColor = "#4f46e5";
                    input.style.background = "#eef2ff";
                  }
                }}
                onMouseLeave={(e) => {
                  const input = (e.currentTarget as HTMLElement).querySelector(
                    "input"
                  ) as HTMLInputElement;
                  if (input) {
                    input.style.borderColor = "#e2e8f0";
                    input.style.background = "#ffffff";
                  }
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    accentColor: "#4f46e5",
                    cursor: "pointer",
                    border: "1px solid #e2e8f0",
                    transition: "all 0.2s ease",
                  }}
                />
                <span style={{ color: "#64748b", fontWeight: 500 }}>
                  Remember me
                </span>
              </label>
              <a
                href="#"
                style={{
                  color: "#4f46e5",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#4338ca";
                  (e.currentTarget as HTMLElement).style.textDecoration =
                    "underline";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#4f46e5";
                  (e.currentTarget as HTMLElement).style.textDecoration = "none";
                }}
                onClick={(e) => e.preventDefault()}
              >
                Forgot?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "0.5rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.875rem",
                paddingBottom: "0.875rem",
                background: loading ? "#6366f1" : "#4f46e5",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.5rem",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.9375rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.2s ease",
                fontFamily: "inherit",
                opacity: loading ? 0.9 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.background = "#4338ca";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 4px 12px rgba(79, 70, 229, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.background = "#4f46e5";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }
              }}
            >
              {loading ? (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="spin"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p
            style={{
              textAlign: "center",
              fontSize: "0.75rem",
              color: "#94a3b8",
              marginTop: "2rem",
              margin: "2rem 0 0 0",
            }}
          >
            © 2026 CR Music. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}