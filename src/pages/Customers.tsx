import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Eye, Search, UserCheck, UserX, Users } from "lucide-react";
import { isAxiosError } from "axios";
import Modal from "../components/ui/Modal";
import { ToastContainer, type ToastType } from "../components/ui/Toast";
import {
  fetchCustomers,
  toggleCustomerBan,
  type Customer,
} from "../api/customers";

interface ToastMsg {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const limit = 10;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers({
        page,
        limit,
        search: debouncedSearch || undefined,
      });
      setCustomers(data.users);
      setTotal(data.total);
      setPages(Math.max(1, data.pages));
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? err.response?.data?.message || "Failed to load customers."
        : "Failed to load customers.";
      addToast("error", "Unable to load customers", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const bannedCount = useMemo(
    () => customers.filter((customer) => customer.isBanned).length,
    [customers],
  );

  const confirmToggleBan = async () => {
    if (!selectedCustomer) return;

    setIsSubmitting(true);
    try {
      const updated = await toggleCustomerBan(selectedCustomer.id);
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === selectedCustomer.id
            ? { ...customer, isBanned: updated.isBanned }
            : customer,
        ),
      );
      addToast(
        "success",
        updated.isBanned ? "Customer banned" : "Customer unbanned",
        `${selectedCustomer.name} has been ${updated.isBanned ? "suspended" : "restored"}.`,
      );
      setSelectedCustomer(null);
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? err.response?.data?.message || "Failed to update customer."
        : "Failed to update customer.";
      addToast("error", "Action failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Customers</h1>
            <p style={{ color: "#64748b", margin: "0.5rem 0 0" }}>View customer profiles, order activity, and account status</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ minWidth: 160, padding: "1rem", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8 }}>
              <p style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 700, margin: 0, textTransform: "uppercase" }}>Total</p>
              <p style={{ color: "#0f172a", fontSize: "1.5rem", fontWeight: 800, margin: "0.25rem 0 0" }}>{total}</p>
            </div>
            <div style={{ minWidth: 160, padding: "1rem", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8 }}>
              <p style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 700, margin: 0, textTransform: "uppercase" }}>Suspended</p>
              <p style={{ color: "#b91c1c", fontSize: "1.5rem", fontWeight: 800, margin: "0.25rem 0 0" }}>{bannedCount}</p>
            </div>
          </div>
        </div>

        <div style={{ overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: 8, background: "#ffffff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 240, maxWidth: 420 }}>
              <Search size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name or email"
                style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 1rem 0.625rem 2.5rem", border: "1px solid #cbd5e1", borderRadius: 8, background: "#f8fafc", fontSize: "0.9375rem" }}
              />
            </div>
            <span style={{ color: "#64748b", fontSize: "0.875rem", marginLeft: "auto" }}>
              Page {page} of {pages}
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["Name", "Email", "Joined Date", "Orders", "Status", "Actions"].map((heading) => (
                    <th key={heading} style={{ padding: "0.875rem 1rem", textAlign: heading === "Actions" ? "right" : "left", color: "#64748b", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Loading customers...</td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                      <Users size={28} style={{ margin: "0 auto 0.75rem" }} />
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: 38, height: 38, borderRadius: 8, background: "#eef2ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                            {getInitials(customer.name)}
                          </div>
                          <span style={{ fontWeight: 700, color: "#0f172a" }}>{customer.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "1rem", color: "#475569" }}>{customer.email}</td>
                      <td style={{ padding: "1rem", color: "#475569" }}>{formatDate(customer.createdAt)}</td>
                      <td style={{ padding: "1rem", color: "#0f172a", fontWeight: 700 }}>{customer.ordersCount}</td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ padding: "0.25rem 0.625rem", borderRadius: 999, fontSize: "0.75rem", fontWeight: 700, background: customer.isBanned ? "#fee2e2" : "#dcfce7", color: customer.isBanned ? "#b91c1c" : "#15803d" }}>
                          {customer.isBanned ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                          <Link to={`/customers/${customer.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: 6, color: "#334155", textDecoration: "none", fontSize: "0.8125rem", fontWeight: 700 }}>
                            <Eye size={14} />
                            View
                          </Link>
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.75rem", border: "none", borderRadius: 6, color: "#ffffff", background: customer.isBanned ? "#16a34a" : "#dc2626", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700 }}
                          >
                            {customer.isBanned ? <UserCheck size={14} /> : <UserX size={14} />}
                            {customer.isBanned ? "Unban" : "Ban"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "1rem", borderTop: "1px solid #e2e8f0", flexWrap: "wrap" }}>
            <span style={{ color: "#64748b", fontSize: "0.875rem" }}>{total} customer{total === 1 ? "" : "s"}</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || loading} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: 6, background: "#ffffff", color: "#334155", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.55 : 1 }}>
                <ChevronLeft size={16} />
                Previous
              </button>
              <button onClick={() => setPage((value) => Math.min(pages, value + 1))} disabled={page >= pages || loading} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: 6, background: "#ffffff", color: "#334155", cursor: page >= pages ? "not-allowed" : "pointer", opacity: page >= pages ? 0.55 : 1 }}>
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.isBanned ? "Unban Customer" : "Ban Customer"}
        footer={
          <>
            <button onClick={() => setSelectedCustomer(null)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
              Cancel
            </button>
            <button onClick={confirmToggleBan} disabled={isSubmitting} className={`px-4 py-2 text-sm font-medium text-white rounded disabled:opacity-50 ${selectedCustomer?.isBanned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
              {isSubmitting ? "Saving..." : selectedCustomer?.isBanned ? "Confirm Unban" : "Confirm Ban"}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          {selectedCustomer?.isBanned
            ? `Restore sign-in access for ${selectedCustomer.name}?`
            : `Suspend sign-in access for ${selectedCustomer?.name}?`}
        </p>
      </Modal>

      <ToastContainer toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />
    </div>
  );
}
