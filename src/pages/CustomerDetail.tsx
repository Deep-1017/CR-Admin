import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star, UserCheck, UserX } from "lucide-react";
import { isAxiosError } from "axios";
import Modal from "../components/ui/Modal";
import { ToastContainer, type ToastType } from "../components/ui/Toast";
import { formatINR } from "../lib/utils";
import {
  fetchCustomerById,
  toggleCustomerBan,
  type Customer,
} from "../api/customers";
import type { Order } from "../api/orders";
import type { Review } from "../api/reviews";

interface ToastMsg {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "N/A";

export default function CustomerDetail() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 4000);
  };

  useEffect(() => {
    const loadCustomer = async () => {
      if (!customerId) return;
      setLoading(true);
      try {
        const data = await fetchCustomerById(customerId);
        setCustomer(data.user);
        setOrders(data.orders);
        setReviews(data.reviews);
      } catch (err: unknown) {
        const message = isAxiosError(err)
          ? err.response?.data?.message || "Failed to load customer."
          : "Failed to load customer.";
        addToast("error", "Unable to load customer", message);
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const confirmToggleBan = async () => {
    if (!customer) return;

    setIsSubmitting(true);
    try {
      const updated = await toggleCustomerBan(customer.id);
      setCustomer((prev) => (prev ? { ...prev, isBanned: updated.isBanned } : prev));
      addToast("success", updated.isBanned ? "Customer banned" : "Customer unbanned");
      setConfirmOpen(false);
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? err.response?.data?.message || "Failed to update customer."
        : "Failed to update customer.";
      addToast("error", "Action failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "3rem", color: "#64748b" }}>Loading customer...</div>;
  }

  if (!customer) {
    return (
      <div style={{ padding: "3rem" }}>
        <Link to="/customers" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 700 }}>Back to customers</Link>
        <p style={{ color: "#64748b" }}>Customer not found.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <Link to="/customers" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#475569", textDecoration: "none", fontWeight: 700 }}>
          <ArrowLeft size={16} />
          Customers
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", padding: "1.25rem", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8 }}>
          <div>
            <h1 style={{ color: "#0f172a", fontSize: "2rem", fontWeight: 800, margin: 0 }}>{customer.name}</h1>
            <p style={{ color: "#64748b", margin: "0.375rem 0 0" }}>{customer.email}</p>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            style={{ alignSelf: "center", display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.875rem", border: "none", borderRadius: 6, color: "#ffffff", background: customer.isBanned ? "#16a34a" : "#dc2626", cursor: "pointer", fontWeight: 800 }}
          >
            {customer.isBanned ? <UserCheck size={16} /> : <UserX size={16} />}
            {customer.isBanned ? "Unban" : "Ban"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {[
            ["Status", customer.isBanned ? "Suspended" : "Active"],
            ["Phone", customer.phone || "N/A"],
            ["Joined", formatDate(customer.createdAt)],
            ["Orders", String(customer.ordersCount)],
            ["Provider", customer.provider],
            ["Email Verified", customer.isEmailVerified ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: "1rem", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8 }}>
              <p style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", margin: 0 }}>{label}</p>
              <p style={{ color: "#0f172a", fontWeight: 800, margin: "0.375rem 0 0" }}>{value}</p>
            </div>
          ))}
        </div>

        <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0" }}>
            <h2 style={{ color: "#0f172a", fontSize: "1.125rem", fontWeight: 800, margin: 0 }}>Last 10 Orders</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Order", "Date", "Items", "Payment", "Status", "Total"].map((heading) => (
                    <th key={heading} style={{ padding: "0.875rem 1rem", textAlign: "left", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "2rem", color: "#64748b", textAlign: "center" }}>No orders yet.</td></tr>
                ) : (
                  orders.map((order: any) => (
                    <tr key={order.id || order._id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem", fontWeight: 800, color: "#0f172a" }}>#{String(order.id || order._id).slice(-6).toUpperCase()}</td>
                      <td style={{ padding: "1rem", color: "#475569" }}>{formatDate(order.createdAt)}</td>
                      <td style={{ padding: "1rem", color: "#475569" }}>{order.items?.length || 0}</td>
                      <td style={{ padding: "1rem", color: "#475569" }}>{order.paymentDetails?.status || order.paymentStatus || "N/A"}</td>
                      <td style={{ padding: "1rem", color: "#475569" }}>{order.status}</td>
                      <td style={{ padding: "1rem", fontWeight: 800, color: "#0f172a" }}>{formatINR(order.totalAmount || 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0" }}>
            <h2 style={{ color: "#0f172a", fontSize: "1.125rem", fontWeight: 800, margin: 0 }}>Submitted Reviews</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {reviews.length === 0 ? (
              <p style={{ padding: "2rem", color: "#64748b", textAlign: "center", margin: 0 }}>No reviews submitted.</p>
            ) : (
              reviews.map((review: any) => (
                <article key={review._id} style={{ padding: "1rem", borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                      <h3 style={{ color: "#0f172a", fontSize: "1rem", fontWeight: 800, margin: 0 }}>{review.title}</h3>
                      <p style={{ color: "#64748b", margin: "0.25rem 0 0", fontSize: "0.875rem" }}>{review.productId?.name || "Unknown product"} · {formatDate(review.createdAt)}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} size={15} fill={index < review.rating ? "#eab308" : "none"} color={index < review.rating ? "#eab308" : "#cbd5e1"} />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: "#334155", lineHeight: 1.6, margin: "0.75rem 0 0" }}>{review.comment}</p>
                  <span style={{ display: "inline-flex", marginTop: "0.75rem", padding: "0.25rem 0.625rem", borderRadius: 999, background: "#f1f5f9", color: "#475569", fontSize: "0.75rem", fontWeight: 800 }}>
                    {review.status}
                  </span>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={customer.isBanned ? "Unban Customer" : "Ban Customer"}
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
              Cancel
            </button>
            <button onClick={confirmToggleBan} disabled={isSubmitting} className={`px-4 py-2 text-sm font-medium text-white rounded disabled:opacity-50 ${customer.isBanned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
              {isSubmitting ? "Saving..." : customer.isBanned ? "Confirm Unban" : "Confirm Ban"}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          {customer.isBanned
            ? `Restore sign-in access for ${customer.name}?`
            : `Suspend sign-in access for ${customer.name}?`}
        </p>
      </Modal>

      <ToastContainer toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />
    </div>
  );
}
