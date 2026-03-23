import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Calendar,
} from "lucide-react";
import SalesChart from "../components/SalesChart";
import { formatINR } from "../lib/utils";

// Type definitions
interface Stat {
  label: string;
  value: number | string;
  change: number;
  trend: "up" | "down";
  icon: React.ComponentType<{
    size: number;
    style?: React.CSSProperties;
    strokeWidth?: number;
  }>;
  color: string;
  bg: string;
  desc: string;
}

interface Order {
  id: string;
  product: string;
  qty: number;
  status: "Approved" | "Pending" | "Rejected" | "Processing";
  amount: number;
}

interface Category {
  name: string;
  trend: number;
  description: string;
}

// Constants for styling
const COLORS = {
  dark: "#0f172a",
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#374151",
  },
  border: "#f1f5f9",
  green: { light: "#dcfce7", dark: "#15803d" },
  red: { light: "#fee2e2", dark: "#b91c1c" },
  primary: "#4f46e5",
  primaryDark: "#4338ca",
};

const stats: Stat[] = [
  {
    label: "Total Revenue",
    value: 35078,
    change: 27.4,
    trend: "up",
    icon: DollarSign,
    color: "#4f46e5",
    bg: "#eef2ff",
    desc: "This month",
  },
  {
    label: "Total Orders",
    value: "18,800",
    change: -12.4,
    trend: "down",
    icon: ShoppingBag,
    color: "#f97316",
    bg: "#fff7ed",
    desc: "In progress",
  },
  {
    label: "Total Customers",
    value: "78,250",
    change: 70.5,
    trend: "up",
    icon: Users,
    color: "#22c55e",
    bg: "#f0fdf4",
    desc: "New this month",
  },
  {
    label: "Page Views",
    value: "442K",
    change: 59.3,
    trend: "up",
    icon: TrendingUp,
    color: "#8b5cf6",
    bg: "#f5f3ff",
    desc: "From last month",
  },
];

const recentOrders: Order[] = [
  {
    id: "#84564564",
    product: "Fender Stratocaster",
    qty: 2,
    status: "Rejected",
    amount: 2998,
  },
  {
    id: "#84564565",
    product: "Yamaha P-515 Digital Piano",
    qty: 5,
    status: "Pending",
    amount: 7495,
  },
  {
    id: "#84564566",
    product: "Pearl Export Drum Kit",
    qty: 3,
    status: "Approved",
    amount: 2697,
  },
  {
    id: "#84564567",
    product: "Shure SM7dB Microphone",
    qty: 8,
    status: "Approved",
    amount: 3992,
  },
  {
    id: "#84564568",
    product: "Pioneer DDJ-REV7 Controller",
    qty: 1,
    status: "Processing",
    amount: 1299,
  },
];

const topCategories: Category[] = [
  {
    name: "Amplifier",
    trend: 45.14,
    description: "Top seller for live setups this month.",
  },
  {
    name: "Microphone",
    trend: 28.3,
    description: "Strong demand for studio and stage microphones.",
  },
  {
    name: "Portable Speaker",
    trend: -0.5,
    description: "Slight dip, but still a popular category.",
  },
];

const statusStyle: Record<string, { bg: string; color: string }> = {
  approved: { bg: COLORS.green.light, color: COLORS.green.dark },
  pending: { bg: "#fef3c7", color: "#b45309" },
  rejected: { bg: COLORS.red.light, color: COLORS.red.dark },
  processing: { bg: "#e0e7ff", color: "#4338ca" },
};

// Component for stat card
const StatCard = ({ stat }: { stat: Stat }) => {
  const Icon = stat.icon;
  const isUp = stat.trend === "up";

  return (
    <div
      style={{
        padding: "1rem 1.25rem",
        background: "#ffffff",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = COLORS.slate[100];
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: stat.bg,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} style={{ color: stat.color }} strokeWidth={1.5} />
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: isUp ? COLORS.green.dark : COLORS.red.dark,
          }}
        >
          {isUp ? "↑" : "↓"} {Math.abs(stat.change)}%
        </span>
      </div>

      <div>
        <p
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: COLORS.dark,
            margin: "0 0 0.25rem 0",
          }}
        >
          {typeof stat.value === "number" ? formatINR(stat.value) : stat.value}
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: COLORS.slate[500],
            margin: 0,
            fontWeight: 500,
          }}
        >
          {stat.label}
        </p>
        <p
          style={{
            fontSize: "0.7rem",
            color: COLORS.slate[400],
            margin: "0.25rem 0 0 0",
          }}
        >
          {stat.desc}
        </p>
      </div>
    </div>
  );
};

