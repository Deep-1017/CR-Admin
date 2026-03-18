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
  const customer = lastName ? `${firstName} ${lastName[0]}.` : firstName || "Customer";
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
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        position: "relative",
      }}
    >
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
            Orders
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "0.9375rem" }}>
            Track and manage customer orders
          </p>
        </div>
        <button className="btn btn-secondary" style={{ gap: "0.5rem" }}>
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "0.75rem",
        }}
      >
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="card"
              style={{
                padding: "1.375rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={16} style={{ color: s.color }} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.6875rem",
                    color: "#94a3b8",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  {s.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="card" style={{ overflow: "hidden" }}>
        {/* Filter Bar */}
        <div
          className="card-header"
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: 1,
              minWidth: 200,
              maxWidth: 340,
            }}
          >
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              type="text"
              className="input"
              placeholder="Search by order ID, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: "2.25rem", height: 38 }}
            />
          </div>
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "auto", minWidth: 150, height: 38 }}
          >
            <option value="">All Status</option>
            {(
              ["Approved", "Pending", "Processing", "Rejected"] as OrderStatus[]
            ).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {(searchTerm || statusFilter) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
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
            }}
          >
            {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="empty-state">
            <ShoppingBag size={40} style={{ color: "#cbd5e1" }} />
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Loading orders...
            </h3>
            <p style={{ color: "#94a3b8", margin: 0 }}>
              Please wait while we fetch recent activity.
            </p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <XCircle size={40} style={{ color: "#ef4444" }} />
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Unable to load orders
            </h3>
            <p style={{ color: "#94a3b8", margin: 0 }}>
              {error} Try refreshing the page.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={40} style={{ color: "#cbd5e1" }} />
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              No orders found
            </h3>
            <p style={{ color: "#94a3b8", margin: 0 }}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const sc = statusConfig[order.status];
                  return (
                    <tr key={order.id}>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: "#0f172a",
                            fontFamily: "monospace",
                            fontSize: "0.8125rem",
                          }}
                        >
                          {order.id}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.625rem",
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "#eef2ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.6875rem",
                                fontWeight: 700,
                                color: "#4f46e5",
                              }}
                            >
                              {order.customerInitials}
                            </span>
                          </div>
                          <div>
                            <p
                              style={{
                                fontWeight: 600,
                                color: "#0f172a",
                                margin: 0,
                                fontSize: "0.875rem",
                              }}
                            >
                              {order.customer}
                            </p>
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "#94a3b8",
                                margin: 0,
                              }}
                            >
                              {order.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            color: "#64748b",
                            fontSize: "0.875rem",
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                          }}
                        >
                          {order.product}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{ color: "#64748b", fontSize: "0.875rem" }}
                        >
                          {order.date}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: "#0f172a" }}>
                          {formatINR(order.total)}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.25rem 0.625rem",
                            borderRadius: 99,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            background: sc.bg,
                            color: sc.color,
                          }}
                        >
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.status);
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ gap: "0.25rem", fontSize: "0.8125rem" }}
                        >
                          View <ChevronRight size={14} />
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

      {/* Order Detail Side Panel */}
      {selectedOrder && (
        <>
          {/* Panel overlay */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.2)",
              zIndex: 998,
            }}
            onClick={() => setSelectedOrder(null)}
          />
          <div className="side-panel">
            <div className="side-panel-header">
              <div>
                <h3
                  style={{
                    fontSize: "1rem",
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
                    color: "#64748b",
                    margin: "0.125rem 0 0",
                    fontFamily: "monospace",
                  }}
                >
                  {selectedOrder.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "0.375rem",
                  borderRadius: 6,
                  display: "flex",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
                  (e.currentTarget as HTMLElement).style.color = "#374151";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "none";
                  (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="side-panel-body"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Status Badge */}
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.375rem 0.875rem",
                    borderRadius: 99,
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    background: statusConfig[selectedOrder.status].bg,
                    color: statusConfig[selectedOrder.status].color,
                  }}
                >
                  {selectedOrder.status}
                </span>
              </div>

              {/* Customer Info */}
              <div>
                <p
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: "0.625rem",
                  }}
                >
                  Customer Information
                </p>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 10,
                    padding: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#eef2ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: "#4f46e5",
                        }}
                      >
                        {selectedOrder.customerInitials}
                      </span>
                    </div>
                    <div>
                      <p
                        style={{
                          fontWeight: 700,
                          color: "#0f172a",
                          margin: 0,
                          fontSize: "0.9375rem",
                        }}
                      >
                        {selectedOrder.customer}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "#64748b",
                          margin: 0,
                        }}
                      >
                        {selectedOrder.email}
                      </p>
                    </div>
                  </div>
                  <div className="divider" style={{ margin: "0.75rem 0" }} />
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Shipping Address
                  </p>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#374151",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {selectedOrder.address}
                  </p>
                  <div className="divider" style={{ margin: "0.75rem 0" }} />
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Payment Method
                  </p>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#374151",
                      margin: 0,
                    }}
                  >
                    {selectedOrder.paymentMethod}
                  </p>
                </div>
              </div>

              {/* Items Ordered */}
              <div>
                <p
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: "0.625rem",
                  }}
                >
                  Items Ordered
                </p>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "0.875rem 1rem",
                        borderBottom:
                          i < selectedOrder.items.length - 1
                            ? "1px solid #e2e8f0"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "#0f172a",
                              margin: 0,
                            }}
                          >
                            {item.name}
                          </p>
                          <p
                            style={{
                              fontSize: "0.8125rem",
                              color: "#94a3b8",
                              margin: "0.125rem 0 0",
                            }}
                          >
                            Qty: {item.qty} × {formatINR(item.price)}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          {formatINR(item.qty * item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total Breakdown */}
              <div>
                <p
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: "0.625rem",
                  }}
                >
                  Order Total
                </p>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 10,
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.625rem",
                  }}
                >
                  {[
                    { label: "Subtotal", value: selectedOrder.total },
                    { label: "Shipping", value: 9.99 },
                    {
                      label: "Tax (8%)",
                      value: Math.round(selectedOrder.total * 0.08),
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
                        {row.label}
                      </span>
                      <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                        {formatINR(row.value)}
                      </span>
                    </div>
                  ))}
                  <div className="divider" style={{ margin: "0.25rem 0" }} />
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      Total
                    </span>
                    <span
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 800,
                        color: "#4f46e5",
                      }}
                    >
                      {formatINR(
                        selectedOrder.total +
                          9.99 +
                          Math.round(selectedOrder.total * 0.08)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div>
                <p
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: "0.625rem",
                  }}
                >
                  Update Status
                </p>
                <select
                  className="select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
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

            <div
              className="side-panel-footer"
              style={{ display: "flex", gap: "0.75rem" }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedOrder(null)}
                style={{ flex: 1 }}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpdateStatus}
                style={{ flex: 1 }}
              >
                Update Order
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