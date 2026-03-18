import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastStyles: Record<
  ToastType,
  { icon: any; color: string; borderLeft: string }
> = {
  success: {
    icon: CheckCircle,
    color: "#15803d",
    borderLeft: "4px solid #22c55e",
  },
  error: {
    icon: AlertCircle,
    color: "#b91c1c",
    borderLeft: "4px solid #ef4444",
  },
  warning: {
    icon: AlertTriangle,
    color: "#b45309",
    borderLeft: "4px solid #f59e0b",
  },
  info: { icon: Info, color: "#4338ca", borderLeft: "4px solid #4f46e5" },
};

export function Toast({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
}: ToastItem) {
  const s = toastStyles[type];
  const Icon = s.icon;

  useEffect(() => {
    if (duration) {
      const t = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(t);
    }
  }, [id, duration, onClose]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "0.875rem 1rem",
        borderRadius: 10,
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderLeft: s.borderLeft,
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        minWidth: 280,
        maxWidth: 360,
        animation: "slideInRight 0.3s ease",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Icon size={18} style={{ color: s.color, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "#0f172a",
            margin: 0,
          }}
        >
          {title}
        </p>
        {message && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "#64748b",
              margin: "0.25rem 0 0",
            }}
          >
            {message}
          </p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#94a3b8",
          padding: "0.125rem",
          display: "flex",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "#374151";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "#94a3b8";
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: { id: string; type: ToastType; title: string; message?: string }[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.25rem",
        right: "1.25rem",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: "auto" }}>
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
