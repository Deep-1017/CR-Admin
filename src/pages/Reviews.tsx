import { useEffect, useState } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  RefreshCw,
  MessageSquare
} from "lucide-react";
import { isAxiosError } from "axios";
import { ToastContainer, type ToastType } from "../components/ui/Toast";
import {
  fetchAdminReviews,
  approveReview,
  rejectReview,
  deleteReview,
  type Review,
} from "../api/reviews";
import Modal from "../components/ui/Modal";

interface ToastMsg {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

const statusConfig: Record<
  "pending" | "approved" | "rejected",
  { bg: string; color: string; label: string }
> = {
  approved: { bg: "#dcfce7", color: "#15803d", label: "Approved" },
  pending: { bg: "#fef3c7", color: "#b45309", label: "Pending" },
  rejected: { bg: "#fee2e2", color: "#b91c1c", label: "Rejected" },
};

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminReviews({ limit: 50 });
      setReviews(data.reviews);
    } catch (err: unknown) {
      const msg = isAxiosError(err) ? err.response?.data?.message || "Failed to load reviews." : "Failed to load reviews.";
      addToast("error", "Unable to load reviews", msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const handleApprove = async (id: string) => {
    try {
      await approveReview(id);
      addToast("success", "Review Approved", "The review is now visible to customers.");
      setReviews(prev => prev.map(r => r._id === id ? { ...r, status: "approved" } : r));
    } catch (err: unknown) {
      addToast("error", "Action Failed", isAxiosError(err) ? err.response?.data?.message || "Failed to approve review." : "Failed to approve review.");
    }
  };

  const handleRejectClick = (id: string) => {
    setSelectedReviewId(id);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedReviewId || !rejectionReason.trim()) return;
    try {
      await rejectReview(selectedReviewId, rejectionReason);
      addToast("success", "Review Rejected", "The review has been rejected.");
      setReviews(prev => prev.map(r => r._id === selectedReviewId ? { ...r, status: "rejected", rejectionReason } : r));
      setRejectModalOpen(false);
    } catch (err: unknown) {
      addToast("error", "Action Failed", isAxiosError(err) ? err.response?.data?.message || "Failed to reject review." : "Failed to reject review.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely delete this review?")) return;
    try {
      await deleteReview(id);
      addToast("success", "Review Deleted", "The review has been permanently deleted.");
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (err: unknown) {
      addToast("error", "Action Failed", isAxiosError(err) ? err.response?.data?.message || "Failed to delete review." : "Failed to delete review.");
    }
  };

  const filtered = reviews.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.userId?.name || "Unknown User").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.productId?.name || "Unknown Product").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = [
    {
      label: "Total Reviews",
      value: reviews.length,
      icon: MessageSquare,
      color: "#4f46e5",
      bg: "#eef2ff",
    },
    {
      label: "Pending",
      value: reviews.filter((r) => r.status === "pending").length,
      icon: Clock,
      color: "#f59e0b",
      bg: "#fffbeb",
    },
    {
      label: "Approved",
      value: reviews.filter((r) => r.status === "approved").length,
      icon: CheckCircle,
      color: "#22c55e",
      bg: "#f0fdf4",
    },
    {
      label: "Rejected",
      value: reviews.filter((r) => r.status === "rejected").length,
      icon: XCircle,
      color: "#ef4444",
      bg: "#fef2f2",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f8fafc, #ffffff, #f8fafc)",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.75rem, 5vw, 2rem)", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
              Reviews Moderation
            </h1>
            <p style={{ color: "#64748b", margin: "0.5rem 0 0 0", fontSize: "0.9375rem" }}>
              Review and moderate customer product feedback
            </p>
          </div>
          <button
            onClick={loadReviews}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1rem",
              background: "#e4e4e7",
              color: "#52525b",
              fontWeight: 500,
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontSize: "0.875rem",
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                style={{
                  padding: "1.5rem",
                  background: "#ffffff",
                  border: "1px solid #f0f4f8",
                  borderRadius: "10px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <p style={{ fontSize: "0.65rem", color: "#94a3b8", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    {s.label}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", justifyContent: "space-between" }}>
                  <p style={{ fontSize: "2rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>{s.value}</p>
                  <div style={{ width: 44, height: 44, borderRadius: "8px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} style={{ color: s.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters & Table Card */}
        <div style={{ overflow: "hidden", border: "1px solid #f0f4f8", borderRadius: "10px", background: "#ffffff", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid #f0f4f8", padding: "1.5rem" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "220px", maxWidth: "360px" }}>
              <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#cbd5e1", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "0.625rem 1rem 0.625rem 2.5rem", background: "#f8fafc", border: "1px solid #e0e7ff", borderRadius: "8px", fontSize: "0.9375rem" }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "0.625rem 1rem", background: "#f8fafc", border: "1px solid #e0e7ff", borderRadius: "8px", fontSize: "0.9375rem", cursor: "pointer" }}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f0f4f8", background: "#fafbfc" }}>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>User & Product</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Rating</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Review Content</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "right", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((review) => {
                  const statusInfo = statusConfig[review.status];
                  return (
                    <tr key={review._id} style={{ borderBottom: "1px solid #f0f4f8" }}>
                      <td style={{ padding: "1.25rem 1.5rem" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{review.userId?.name || "Unknown User"}</div>
                        <div style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem" }}>{review.productId?.name || "Unknown Product"}</div>
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? "#eab308" : "none"} color={i < review.rating ? "#eab308" : "#cbd5e1"} />
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem", maxWidth: "300px" }}>
                        <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{review.title}</div>
                        <div style={{ color: "#64748b", fontSize: "0.8125rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {review.comment}
                        </div>
                        {review.status === "rejected" && review.rejectionReason && (
                          <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#b91c1c", background: "#fef2f2", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                            <strong>Reason:</strong> {review.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem" }}>
                        <span style={{ background: statusInfo.bg, color: statusInfo.color, padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600 }}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          {review.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(review._id)}
                                style={{ padding: "0.375rem 0.75rem", background: "#16a34a", color: "white", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, border: "none", cursor: "pointer" }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectClick(review._id)}
                                style={{ padding: "0.375rem 0.75rem", background: "#dc2626", color: "white", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, border: "none", cursor: "pointer" }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(review._id)}
                            style={{ padding: "0.375rem 0.75rem", background: "transparent", color: "#94a3b8", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} style={{ padding: "4rem 2rem", textAlign: "center", color: "#94a3b8" }}>
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Review"
        footer={
          <>
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmReject}
              disabled={!rejectionReason.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
            >
              Confirm Rejection
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please provide a reason for rejecting this review. This helps maintain moderation standards.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Contains inappropriate language"
            />
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}
