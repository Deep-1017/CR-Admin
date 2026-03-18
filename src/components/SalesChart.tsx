import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatINR } from "../lib/utils";

const data = [
  { month: "Jan", revenue: 18500 },
  { month: "Feb", revenue: 22000 },
  { month: "Mar", revenue: 19800 },
  { month: "Apr", revenue: 27000 },
  { month: "May", revenue: 31500 },
  { month: "Jun", revenue: 24000 },
  { month: "Jul", revenue: 29000 },
  { month: "Aug", revenue: 35078 },
];

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
          margin: "0 0 0.25rem",
          fontSize: "0.875rem",
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: "0.875rem", color: "#4f46e5", margin: 0 }}>
        Revenue: <strong>{formatINR(payload[0].value)}</strong>
      </p>
    </div>
  );
};

export default function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f1f5f9"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{
            fontSize: 12,
            fill: "#94a3b8",
            fontFamily: "Inter, sans-serif",
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{
            fontSize: 12,
            fill: "#94a3b8",
            fontFamily: "Inter, sans-serif",
          }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatINR(v)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#4f46e5"
          strokeWidth={2.5}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 5, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
