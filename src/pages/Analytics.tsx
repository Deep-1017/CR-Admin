import { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  ShoppingCart,
  Calendar,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatINR } from "../lib/utils";

const revenueData = [
  { month: "Aug", revenue: 28000, expenses: 18000 },
  { month: "Sep", revenue: 35000, expenses: 22000 },
  { month: "Oct", revenue: 31000, expenses: 19000 },
  { month: "Nov", revenue: 52000, expenses: 28000 },
  { month: "Dec", revenue: 68000, expenses: 32000 },
  { month: "Jan", revenue: 45000, expenses: 25000 },
  { month: "Feb", revenue: 58000, expenses: 30000 },
  { month: "Mar", revenue: 72000, expenses: 38000 },
];

const monthlyOrders = [
  { month: "Aug", orders: 148, returned: 12 },
  { month: "Sep", orders: 205, returned: 18 },
  { month: "Oct", orders: 185, returned: 15 },
  { month: "Nov", orders: 312, returned: 22 },
  { month: "Dec", orders: 420, returned: 35 },
  { month: "Jan", orders: 265, returned: 20 },
  { month: "Feb", orders: 345, returned: 28 },
  { month: "Mar", orders: 390, returned: 25 },
];

const categoryData = [
  { name: "Amplifier", value: 35, color: "#4f46e5" },
  { name: "Microphone", value: 22, color: "#7c3aed" },
  { name: "Portable Speaker", value: 18, color: "#22c55e" },
  { name: "Unit Driver", value: 15, color: "#f59e0b" },
  { name: "Drivers", value: 10, color: "#ef4444" },
];

const topProducts = [
  {
    rank: 1,
    name: "Fender Stratocaster Player",
    units: 248,
    revenue: 371752,
    growth: "+24%",
  },
  {
    rank: 2,
    name: "Yamaha P-515 Digital Piano",
    units: 185,
    revenue: 277175,
    growth: "+18%",
  },
  {
    rank: 3,
    name: "Pioneer DDJ-REV7",
    units: 142,
    revenue: 184358,
    growth: "+31%",
  },
  {
    rank: 4,
    name: "Shure SM7dB Microphone",
    units: 318,
    revenue: 158682,
    growth: "+12%",
  },
  {
    rank: 5,
    name: "Pearl Export Drum Kit",
    units: 97,
    revenue: 87203,
    growth: "-3%",
  },
];

const trafficSources = [
  { name: "Direct", value: 40, color: "#4f46e5" },
  { name: "Organic Search", value: 30, color: "#7c3aed" },
  { name: "Social Media", value: 18, color: "#22c55e" },
  { name: "Referral", value: 12, color: "#f59e0b" },
];

const kpis = [
  {
    label: "Gross Revenue",
    value: 142500,
    change: "+18.3%",
    up: true,
    icon: DollarSign,
    color: "#4f46e5",
    bg: "#eef2ff",
  },
  {
    label: "Net Profit",
    value: 89200,
    change: "+12.7%",
    up: true,
    icon: TrendingUp,
    color: "#22c55e",
    bg: "#f0fdf4",
  },
  {
    label: "Conversion Rate",
    value: "3.24%",
    change: "+0.8%",
    up: true,
    icon: BarChart3,
    color: "#8b5cf6",
    bg: "#f5f3ff",
  },
  {
    label: "Avg. Order Value",
    value: 278,
    change: "+5.2%",
    up: true,
    icon: ShoppingCart,
    color: "#f59e0b",
    bg: "#fffbeb",
  },
];

