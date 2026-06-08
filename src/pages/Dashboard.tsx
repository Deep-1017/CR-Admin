import { useEffect, useMemo, useRef, useState } from "react";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Calendar,
  Loader2,
} from "lucide-react";
import SalesChart from "../components/SalesChart";
import { formatINR } from "../lib/utils";
import {
  fetchRevenueAnalytics,
  fetchOrdersAnalytics,
  fetchCustomersAnalytics,
  fetchTopProductsAnalytics,
  type RevenuePoint,
  type TopProduct,
} from "../api/analytics";
import { fetchOrders, type Order as ApiOrder } from "../api/orders";

// Local display types
interface Stat {
  label: string;
  value: number | string;
  change: number;
  trend: "up" | "down";
  currency?: boolean;
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

const statusStyle: Record<string, { bg: string; color: string }> = {
  approved: { bg: COLORS.green.light, color: COLORS.green.dark },
  pending: { bg: "#fef3c7", color: "#b45309" },
  rejected: { bg: COLORS.red.light, color: COLORS.red.dark },
  processing: { bg: "#e0e7ff", color: "#4338ca" },
};

// Pure helpers
function getDateParams(period: string) {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case "week":
      start.setDate(end.getDate() - 6);
      break;
    case "year":
      start.setMonth(0, 1);
      break;
    default:
      start.setDate(end.getDate() - 29);
  }
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

function getPrevDateParams(period: string) {
  const curr = getDateParams(period);
  const s = new Date(curr.startDate);
  const e = new Date(curr.endDate);
  const diffMs = e.getTime() - s.getTime();
  const prevEnd = new Date(s.getTime() - 86400000);
  const prevStart = new Date(prevEnd.getTime() - diffMs);
  return {
    startDate: prevStart.toISOString().split("T")[0],
    endDate: prevEnd.toISOString().split("T")[0],
  };
}

function mapStatus(status: ApiOrder["status"]): Order["status"] {
  if (status === "Completed") return "Approved";
  if (status === "Cancelled") return "Rejected";
  return status as "Pending" | "Processing";
}

function pctChange(current: number, prev: number): number {
  if (prev === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 1000) / 10;
}

// Sub-components
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
          {typeof stat.value === "number"
            ? stat.currency
              ? formatINR(stat.value)
              : stat.value.toLocaleString("en-IN")
            : stat.value}
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

const TopProductItem = ({
  product,
  rank,
}: {
  product: TopProduct;
  rank: number;
}) => (
  <div
    style={{
      padding: "0.75rem",
      borderRadius: 6,
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = COLORS.slate[50];
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
    }}
  >
    <span
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: COLORS.slate[100],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.75rem",
        fontWeight: 700,
        color: COLORS.slate[600],
        flexShrink: 0,
      }}
    >
      {rank}
    </span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: COLORS.dark,
          margin: "0 0 0.25rem 0",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={product.name}
      >
        {product.name}
      </p>
      <p style={{ fontSize: "0.75rem", color: COLORS.slate[400], margin: 0 }}>
        {product.unitsSold} units · {formatINR(product.totalRevenue)}
      </p>
    </div>
  </div>
);

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
  const [revenuePeriod, setRevenuePeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [prevRevenue, setPrevRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [prevOrders, setPrevOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newSignups, setNewSignups] = useState(0);
  const [prevSignups, setPrevSignups] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const periodChangedRef = useRef(false);

  // Initial load: all stats + recent orders + top products (default month)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = getDateParams("month");
        const prevParams = getPrevDateParams("month");
        const [
          revenueRes,
          prevRevenueRes,
          ordersRes,
          prevOrdersRes,
          customersRes,
          prevCustomersRes,
          ordersListRes,
          topProductsRes,
        ] = await Promise.all([
          fetchRevenueAnalytics(params),
          fetchRevenueAnalytics(prevParams),
          fetchOrdersAnalytics(params),
          fetchOrdersAnalytics(prevParams),
          fetchCustomersAnalytics(params),
          fetchCustomersAnalytics(prevParams),
          fetchOrders({ limit: 5 }),
          fetchTopProductsAnalytics(3),
        ]);

        setTotalRevenue(revenueRes.totalRevenue);
        setPrevRevenue(prevRevenueRes.totalRevenue);
        setTotalOrders(ordersRes.totalOrders);
        setPrevOrders(prevOrdersRes.totalOrders);
        setTotalCustomers(customersRes.totalCustomers);
        setNewSignups(customersRes.newSignups);
        setPrevSignups(prevCustomersRes.newSignups);
        setRevenueData(revenueRes.dailyRevenue);
        setTopProducts(topProductsRes.topProducts);

        setRecentOrders(
          ordersListRes.orders.map((o) => ({
            id: `#${o.id.slice(-8).toUpperCase()}`,
            product: o.items[0]?.name ?? "—",
            qty: o.items.reduce((s, item) => s + item.quantity, 0),
            status: mapStatus(o.status),
            amount: o.totalAmount,
          })),
        );
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Refetch revenue chart when period selector changes
  useEffect(() => {
    if (!periodChangedRef.current) {
      periodChangedRef.current = true;
      return;
    }
    const loadRevenue = async () => {
      try {
        const params = getDateParams(revenuePeriod);
        const res = await fetchRevenueAnalytics(params);
        setRevenueData(res.dailyRevenue);
      } catch (err) {
        console.error("Revenue fetch error:", err);
      }
    };
    loadRevenue();
  }, [revenuePeriod]);

  const revenueChartData = useMemo(
    () =>
      revenueData.map((item) => ({
        label: new Date(item.date).toLocaleDateString("en-IN", {
          month: "short",
          day: "2-digit",
        }),
        revenue: item.revenue,
      })),
    [revenueData],
  );

  const revenueChange = pctChange(totalRevenue, prevRevenue);
  const ordersChange = pctChange(totalOrders, prevOrders);
  const signupsChange = pctChange(newSignups, prevSignups);

  const stats: Stat[] = [
    {
      label: "Total Revenue",
      value: totalRevenue,
      change: Math.abs(revenueChange),
      trend: revenueChange >= 0 ? "up" : "down",
      currency: true,
      icon: DollarSign,
      color: "#4f46e5",
      bg: "#eef2ff",
      desc: "vs. last period",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      change: Math.abs(ordersChange),
      trend: ordersChange >= 0 ? "up" : "down",
      icon: ShoppingBag,
      color: "#f97316",
      bg: "#fff7ed",
      desc: "This month",
    },
    {
      label: "Total Customers",
      value: totalCustomers,
      change: Math.abs(signupsChange),
      trend: signupsChange >= 0 ? "up" : "down",
      icon: Users,
      color: "#22c55e",
      bg: "#f0fdf4",
      desc: "All time",
    },
    {
      label: "New Signups",
      value: newSignups,
      change: Math.abs(signupsChange),
      trend: signupsChange >= 0 ? "up" : "down",
      icon: TrendingUp,
      color: "#8b5cf6",
      bg: "#f5f3ff",
      desc: "vs. last period",
    },
  ];

  if (loading) {
    return (
      <>
        <style>{`.spin{animation:spin 0.9s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
            color: COLORS.primary,
            gap: "0.625rem",
            fontWeight: 600,
          }}
        >
          <Loader2 size={20} className="spin" /> Loading dashboard...
        </div>
      </>
    );
  }

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
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
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

      {/* Charts & Top Products */}
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
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value)}
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
            <SalesChart data={revenueChartData} />
          </div>
        </div>

        {/* Top Products */}
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
            Top Products
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            {topProducts.length > 0 ? (
              topProducts.map((p, i) => (
                <TopProductItem key={p.productId} product={p} rank={i + 1} />
              ))
            ) : (
              <p
                style={{
                  color: COLORS.slate[400],
                  fontSize: "0.875rem",
                  padding: "0.75rem",
                  margin: 0,
                }}
              >
                No sales data available
              </p>
            )}
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
                {["Order", "Product", "Qty", "Status", "Amount"].map(
                  (col, i) => (
                    <th
                      key={col}
                      style={{
                        padding: "0.875rem 1.25rem",
                        textAlign:
                          i === 2
                            ? "center"
                            : i === 4
                              ? "right"
                              : "left",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: COLORS.slate[500],
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order, idx) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    isLast={idx === recentOrders.length - 1}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: COLORS.slate[400],
                      fontSize: "0.875rem",
                    }}
                  >
                    No recent orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
