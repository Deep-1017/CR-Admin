import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "warning" | "error" | "primary" | "neutral";
  className?: string;
}

export default function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  const variantStyles = {
    success: "badge badge-success",
    warning: "badge badge-warning",
    error: "badge badge-error",
    primary: "badge badge-info",
    neutral: "badge badge-neutral",
  };

  return (
    <span className={`${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
