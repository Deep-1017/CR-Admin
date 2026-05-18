import { useEffect, useMemo, useState } from "react";
import { Calendar, DollarSign, Loader2, ShoppingCart, UserPlus } from "lucide-react";
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
import {
  fetchCustomersAnalytics,
  fetchOrdersAnalytics,
  fetchRevenueAnalytics,
  fetchTopProductsAnalytics,
  type OrdersAnalyticsResponse,
  type RevenuePoint,
  type TopProduct,
} from "../api/analytics";

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
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
      <p style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 0.375rem", fontSize: "0.75rem" }}>
        {label}
      </p>
      {payload.map((p: TooltipEntry) => (
        <p key={p.name} style={{ fontSize: "0.75rem", color: p.color, margin: "0.0625rem 0" }}>
          {p.name}: <strong>{formatINR(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [ordersSummary, setOrdersSummary] = useState<OrdersAnalyticsResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [customerTotals, setCustomerTotals] = useState({ totalCustomers: 0, newSignups: 0 });

  const getDateRangeParams = (range: string) => {
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case "Last 7 Days":
        startDate.setDate(endDate.getDate() - 6);
        break;
      case "Last 90 Days":
        startDate.setDate(endDate.getDate() - 89);
        break;
      case "This Year":
        startDate.setMonth(0, 1);
        break;
      case "Last 30 Days":
      default:
        startDate.setDate(endDate.getDate() - 29);
        break;
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = getDateRangeParams(dateRange);
        const [revenueRes, ordersRes, productsRes, customersRes] = await Promise.all([
          fetchRevenueAnalytics(params),
          fetchOrdersAnalytics(params),
          fetchTopProductsAnalytics(5),
          fetchCustomersAnalytics(params),
        ]);
        setRevenueData(revenueRes.dailyRevenue);
        setOrdersSummary(ordersRes);
        setTopProducts(productsRes.topProducts);
        setCustomerTotals({
          totalCustomers: customersRes.totalCustomers,
          newSignups: customersRes.newSignups,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load analytics data.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [dateRange]);

  const revenueChartData = useMemo(
    () =>
      revenueData.map((item) => ({
        ...item,
        label: new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "2-digit" }),
      })),
    [revenueData],
  );

  const orderStatusChartData = useMemo(() => {
    if (!ordersSummary) return [];
    return [
      { status: "Processing", count: ordersSummary.byStatus.Processing },
      { status: "Shipped", count: ordersSummary.byStatus.Shipped },
      { status: "Delivered", count: ordersSummary.byStatus.Delivered },
      { status: "Cancelled", count: ordersSummary.byStatus.Cancelled },
    ];
  }, [ordersSummary]);

  const totalRevenue = useMemo(
    () => revenueData.reduce((sum, item) => sum + Number(item.revenue || 0), 0),
    [revenueData],
  );

  const avgOrderValue = useMemo(() => {
    const totalOrders = ordersSummary?.totalOrders ?? 0;
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  }, [ordersSummary, totalRevenue]);

  const kpis = [
    { label: "Gross Revenue", value: totalRevenue, icon: DollarSign, color: "#4f46e5", bg: "#eef2ff" },
    { label: "Total Orders", value: ordersSummary?.totalOrders ?? 0, icon: ShoppingCart, color: "#f59e0b", bg: "#fffbeb" },
    { label: "Avg. Order Value", value: avgOrderValue, icon: ShoppingCart, color: "#8b5cf6", bg: "#f5f3ff" },
    { label: "New Customers", value: customerTotals.newSignups, icon: UserPlus, color: "#22c55e", bg: "#f0fdf4" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom right, #f8fafc, #ffffff, #f8fafc)", padding: "2rem 1rem" }}>
      <style>{`.spin{animation:spin 0.9s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 2rem)", fontWeight: 800, color: "#0f172a", margin: 0 }}>Analytics</h1>
            <p style={{ color: "#64748b", margin: "0.5rem 0 0", fontSize: "clamp(0.875rem, 2vw, 0.9375rem)" }}>
              Live insights from your store data
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.5rem 0.5rem 1rem", background: "#f1f5f9", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <Calendar size={16} strokeWidth={2} style={{ color: "#64748b" }} />
            <select style={{ border: "none", background: "transparent", fontSize: "0.875rem", color: "#374151", outline: "none", fontFamily: "inherit", padding: "0 0.5rem" }} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320, color: "#4f46e5", gap: "0.625rem", fontWeight: 600 }}>
            <Loader2 size={20} className="spin" /> Loading analytics...
          </div>
        ) : error ? (
          <div style={{ border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", borderRadius: 12, padding: "1rem 1.25rem", fontWeight: 600 }}>
            {error}
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(clamp(150px, 100%, 220px), 1fr))", gap: "1rem" }}>
              {kpis.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} style={{ padding: "clamp(1rem, 4vw, 1.5rem)", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                      <div>
                        <p style={{ fontSize: "0.65rem", color: "#94a3b8", margin: 0, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{kpi.label}</p>
                        <p style={{ fontSize: "clamp(1.125rem, 3.5vw, 1.375rem)", fontWeight: 800, color: "#0f172a", margin: "0.5rem 0 0" }}>
                          {typeof kpi.value === "number" ? formatINR(kpi.value) : kpi.value}
                        </p>
                      </div>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={20} style={{ color: kpi.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(clamp(280px, 100%, 600px), 1fr))", gap: "1.5rem" }}>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "clamp(1rem, 4vw, 1.5rem)" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Daily Revenue</h3>
                <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: "0.25rem 0 0" }}>{dateRange} progression</p>
                <div style={{ width: "100%", minHeight: 220 }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} width={35} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "0.75rem" }} />
                      <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#colorRevenue)" name="Revenue" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "clamp(1rem, 4vw, 1.5rem)" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Customers</h3>
                <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: "0.25rem 0 1rem" }}>New signups in selected range</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "0.9rem" }}>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.8rem" }}>Total Customers</p>
                    <p style={{ margin: "0.4rem 0 0", color: "#0f172a", fontSize: "1.4rem", fontWeight: 800 }}>{customerTotals.totalCustomers}</p>
                  </div>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: "0.9rem" }}>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.8rem" }}>New Signups</p>
                    <p style={{ margin: "0.4rem 0 0", color: "#0f172a", fontSize: "1.4rem", fontWeight: 800 }}>{customerTotals.newSignups}</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(clamp(280px, 100%, 600px), 1fr))", gap: "1.5rem" }}>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "clamp(1rem, 4vw, 1.5rem)" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Orders by Status</h3>
                <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: "0.25rem 0 0" }}>Processing, shipped, delivered, cancelled</p>
                <div style={{ width: "100%", minHeight: 220 }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={orderStatusChartData} barGap={4}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={35} />
                      <Tooltip />
                      <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "0.75rem" }} />
                      <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "clamp(1rem, 4vw, 1.5rem)" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Top Products</h3>
                <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: "0.25rem 0 0" }}>By units sold and revenue</p>
                <div style={{ overflowX: "auto", marginTop: "0.75rem" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600, color: "#64748b", fontSize: "0.7rem" }}>#</th>
                        <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600, color: "#64748b", fontSize: "0.7rem" }}>Product</th>
                        <th style={{ textAlign: "right", padding: "0.75rem 0.5rem", fontWeight: 600, color: "#64748b", fontSize: "0.7rem" }}>Units</th>
                        <th style={{ textAlign: "right", padding: "0.75rem 0.5rem", fontWeight: 600, color: "#64748b", fontSize: "0.7rem" }}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, index) => (
                        <tr key={product.productId || product.name} style={{ borderBottom: index < topProducts.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                          <td style={{ padding: "0.75rem 0.5rem", fontWeight: 600, color: "#64748b" }}>{index + 1}</td>
                          <td style={{ padding: "0.75rem 0.5rem", color: "#374151", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</td>
                          <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "#64748b" }}>{product.unitsSold}</td>
                          <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: 600, color: "#0f172a" }}>{formatINR(product.totalRevenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