const TABS = ["Overview", "Revenue", "Products", "Customers"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "1rem 1.25rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <p
        style={{
          fontWeight: 700,
          color: "#0f172a",
          margin: "0 0 0.5rem",
          fontSize: "0.875rem",
        }}
      >
        {label}
      </p>
      {payload.map((p: any) => (
        <p
          key={p.name}
          style={{
            fontSize: "0.8125rem",
            color: p.color,
            margin: "0.125rem 0",
          }}
        >
          {p.name}: <strong>{formatINR(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [dateRange, setDateRange] = useState("Last 30 Days");

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
            Analytics
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "0.9375rem" }}>
            Deep-dive into your store performance
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
            cursor: "pointer",
          }}
        >
          <Calendar size={15} />
          <select
            style={{
              border: "none",
              background: "transparent",
              fontSize: "0.875rem",
              color: "#374151",
              cursor: "pointer",
              outline: "none",
              fontFamily: "inherit",
            }}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          background: "#f1f5f9",
          borderRadius: 10,
          padding: "0.25rem",
          width: "fit-content",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.4375rem 1rem",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              fontFamily: "inherit",
              transition: "all 0.15s ease",
              background: activeTab === tab ? "#fff" : "transparent",
              color: activeTab === tab ? "#0f172a" : "#64748b",
              boxShadow:
                activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
        }}
      >
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="stat-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: kpi.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} style={{ color: kpi.color }} />
                </div>
                <span
                  style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: 99,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    background: kpi.up ? "#dcfce7" : "#fee2e2",
                    color: kpi.up ? "#15803d" : "#b91c1c",
                  }}
                >
                  {kpi.change}
                </span>
              </div>
              <div>
                <p
                  style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}
                >
                  {kpi.label}
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
                  {typeof kpi.value === "number" ? formatINR(kpi.value) : kpi.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}
      >
        {/* Revenue vs Expenses */}
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
              Revenue vs Expenses
            </h3>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "#94a3b8",
                margin: "0.125rem 0 0",
              }}
            >
              Monthly comparison for 2025–2026
            </p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorExpenses"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatINR(v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "0.8125rem" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#colorExpenses)"
                  name="Expenses"
                  strokeDasharray="4 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
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
              Sales by Category
            </h3>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "#94a3b8",
                margin: "0.125rem 0 0",
              }}
            >
              Revenue distribution
            </p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              {categoryData.map((cat) => (
                <div
                  key={cat.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: cat.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "0.8125rem", color: "#374151" }}>
                      {cat.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#0f172a",
                    }}
                  >
                    {cat.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        {/* Monthly Orders */}
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
              Monthly Orders
            </h3>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "#94a3b8",
                margin: "0.125rem 0 0",
              }}
            >
              Orders placed vs returned
            </p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyOrders} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "0.8125rem" }}
                />
                <Bar
                  dataKey="orders"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                  name="Orders"
                />
                <Bar
                  dataKey="returned"
                  fill="#f87171"
                  radius={[4, 4, 0, 0]}
                  name="Returned"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
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
                Top Performing Products
              </h3>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "#94a3b8",
                  margin: "0.125rem 0 0",
                }}
              >
                By revenue this period
              </p>
            </div>
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
              View All
            </button>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>#</th>
                  <th>Product</th>
                  <th>Units</th>
                  <th>Revenue</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.rank}>
                    <td>
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "#f1f5f9",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        {product.rank}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                          color: "#374151",
                          display: "block",
                          maxWidth: 160,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.name}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>
                        {product.units}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {product.revenue}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: product.growth.startsWith("+")
                            ? "#15803d"
                            : "#b91c1c",
                          background: product.growth.startsWith("+")
                            ? "#dcfce7"
                            : "#fee2e2",
                          padding: "0.1875rem 0.5rem",
                          borderRadius: 99,
                        }}
                      >
                        {product.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
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
            Traffic Sources
          </h3>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "#94a3b8",
              margin: "0.125rem 0 0",
            }}
          >
            Where your visitors come from
          </p>
        </div>
        <div className="card-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.25rem",
            }}
          >
            {trafficSources.map((source) => (
              <div key={source.name}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: source.color,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      {source.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    {source.value}%
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: "#f1f5f9",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${source.value}%`,
                      background: source.color,
                      borderRadius: 99,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}