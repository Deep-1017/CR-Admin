import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down";
  icon?: ReactNode;
  description?: string;
  className?: string;
}

export default function StatCard({
  label,
  value,
  change,
  trend,
  icon,
  description,
  className = "",
}: StatCardProps) {
  const isPositive = trend === "up";

  return (
    <div className={`card hover:shadow-lg ${className}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-600 mb-1">{label}</p>
            <h3 className="text-3xl font-bold text-neutral-900">{value}</h3>
          </div>
          {icon && (
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
              {icon}
            </div>
          )}
        </div>

        {description && (
          <p className="text-xs text-neutral-500 mb-3">{description}</p>
        )}

        {change !== undefined && (
          <div className="flex items-center gap-2 pt-3 border-t border-neutral-200">
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <span>{isPositive ? '+' : ''}{change}%</span>
            </div>
            <span className="text-xs text-neutral-500">from last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
