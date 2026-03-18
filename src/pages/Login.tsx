import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Music2, Lock, Shield } from "lucide-react";

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
        background: "#f8fafc",
      }}
    >
      {/* Left Panel - Branding */}
      <div
        style={{
          width: "48%",
          background:
            "linear-gradient(145deg, #4f46e5 0%, #7c3aed 60%, #6d28d9 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "3rem",
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden lg:flex"
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            background: "rgba(255,255,255,0.07)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -60,
            width: 400,
            height: 400,
            background: "rgba(255,255,255,0.05)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            right: "10%",
            width: 160,
            height: 160,
            background: "rgba(255,255,255,0.06)",
            borderRadius: "50%",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
              marginBottom: "3rem",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                background: "rgba(255,255,255,0.2)",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <Music2 size={26} color="#ffffff" />
            </div>
            <div>
              <p
                style={{
                  color: "#fff",
                  fontSize: "1.375rem",
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                CR Music
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                }}
              >
                Admin Panel
              </p>
            </div>
          </div>

          <h1
            style={{
              color: "#fff",
              fontSize: "2.25rem",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: "1rem",
              letterSpacing: "-0.03em",
            }}
          >
            Your complete
            <br />
            music store
            <br />
            management platform.
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "1rem",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
            }}
          >
            Manage products, orders, analytics, and customers all in one place.
          </p>

          {/* Feature list */}
          {[
            "Real-time inventory management",
            "Advanced analytics & reporting",
            "Seamless order processing",
          ].map((feature) => (
            <div
              key={feature}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.875rem",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                }}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#fff",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Mobile logo */}
          <div
            className="flex lg:hidden"
            style={{
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Music2 size={20} color="#fff" />
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.125rem",
                color: "#0f172a",
              }}
            >
              CR Music
            </span>
          </div>

          <h2
            style={{
              fontSize: "1.625rem",
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: "0.375rem",
              letterSpacing: "-0.025em",
            }}
          >
            Welcome back 👋
          </h2>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "#64748b",
              marginBottom: "2rem",
            }}
          >
            Sign in to your admin account
          </p>

          {/* Error */}
          {error && (
            <div
              className="alert alert-error"
              style={{ marginBottom: "1.25rem" }}
            >
              <span style={{ fontSize: "0.875rem" }}>{error}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {/* Email */}
            <div className="form-group">
              <label className="label" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="admin@crmusic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="label" htmlFor="login-password">
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: "2.75rem" }}
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
                    padding: "0.25rem",
                    display: "flex",
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  userSelect: "none",
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
                  }}
                />
                <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  Remember me
                </span>
              </label>
              <a
                href="#"
                style={{
                  fontSize: "0.875rem",
                  color: "#4f46e5",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-xl"
              style={{ width: "100%", marginTop: "0.5rem" }}
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
                    className="animate-spin"
                    style={{ animation: "spin 0.7s linear infinite" }}
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <Lock size={17} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.75rem",
              color: "#94a3b8",
              marginTop: "1rem",
            }}
          >
            © 2026 CR Music. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
