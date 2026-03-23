import { useEffect, useState } from "react";
import {
  Search,
  Download,
  X,
  ShoppingBag,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { ToastContainer, type ToastType } from "../components/ui/Toast";
import { formatINR } from "../lib/utils";
import {
  fetchOrders as fetchOrdersApi,
  updateOrderStatus as updateOrderStatusApi,
  type Order as ApiOrder,
  type OrderStatus as BackendOrderStatus,
} from "../api/orders";

type OrderStatus = "Approved" | "Pending" | "Processing" | "Rejected";

interface Order {
  id: string;
  customer: string;
  customerInitials: string;
  email: string;
  product: string;
  date: string;
  total: number;
  status: OrderStatus;
  address: string;
  items: { name: string; qty: number; price: number }[];
  paymentMethod: string;
}

interface ToastMsg {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

const mapBackendStatusToUi = (status: BackendOrderStatus): OrderStatus => {
  switch (status) {
    case "Completed":
      return "Approved";
    case "Cancelled":
      return "Rejected";
    case "Pending":
      return "Pending";
    case "Processing":
    default:
      return "Processing";
  }
};

const mapUiStatusToBackend = (status: OrderStatus): BackendOrderStatus => {
  switch (status) {
    case "Approved":
      return "Completed";
    case "Rejected":
      return "Cancelled";
    case "Pending":
      return "Pending";
    case "Processing":
    default:
      return "Processing";
  }
};

const mapApiOrderToUi = (order: ApiOrder): Order => {
  const firstName = order.customer?.firstName || "";
  const lastName = order.customer?.lastName || "";
  const customer = lastName
    ? `${firstName} ${lastName[0]}.`
    : firstName || "Customer";
  const customerInitials =
    (firstName?.[0] || "").toUpperCase() + (lastName?.[0] || "").toUpperCase();

  const firstItem = order.items[0];
  const productName = firstItem?.name || "Multiple items";

  return {
    id: order.id,
    customer,
    customerInitials,
    email: order.customer?.email || "",
    product: productName,
    date: new Date(order.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    total: order.totalAmount,
    status: mapBackendStatusToUi(order.status),
    address: `${order.customer?.address || ""}, ${order.customer?.city || ""}${
      order.customer?.state ? `, ${order.customer.state}` : ""
    } ${order.customer?.zipCode || ""}`.trim(),
    items: order.items.map((item) => ({
      name: item.name,
      qty: item.quantity,
      price: item.price,
    })),
    paymentMethod: order.paymentDetails?.provider || "",
  };
};

const statusConfig: Record<
  OrderStatus,
  { bg: string; color: string; label: string }
> = {
  Approved: { bg: "#dcfce7", color: "#15803d", label: "Approved" },
  Pending: { bg: "#fef3c7", color: "#b45309", label: "Pending" },
  Processing: { bg: "#e0e7ff", color: "#4338ca", label: "Processing" },
  Rejected: { bg: "#fee2e2", color: "#b91c1c", label: "Rejected" },
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("Approved");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchOrdersApi({ limit: 20 });
        setOrders(data.orders.map(mapApiOrderToUi));
      } catch (err: any) {
        const msg = err?.response?.data?.message || "Failed to load orders.";
        setError(msg);
        addToast("error", "Unable to load orders", msg);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const handleUpdateStatus = async () => {
    if (selectedOrder) {
      try {
        const backendStatus = mapUiStatusToBackend(newStatus);
        const updated = await updateOrderStatusApi(
          selectedOrder.id,
          backendStatus,
        );
        const mapped = mapApiOrderToUi(updated);
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? mapped : o)),
        );
        setSelectedOrder(mapped);
        addToast(
          "success",
          "Order Updated",
          `Order ${selectedOrder.id} status changed to ${newStatus}`,
        );
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          "Failed to update order status. Please try again.";
        addToast("error", "Update Failed", msg);
      }
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      (o.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.product || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      color: "#4f46e5",
      bg: "#eef2ff",
    },
    {
      label: "Pending",
      value: orders.filter((o) => o.status === "Pending").length,
      icon: Clock,
      color: "#f59e0b",
      bg: "#fffbeb",
    },
    {
      label: "Processing",
      value: orders.filter((o) => o.status === "Processing").length,
      icon: RefreshCw,
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      label: "Approved",
      value: orders.filter((o) => o.status === "Approved").length,
      icon: CheckCircle,
      color: "#22c55e",
      bg: "#f0fdf4",
    },
    {
      label: "Rejected",
      value: orders.filter((o) => o.status === "Rejected").length,
      icon: XCircle,
      color: "#ef4444",
      bg: "#fef2f2",
    },
  ];

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
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .fadeIn { animation: fadeIn 0.3s ease; }
        .slideInRight { animation: slideInRight 0.3s ease; }
        .slideInUp { animation: slideInUp 0.3s ease; }
        .spin { animation: spin 1s linear infinite; }
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
        input:focus, select:focus {
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
          position: "relative",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "clamp(1.75rem, 5vw, 2rem)",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Orders
            </h1>
            <p
              style={{
                color: "#64748b",
                margin: "0.5rem 0 0 0",
                fontSize: "clamp(0.875rem, 2vw, 0.9375rem)",
                fontWeight: 400,
              }}
            >
              Manage and track all customer orders
            </p>
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              whiteSpace: "nowrap",
              flexShrink: 0,
              paddingLeft: "1rem",
              paddingRight: "1rem",
              paddingTop: "0.625rem",
              paddingBottom: "0.625rem",
              background: "#e4e4e7",
              color: "#52525b",
              fontWeight: 500,
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontSize: "0.875rem",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#d4d4d8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#e4e4e7";
            }}
          >
            <Download size={16} />
            Export
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
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                style={{
                  padding: "clamp(1rem, 4vw, 1.5rem)",
                  background: "#ffffff",
                  border: "1px solid #f0f4f8",
                  borderRadius: "10px",
                  transition: "all 0.3s ease",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "#e0e7ff";
                  el.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.08)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "#f0f4f8";
                  el.style.boxShadow = "none";
                }}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <p
                    style={{
                      fontSize: "0.65rem",
                      color: "#94a3b8",
                      margin: 0,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 600,
                    }}
                  >
                    {s.label}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "1rem",
                    justifyContent: "space-between",
                  }}
                >
                  <p
                    style={{
                      fontSize: "clamp(1.5rem, 5vw, 2rem)",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    {s.value}
                  </p>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "8px",
                      background: s.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0.9,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} style={{ color: s.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table Card */}
        <div
          style={{
            overflow: "hidden",
            border: "1px solid #f0f4f8",
            borderRadius: "10px",
            background: "#ffffff",
            transition: "all 0.3s ease",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Filter Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
              borderBottom: "1px solid #f0f4f8",
              padding: "clamp(1rem, 4vw, 1.5rem)",
            }}
          >
            <div
              style={{
                position: "relative",
                flex: 1,
                minWidth: "220px",
                maxWidth: "360px",
              }}
            >
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#cbd5e1",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Search by ID, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "2.5rem",
                  paddingRight: "1rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  background: "#f8fafc",
                  border: "1px solid #e0e7ff",
                  borderRadius: "8px",
                  fontSize: "0.9375rem",
                  boxSizing: "border-box",
                  transition: "all 0.2s ease",
                }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: "auto",
                minWidth: "160px",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                background: "#f8fafc",
                border: "1px solid #e0e7ff",
                borderRadius: "8px",
                fontSize: "0.9375rem",
                boxSizing: "border-box",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <option value="">All Status</option>
              {(
                [
                  "Approved",
                  "Pending",
                  "Processing",
                  "Rejected",
                ] as OrderStatus[]
              ).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                }}
                style={{
                  paddingLeft: "0.75rem",
                  paddingRight: "0.75rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                  background: "transparent",
                  color: "#64748b",
                  border: "1px solid #e0e7ff",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                }}
              >
                Clear
              </button>
            )}
            <p
              style={{
                fontSize: "0.8125rem",
                color: "#94a3b8",
                marginLeft: "auto",
                fontWeight: 500,
                margin: 0,
              }}
            >
              {filtered.length} order{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Table Content */}
          {loading ? (
            <div
              style={{
                padding: "clamp(2rem, 10vw, 4rem)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  border: "4px solid #e5e7eb",
                  borderTop: "4px solid #4f46e5",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <h3
                style={{
                  fontSize: "clamp(0.875rem, 2vw, 1.0625rem)",
                  fontWeight: 600,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Loading orders...
              </h3>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.9375rem" }}>
                Please wait while fetching your orders.
              </p>
            </div>
          ) : error ? (
            <div
              style={{
                padding: "clamp(2rem, 10vw, 4rem)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <XCircle size={48} style={{ color: "#fecaca" }} />
              <h3
                style={{
                  fontSize: "clamp(0.875rem, 2vw, 1.0625rem)",
                  fontWeight: 600,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Unable to load orders
              </h3>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.9375rem" }}>
                {error}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                padding: "clamp(2rem, 10vw, 4rem)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <ShoppingBag size={48} style={{ color: "#e0e7ff" }} />
              <h3
                style={{
                  fontSize: "clamp(0.875rem, 2vw, 1.0625rem)",
                  fontWeight: 600,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                No orders found
              </h3>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.9375rem" }}>
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #f0f4f8",
                      background: "#fafbfc",
                    }}
                  >
                    <th
                      style={{
                        padding: "clamp(0.75rem, 3vw, 1rem) 1.5rem",
                        textAlign: "left",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Order ID
                    </th>
                    <th
                      style={{
                        padding: "clamp(0.75rem, 3vw, 1rem) 1.5rem",
                        textAlign: "left",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Customer
                    </th>
                    <th
                      style={{
                        padding: "clamp(0.75rem, 3vw, 1rem) 1.5rem",
                        textAlign: "left",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Product
                    </th>
                    <th
                      style={{
                        padding: "clamp(0.75rem, 3vw, 1rem) 1.5rem",
                        textAlign: "left",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        padding: "clamp(0.75rem, 3vw, 1rem) 1.5rem",
                        textAlign: "left",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Total
                    </th>
                    <th
                      style={{
                        padding: "clamp(0.75rem, 3vw, 1rem) 1.5rem",
                        textAlign: "left",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "clamp(0.75rem, 3vw, 1rem) 1.5rem",
                        textAlign: "right",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, index) => {
                    const sc = statusConfig[order.status];
                    return (
                      <tr
                        key={order.id}
                        style={{
                          borderBottom: "1px solid #f0f4f8",
                          transition: "background-color 0.2s ease",
                          background: index % 2 === 0 ? "#ffffff" : "#fafbfc",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLElement
                          ).style.backgroundColor = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLElement
                          ).style.backgroundColor =
                            index % 2 === 0 ? "#ffffff" : "#fafbfc";
                        }}
                      >
                        <td
                          style={{
                            padding: "clamp(0.75rem, 3vw, 1rem) 1.5rem",
                            fontSize: "0.8125rem",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              color: "#0f172a",
                              fontFamily: "monospace",
                            }}
                          >
                            #{order.id.slice(-6)}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "clamp(0.75rem, 3vw, 1rem) 1.5rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "7px",
                                background: "#eef2ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: "#4f46e5",
                              }}
                            >
                              {order.customerInitials}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  fontWeight: 600,
                                  color: "#0f172a",
                                  margin: 0,
                                  fontSize: "0.875rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {order.customer}
                              </p>
                              <p
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#94a3b8",
                                  margin: "0.25rem 0 0 0",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {order.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "clamp(0.75rem, 3vw, 1rem) 1.5rem",
                            fontSize: "0.875rem",
                            color: "#64748b",
                          }}
                        >
                          <span
                            style={{
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            }}
                          >
                            {order.product}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "clamp(0.75rem, 3vw, 1rem) 1.5rem",
                            fontSize: "0.9375rem",
                            color: "#64748b",
                            fontWeight: 500,
                          }}
                        >
                          {order.date}
                        </td>
                        <td
                          style={{
                            padding: "clamp(0.75rem, 3vw, 1rem) 1.5rem",
                            fontSize: "0.875rem",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            {formatINR(order.total)}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "clamp(0.75rem, 3vw, 1rem) 1.5rem",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "0.375rem 0.75rem",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              background: sc.bg,
                              color: sc.color,
                              letterSpacing: "0.02em",
                            }}
                          >
                            {sc.label}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "clamp(0.75rem, 3vw, 1rem) 1.5rem",
                            textAlign: "right",
                          }}
                        >
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(order.status);
                            }}
                            style={{
                              paddingLeft: "0.75rem",
                              paddingRight: "0.75rem",
                              paddingTop: "0.5rem",
                              paddingBottom: "0.5rem",
                              background: "transparent",
                              color: "#64748b",
                              border: "none",
                              borderRadius: "0.5rem",
                              cursor: "pointer",
                              gap: "0.25rem",
                              fontSize: "0.8125rem",
                              fontWeight: 500,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor = "#f1f5f9";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.backgroundColor = "transparent";
                            }}
                          >
                            View
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Side Panel - Fully Responsive */}
      {selectedOrder && (
        <>
          {/* Panel overlay */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.3)",
              zIndex: 998,
              backdropFilter: "blur(4px)",
              animation: "fadeIn 0.3s ease",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onClick={() => setSelectedOrder(null)}
          />
          <div
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              width: "100%",
              maxWidth: "480px",
              zIndex: 999,
              background: "#ffffff",
              borderLeft: "1px solid #f0f4f8",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              animation: "slideInRight 0.3s ease",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "clamp(1rem, 4vw, 1.75rem)",
                borderBottom: "1px solid #f0f4f8",
                background: "#ffffff",
                zIndex: 10,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "clamp(1rem, 3vw, 1.125rem)",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Order Details
                </h3>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "#94a3b8",
                    margin: "0.5rem 0 0 0",
                    fontFamily: "monospace",
                    fontWeight: 500,
                  }}
                >
                  #{selectedOrder.id.slice(-6)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "0.5rem",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  width: 32,
                  height: 32,
                  minWidth: 32,
                  minHeight: 32,
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "#f1f5f9";
                  (e.currentTarget as HTMLElement).style.color = "#374151";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(1rem, 4vw, 1.75rem)",
                  padding: "clamp(1rem, 4vw, 1.75rem)",
                }}
              >
                {/* Status Badge */}
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      background: statusConfig[selectedOrder.status].bg,
                      color: statusConfig[selectedOrder.status].color,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Customer Info */}
                <div
                  style={{
                    paddingBottom: "clamp(1rem, 3vw, 1.25rem)",
                    borderBottom: "1px solid #f0f4f8",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      margin: "0 0 1rem 0",
                    }}
                  >
                    Customer
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "8px",
                        background: "#eef2ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: "#4f46e5",
                        flexShrink: 0,
                      }}
                    >
                      {selectedOrder.customerInitials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontWeight: 700,
                          color: "#0f172a",
                          margin: 0,
                          fontSize: "0.9375rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {selectedOrder.customer}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "#64748b",
                          margin: "0.375rem 0 0 0",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {selectedOrder.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items Ordered */}
                <div
                  style={{
                    paddingBottom: "clamp(1rem, 3vw, 1.25rem)",
                    borderBottom: "1px solid #f0f4f8",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      margin: "0 0 1rem 0",
                    }}
                  >
                    Items ({selectedOrder.items.length})
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {selectedOrder.items.map((item, i) => (
                      <div
                        key={i}
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
                              fontSize: "0.9375rem",
                              fontWeight: 500,
                              color: "#0f172a",
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.name}
                          </p>
                          <p
                            style={{
                              fontSize: "0.8125rem",
                              color: "#94a3b8",
                              margin: "0.375rem 0 0 0",
                            }}
                          >
                            {item.qty} {item.qty === 1 ? "unit" : "units"} @{" "}
                            {formatINR(item.price)}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: "0.9375rem",
                            fontWeight: 700,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {formatINR(item.qty * item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div
                  style={{
                    paddingBottom: "clamp(1rem, 3vw, 1.25rem)",
                    borderBottom: "1px solid #f0f4f8",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      margin: "0 0 1rem 0",
                    }}
                  >
                    Order Summary
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.9375rem",
                          color: "#64748b",
                        }}
                      >
                        Subtotal
                      </span>
                      <span
                        style={{
                          fontSize: "0.9375rem",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        {formatINR(selectedOrder.total)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.9375rem",
                          color: "#64748b",
                        }}
                      >
                        Shipping & Tax
                      </span>
                      <span
                        style={{
                          fontSize: "0.9375rem",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        {formatINR(
                          9.99 + Math.round(selectedOrder.total * 0.08),
                        )}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingTop: "0.75rem",
                        borderTop: "1px solid #f0f4f8",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        Total
                      </span>
                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#4f46e5",
                        }}
                      >
                        {formatINR(
                          selectedOrder.total +
                            9.99 +
                            Math.round(selectedOrder.total * 0.08),
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div
                  style={{
                    paddingBottom: "clamp(1rem, 3vw, 1.25rem)",
                    borderBottom: "1px solid #f0f4f8",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      margin: "0 0 1rem 0",
                    }}
                  >
                    Shipping Address
                  </p>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "#374151",
                      margin: 0,
                      lineHeight: 1.6,
                      wordBreak: "break-word",
                    }}
                  >
                    {selectedOrder.address}
                  </p>
                </div>

                {/* Update Status */}
                <div>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      margin: "0 0 1rem 0",
                    }}
                  >
                    Update Status
                  </p>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as OrderStatus)
                    }
                    style={{
                      width: "100%",
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      paddingTop: "0.625rem",
                      paddingBottom: "0.625rem",
                      background: "#f8fafc",
                      border: "1px solid #e0e7ff",
                      borderRadius: "8px",
                      fontSize: "0.9375rem",
                      boxSizing: "border-box",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {(
                      [
                        "Approved",
                        "Pending",
                        "Processing",
                        "Rejected",
                      ] as OrderStatus[]
                    ).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                padding: "clamp(1rem, 4vw, 1.75rem)",
                borderTop: "1px solid #f0f4f8",
                background: "#fafbfc",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  flex: 1,
                  minWidth: "120px",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  background: "#e4e4e7",
                  color: "#52525b",
                  fontWeight: 500,
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontSize: "0.875rem",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#d4d4d8";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#e4e4e7";
                }}
              >
                Close
              </button>
              <button
                onClick={handleUpdateStatus}
                style={{
                  flex: 1,
                  minWidth: "120px",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  background: "#4f46e5",
                  color: "#ffffff",
                  fontWeight: 500,
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontSize: "0.875rem",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#4338ca";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#4f46e5";
                }}
              >
                Update Status
              </button>
            </div>
          </div>
        </>
      )}

      <ToastContainer
        toasts={toasts}
        onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
