import { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
        padding: "0.75rem 1rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <p
        style={{
          fontWeight: 700,
          color: "#0f172a",
          margin: "0 0 0.375rem",
          fontSize: "0.75rem",
        }}
      >
        {label}
      </p>
      {payload.map((p: any) => (
        <p
          key={p.name}
          style={{
            fontSize: "0.75rem",
            color: p.color,
            margin: "0.0625rem 0",
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
        .fadeIn { animation: fadeIn 0.3s ease; }
        .slideInUp { animation: slideInUp 0.3s ease; }
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
        select:focus {
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "clamp(1.75rem, 5vw, 2rem)",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Analytics
            </h1>
            <p
              style={{
                color: "#64748b",
                margin: "0.5rem 0 0 0",
                fontSize: "clamp(0.875rem, 2vw, 0.9375rem)",
              }}
            >
              Real-time insights into your store
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              paddingLeft: "1rem",
              paddingRight: "0.5rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              background: "#f1f5f9",
              borderRadius: 8,
              fontSize: "0.875rem",
              color: "#374151",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              flexShrink: 0,
              border: "1px solid #e2e8f0",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
            }}
          >
            <Calendar size={16} strokeWidth={2} style={{ color: "#64748b" }} />
            <select
              style={{
                border: "none",
                background: "transparent",
                fontSize: "0.875rem",
                color: "#374151",
                cursor: "pointer",
                outline: "none",
                fontFamily: "inherit",
                padding: "0 0.5rem",
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
            gap: "0",
            borderBottom: "2px solid #f1f5f9",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.75rem clamp(0.75rem, 3vw, 1.25rem)",
                border: "none",
                cursor: "pointer",
                fontSize: "clamp(0.8125rem, 2vw, 0.875rem)",
                fontWeight: 500,
                fontFamily: "inherit",
                background: "transparent",
                color: activeTab === tab ? "#4f46e5" : "#94a3b8",
                borderBottom: activeTab === tab ? "2px solid #4f46e5" : "none",
                marginBottom: "-2px",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
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
            gridTemplateColumns:
              "repeat(auto-fit, minmax(clamp(150px, 100%, 220px), 1fr))",
            gap: "1rem",
          }}
        >
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                style={{
                  padding: "clamp(1rem, 4vw, 1.5rem)",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "#d4d4d8";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "#e2e8f0";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.65rem",
                        color: "#94a3b8",
                        margin: 0,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {kpi.label}
                    </p>
                    <p
                      style={{
                        fontSize: "clamp(1.125rem, 3.5vw, 1.375rem)",
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: "0.5rem 0 0",
                        letterSpacing: "-0.025em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {typeof kpi.value === "number"
                        ? formatINR(kpi.value)
                        : kpi.value}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "0.5rem",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: kpi.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={20} style={{ color: kpi.color }} />
                    </div>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: 6,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        background: kpi.up ? "#dcfce7" : "#fee2e2",
                        color: kpi.up ? "#15803d" : "#b91c1c",
                      }}
                    >
                      {kpi.change}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row 1 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(clamp(280px, 100%, 600px), 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* Revenue vs Expenses */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "clamp(1rem, 4vw, 1.5rem)",
              overflow: "hidden",
            }}
          >
            <div style={{ marginBottom: "1.25rem" }}>
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
                  margin: "0.25rem 0 0",
                }}
              >
                {dateRange} progression
              </p>
            </div>
            <div style={{ width: "100%", height: "100%", minHeight: "220px" }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#4f46e5"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorExpenses"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#ef4444"
                        stopOpacity={0.12}
                      />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="none"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                    }
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={6}
                    wrapperStyle={{ fontSize: "0.75rem" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={2}
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
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales by Category */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #f0f4f8",
              borderRadius: 12,
              padding: "clamp(1.25rem, 4vw, 1.75rem)",
              overflow: "hidden",
            }}
          >
            <div style={{ marginBottom: "1.75rem" }}>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Sales by Category
              </h3>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "#94a3b8",
                  margin: "0.5rem 0 0",
                  fontWeight: 400,
                }}
              >
                Revenue distribution across categories
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {categoryData.map((cat) => {
                return (
                  <div
                    key={cat.name}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "6px",
                            background: cat.color,
                            flexShrink: 0,
                            opacity: 0.85,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "#374151",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cat.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: "#0f172a",
                          flexShrink: 0,
                          minWidth: "45px",
                          textAlign: "right",
                        }}
                      >
                        {cat.value}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 7,
                        background: "#f0f4f8",
                        borderRadius: "99px",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${cat.value}%`,
                          background: cat.color,
                          borderRadius: "99px",
                          transition:
                            "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          boxShadow: `0 2px 8px ${cat.color}40`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Revenue Summary */}
            <div
              style={{
                marginTop: "1.75rem",
                paddingTop: "1.25rem",
                borderTop: "1px solid #f0f4f8",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#64748b",
                  }}
                >
                  Total Categories
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#4f46e5",
                  }}
                >
                  {categoryData.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(clamp(280px, 100%, 600px), 1fr))",
            gap: "1.5rem",
          }}
        >
          {/* Monthly Orders */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "clamp(1rem, 4vw, 1.5rem)",
              overflow: "hidden",
            }}
          >
            <div style={{ marginBottom: "1.25rem" }}>
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
                  margin: "0.25rem 0 0",
                }}
              >
                Orders placed vs returned
              </p>
            </div>
            <div style={{ width: "100%", height: "100%", minHeight: "220px" }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyOrders} barGap={4}>
                  <CartesianGrid
                    strokeDasharray="none"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={35}
                  />
                  <Tooltip />
                  <Legend
                    iconType="circle"
                    iconSize={6}
                    wrapperStyle={{ fontSize: "0.75rem" }}
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
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "clamp(1rem, 4vw, 1.5rem)",
              overflow: "hidden",
            }}
          >
            <div style={{ marginBottom: "1.25rem" }}>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Top Products
              </h3>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "#94a3b8",
                  margin: "0.25rem 0 0",
                }}
              >
                By revenue this period
              </p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.8125rem",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.75rem 0.5rem",
                        fontWeight: 600,
                        color: "#64748b",
                        fontSize: "0.7rem",
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.75rem 0.5rem",
                        fontWeight: 600,
                        color: "#64748b",
                        fontSize: "0.7rem",
                      }}
                    >
                      Product
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "0.75rem 0.5rem",
                        fontWeight: 600,
                        color: "#64748b",
                        fontSize: "0.7rem",
                      }}
                    >
                      Units
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "0.75rem 0.5rem",
                        fontWeight: 600,
                        color: "#64748b",
                        fontSize: "0.7rem",
                      }}
                    >
                      Revenue
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "0.75rem 0.5rem",
                        fontWeight: 600,
                        color: "#64748b",
                        fontSize: "0.7rem",
                      }}
                    >
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, i) => (
                    <tr
                      key={product.rank}
                      style={{
                        borderBottom:
                          i < topProducts.length - 1
                            ? "1px solid #f1f5f9"
                            : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "0.75rem 0.5rem",
                          fontWeight: 600,
                          color: "#64748b",
                        }}
                      >
                        {product.rank}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 0.5rem",
                          color: "#374151",
                          maxWidth: "120px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.name}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 0.5rem",
                          textAlign: "right",
                          color: "#64748b",
                        }}
                      >
                        {product.units}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 0.5rem",
                          textAlign: "right",
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        {formatINR(product.revenue)}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem 0.5rem",
                          textAlign: "right",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            color: product.growth.startsWith("+")
                              ? "#15803d"
                              : "#b91c1c",
                            background: product.growth.startsWith("+")
                              ? "#dcfce7"
                              : "#fee2e2",
                            padding: "0.125rem 0.375rem",
                            borderRadius: 4,
                            display: "inline-block",
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
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "clamp(1rem, 4vw, 1.5rem)",
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
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
                margin: "0.25rem 0 0",
              }}
            >
              Where your visitors come from
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(clamp(200px, 100%, 250px), 1fr))",
              gap: "clamp(1.5rem, 4vw, 2rem)",
            }}
          >
            {trafficSources.map((source) => (
              <div key={source.name}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.625rem",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: source.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#374151",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
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
                      flexShrink: 0,
                    }}
                  >
                    {source.value}%
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
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