// Component for category item
const CategoryItem = ({ category }: { category: Category }) => {
  const isUp = category.trend > 0;

  return (
    <div
      style={{
        padding: "0.75rem",
        borderRadius: 6,
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = COLORS.slate[50];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
          marginBottom: "0.25rem",
        }}
      >
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: COLORS.dark,
          }}
        >
          {category.name}
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: isUp ? COLORS.green.dark : COLORS.red.dark,
          }}
        >
          {isUp ? "↑" : "↓"} {Math.abs(category.trend)}%
        </span>
      </div>
      <p
        style={{
          fontSize: "0.75rem",
          color: COLORS.slate[400],
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {category.description}
      </p>
    </div>
  );
};

// Component for order row
const OrderRow = ({ order, isLast }: { order: Order; isLast: boolean }) => {
  const s = statusStyle[order.status.toLowerCase()] || {
    bg: COLORS.border,
    color: COLORS.slate[600],
  };

  return (
    <tr
      style={{
        borderBottom: isLast ? "none" : `1px solid ${COLORS.border}`,
        transition: "background 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = COLORS.slate[50];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <td style={{ padding: "0.875rem 1.25rem" }}>
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: COLORS.dark,
            fontFamily: "monospace",
          }}
        >
          {order.id}
        </span>
      </td>
      <td style={{ padding: "0.875rem 1.25rem" }}>
        <span
          style={{
            fontSize: "0.8125rem",
            color: COLORS.slate[700],
            fontWeight: 500,
            maxWidth: "180px",
            display: "inline-block",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={order.product}
        >
          {order.product}
        </span>
      </td>
      <td style={{ padding: "0.875rem 1.25rem", textAlign: "center" }}>
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: COLORS.slate[500],
          }}
        >
          {order.qty}
        </span>
      </td>
      <td style={{ padding: "0.875rem 1.25rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.25rem 0.625rem",
            borderRadius: 4,
            fontSize: "0.7rem",
            fontWeight: 600,
            background: s.bg,
            color: s.color,
            whiteSpace: "nowrap",
          }}
        >
          {order.status}
        </span>
      </td>
      <td style={{ padding: "0.875rem 1.25rem", textAlign: "right" }}>
        <span
          style={{
            fontSize: "0.8875rem",
            fontWeight: 700,
            color: COLORS.dark,
          }}
        >
          {formatINR(order.amount)}
        </span>
      </td>
    </tr>
  );
};

export default function Dashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 600,
            color: COLORS.dark,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Dashboard
        </h1>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.875rem",
            background: COLORS.slate[50],
            border: "none",
            borderRadius: 6,
            fontSize: "0.8125rem",
            color: COLORS.slate[500],
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = COLORS.slate[100];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = COLORS.slate[50];
          }}
          aria-label="Current date filter"
        >
          <Calendar size={14} strokeWidth={2} />
          March 10, 2026
        </button>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Charts & Categories */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Revenue Chart */}
        <div
          style={{
            padding: "1.25rem",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            background: "#ffffff",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: COLORS.dark,
                margin: 0,
              }}
            >
              Revenue
            </h3>
            <select
              defaultValue="month"
              style={
                {
                  padding: "0.375rem 1.75rem 0.375rem 0.625rem",
                  borderRadius: 6,
                  border: `1px solid ${COLORS.border}`,
                  fontSize: "0.75rem",
                  color: COLORS.slate[500],
                  fontWeight: 500,
                  cursor: "pointer",
                  background: `#ffffff url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 0.375rem center/1rem`,
                  outline: "none",
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                } as React.CSSProperties
              }
              aria-label="Revenue time period"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div style={{ height: 240, minWidth: 0, overflow: "visible" }}>
            <SalesChart />
          </div>
        </div>

        {/* Top Categories */}
        <div
          style={{
            background: "#ffffff",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            padding: "1.25rem",
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: COLORS.dark,
              margin: "0 0 1rem 0",
            }}
          >
            Top Categories
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {topCategories.map((cat) => (
              <CategoryItem key={cat.name} category={cat} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div
        style={{
          background: "#ffffff",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.25rem",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: COLORS.dark,
              margin: 0,
            }}
          >
            Recent Orders
          </h3>
          <a
            href="/orders"
            style={{
              fontSize: "0.8125rem",
              color: COLORS.primary,
              fontWeight: 600,
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = COLORS.primaryDark;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = COLORS.primary;
            }}
          >
            View All →
          </a>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: `1px solid ${COLORS.border}`,
                  background: COLORS.slate[50],
                }}
              >
                <th
                  style={{
                    padding: "0.875rem 1.25rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: COLORS.slate[500],
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                  }}
                >
                  Order
                </th>
                <th
                  style={{
                    padding: "0.875rem 1.25rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: COLORS.slate[500],
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                  }}
                >
                  Product
                </th>
                <th
                  style={{
                    padding: "0.875rem 1.25rem",
                    textAlign: "center",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: COLORS.slate[500],
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                  }}
                >
                  Qty
                </th>
                <th
                  style={{
                    padding: "0.875rem 1.25rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: COLORS.slate[500],
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "0.875rem 1.25rem",
                    textAlign: "right",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: COLORS.slate[500],
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                  }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, idx) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  isLast={idx === recentOrders.length - 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
