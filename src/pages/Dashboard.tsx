import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Music,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import SalesChart from "../components/SalesChart";
import { formatINR } from "../lib/utils";

const stats = [
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

const recentOrders = [
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

const topCategories = [
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
  approved: { bg: "#dcfce7", color: "#15803d" },
  pending: { bg: "#fef3c7", color: "#b45309" },
  rejected: { bg: "#fee2e2", color: "#b91c1c" },
  processing: { bg: "#e0e7ff", color: "#4338ca" },
};

export default function Dashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.25rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.625rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.025em",
              marginBottom: "0.25rem",
            }}
          >
            Dashboard
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "0.9375rem" }}>
            Welcome back! Here's your business overview and performance metrics.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.875rem",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: "0.875rem",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          <Calendar size={15} />
          March 10, 2026
        </div>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "1rem",
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isUp = stat.trend === "up";
          return (
            <div key={stat.label} className="stat-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    background: stat.bg,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.125rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: 99,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: isUp ? "#dcfce7" : "#fee2e2",
                    color: isUp ? "#15803d" : "#b91c1c",
                  }}
                >
                  {isUp ? (
                    <ArrowUpRight size={13} />
                  ) : (
                    <ArrowDownRight size={13} />
                  )}
                  {Math.abs(stat.change)}%
                </span>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "#64748b",
                    marginBottom: "0.25rem",
                    margin: 0,
                  }}
                >
                  {stat.label}
                </p>
                <p
                  style={{
                    fontSize: "1.625rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: "0.25rem 0 0",
                    letterSpacing: "-0.025em",
                  }}
                >
                  {typeof stat.value === "number" ? formatINR(stat.value) : stat.value}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    margin: "0.125rem 0 0",
                  }}
                >
                  {stat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) 320px",
          gap: "1rem",
          alignItems: "start",
        }}
      >
        {/* Revenue Chart */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div
            className="card-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Revenue Overview
              </h3>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "#94a3b8",
                  margin: "0.125rem 0 0",
                }}
              >
                Monthly revenue performance
              </p>
            </div>
            <select
              className="select"
              style={{ width: "auto", paddingLeft: "0.75rem" }}
            >
              <option>This Week</option>
              <option selected>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="card-body">
            <div style={{ height: 280 }}>
              <SalesChart />
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="card">
          <div className="card-header">
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Top Categories
            </h3>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "#94a3b8",
                margin: "0.125rem 0 0",
              }}
            >
              Best performing this month
            </p>
          </div>
          <div
            className="card-body"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.125rem",
            }}
          >
            {topCategories.map((cat, i) => {
              const isUp = cat.trend > 0;
              return (
                <div
                  key={cat.name}
                  style={{
                    paddingBottom:
                      i < topCategories.length - 1 ? "1.125rem" : 0,
                    borderBottom:
                      i < topCategories.length - 1
                        ? "1px solid #f1f5f9"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.375rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          background: "#eef2ff",
                          borderRadius: 7,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Music size={14} style={{ color: "#4f46e5" }} />
                      </div>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        {cat.name}
                      </span>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.125rem",
                        padding: "0.1875rem 0.5rem",
                        borderRadius: 99,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: isUp ? "#dcfce7" : "#fee2e2",
                        color: isUp ? "#15803d" : "#b91c1c",
                      }}
                    >
                      {isUp ? (
                        <ArrowUpRight size={12} />
                      ) : (
                        <ArrowDownRight size={12} />
                      )}
                      {Math.abs(cat.trend)}%
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "#94a3b8",
                      margin: 0,
                    }}
                  >
                    {cat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div
          className="card-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Recent Orders
            </h3>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "#94a3b8",
                margin: "0.125rem 0 0",
              }}
            >
              Latest customer transactions
            </p>
          </div>
          <a
            href="/orders"
            style={{
              fontSize: "0.875rem",
              color: "#4f46e5",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            View All →
          </a>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th style={{ textAlign: "center" }}>Qty</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const s = statusStyle[order.status.toLowerCase()] || {
                  bg: "#f1f5f9",
                  color: "#475569",
                };
                return (
                  <tr key={order.id}>
                    <td>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#0f172a",
                          fontFamily: "monospace",
                          fontSize: "0.8125rem",
                        }}
                      >
                        {order.id}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "#374151" }}>{order.product}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ color: "#64748b" }}>{order.qty}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          ...s,
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "0.1875rem 0.625rem",
                          borderRadius: 99,
                          fontSize: "0.75rem",
                          fontWeight: 500,
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>
                        {formatINR(order.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}