import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, Package } from "lucide-react";
import {
  fetchProductById,
  type Product as ApiProduct,
} from "../api/products";
import { ToastContainer, type ToastType } from "../components/ui/Toast";

interface ToastMsg {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError("Product ID not provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductById(productId);
        setProduct(data);
      } catch (err: any) {
        const message =
          err?.response?.data?.message || "Failed to load product.";
        setError(message);
        addToast("error", "Error", message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom right, #f8fafc, #ffffff)",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "50%",
              border: "3px solid #e5e7eb",
              borderTopColor: "#2563eb",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "#6b7280" }}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom right, #f8fafc, #ffffff)",
          padding: "1rem",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "600px",
          }}
        >
          <h2 style={{ color: "#dc2626", marginBottom: "1rem" }}>
            {error || "Product not found"}
          </h2>
          <button
            onClick={() => navigate("/products")}
            style={{
              padding: "0.625rem 1.5rem",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: 500,
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#1d4ed8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#2563eb";
            }}
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
      ? [product.image] 
      : [];
  const currentImage = images[selectedImageIndex] || null;

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f8fafc, #ffffff, #f8fafc)",
        padding: "1.5rem",
      }}
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          animation: "slideIn 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <button
            onClick={() => navigate("/products")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1rem",
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              cursor: "pointer",
              color: "#6b7280",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "white";
            }}
          >
            <ChevronLeft size={18} />
            Back to Products
          </button>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
            }}
          >
            {product.name}
          </h1>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          {/* Image Section */}
          <div>
            <div
              style={{
                background: "white",
                borderRadius: "1rem",
                overflow: "hidden",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Main Image */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: "100%",
                  background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
                onClick={() => setShowModal(true)}
              >
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={product.name}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Package size={64} color="rgba(37, 99, 235, 0.2)" />
                  </div>
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      style={{
                        position: "absolute",
                        left: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "rgba(255, 255, 255, 0.8)",
                        border: "none",
                        borderRadius: "50%",
                        width: "2.5rem",
                        height: "2.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "rgba(255, 255, 255, 0.95)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "rgba(255, 255, 255, 0.8)";
                      }}
                    >
                      <ChevronLeft size={20} color="#111827" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      style={{
                        position: "absolute",
                        right: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "rgba(255, 255, 255, 0.8)",
                        border: "none",
                        borderRadius: "50%",
                        width: "2.5rem",
                        height: "2.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "rgba(255, 255, 255, 0.95)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "rgba(255, 255, 255, 0.8)";
                      }}
                    >
                      <ChevronRight size={20} color="#111827" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "1rem",
                      left: "1rem",
                      background: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    padding: "1rem",
                    background: "#f9fafb",
                    overflowX: "auto",
                  }}
                >
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      style={{
                        width: "4rem",
                        height: "4rem",
                        borderRadius: "0.5rem",
                        border:
                          idx === selectedImageIndex
                            ? "2px solid #2563eb"
                            : "2px solid #e5e7eb",
                        padding: 0,
                        cursor: "pointer",
                        overflow: "hidden",
                        flexShrink: 0,
                        transition: "all 0.2s ease",
                        background: "white",
                      }}
                      onMouseEnter={(e) => {
                        if (idx !== selectedImageIndex) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor =
                            "#bfdbfe";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (idx !== selectedImageIndex) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor =
                            "#e5e7eb";
                        }
                      }}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div>
            <div
              style={{
                background: "white",
                borderRadius: "1rem",
                padding: "2rem",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Price */}
              <div style={{ marginBottom: "2rem" }}>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    margin: "0 0 0.5rem",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  Price
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                  <p
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                  {product.originalPrice && (
                    <p
                      style={{
                        fontSize: "1rem",
                        color: "#9ca3af",
                        margin: 0,
                        textDecoration: "line-through",
                      }}
                    >
                      ₹{product.originalPrice.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      margin: "0 0 0.5rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Category
                  </p>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "#111827",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {product.category}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      margin: "0 0 0.5rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Brand
                  </p>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "#111827",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {product.brand}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      margin: "0 0 0.5rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Stock
                  </p>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: product.inStock ? "#16a34a" : "#dc2626",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {product.inStock ? `${product.stockCount} in stock` : "Out of stock"}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      margin: "0 0 0.5rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Images
                  </p>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "#111827",
                      margin: 0,
                      fontWeight: 500,
                    }}
                  >
                    {images.length} image{images.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div style={{ marginBottom: "2rem" }}>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      margin: "0 0 0.5rem",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    Description
                  </p>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      color: "#374151",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showModal && currentImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setShowModal(false)}
        >
          <button
            onClick={() => setShowModal(false)}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "white",
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s ease",
              zIndex: 51,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255, 255, 255, 0.1)";
            }}
          >
            <X size={24} />
          </button>

          <img
            src={currentImage}
            alt={product.name}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                style={{
                  position: "absolute",
                  left: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  color: "white",
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255, 255, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255, 255, 255, 0.1)";
                }}
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                style={{
                  position: "absolute",
                  right: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  color: "white",
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255, 255, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255, 255, 255, 0.1)";
                }}
              >
                <ChevronRight size={24} />
              </button>

              <div
                style={{
                  position: "absolute",
                  bottom: "1rem",
                  background: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "9999px",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                {selectedImageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}

      <ToastContainer
        toasts={toasts}
        onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
