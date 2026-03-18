import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  AlertTriangle,
  X,
  Upload,
  CheckCircle,
} from "lucide-react";
import { ToastContainer, type ToastType } from "../components/ui/Toast";
import {
  fetchProducts as fetchProductsApi,
  createProduct as createProductApi,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
  type Product as ApiProduct,
  type ProductPayload,
} from "../api/products";
import { uploadImage as uploadProductImage } from "../api/upload";
import { formatINR } from "../lib/utils";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  stock: number;
  description: string;
  condition: string;
   // Derived from backend fields
  image?: string;
  skillLevel?: string;
  isActive: boolean;
  onSale: boolean;
}

interface ToastMsg {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

type CategoryNode = {
  label: string;
  children?: string[];
};

const CATEGORY_TREE: CategoryNode[] = [
  { label: "Amplifier", children: ["Amplifier", "Power Amplifier"] },
  { label: "Microphone", children: ["Wired", "Wireless"] },
  { label: "Mixers" },
  {
    label: "Portable Speakers",
    children: ["Active Speaker", "Trolly Speaker"],
  },
  { label: "Speakers", children: ["Horn Speaker"] },
  {
    label: "Unit Driver",
    children: ["Driver Unit", "Reflex Horn"],
  },
  {
    label: "Drivers",
    children: ["HF Drivers", "Tweeters", "Network Drivers"],
  },
  {
    label: "Crossover",
    children: ["Crossover", "Digital Crossover"],
  },
  { label: "Megaphones" },
  { label: "Conference System", children: ["Wired", "Wireless"] },
  { label: "Audio Splitter" },
  { label: "Line Array Loudspeaker" },
  {
    label: "Intellection Speaker",
    children: ["Wall Speaker", "Ceiling Speaker"],
  },
  {
    label: "Stands",
    children: ["Microphone Stands", "Speaker Stands"],
  },
];

const CATEGORY_OPTIONS = CATEGORY_TREE.flatMap((node) =>
  node.children ? [node.label, ...node.children] : [node.label],
);
const BRANDS = [
  "Ahuja",
  "StudioMaster",
  "DynaTech",
  "Digimore",
  "NX Audio",
  "P. Audio",
  "Sound Craft",
  "Stranger",
  "Dbx",
  "Pioneer",
  "Dasska",
  "Yamaha",
  "Real Audio",
  "ITS",
  "A Plus",
  "Tauras",
  "Musimax",
  "AudioTone",
  "Sousys",
  "NV mark",
  "Dynamite",
  "Nlabs",
];


const getStockInfo = (
  stock: number,
): { label: string; bg: string; color: string } => {
  if (stock === 0)
    return { label: "Out of Stock", bg: "#fee2e2", color: "#b91c1c" };
  if (stock <= 5)
    return { label: "Low Stock", bg: "#fef3c7", color: "#b45309" };
  return { label: "In Stock", bg: "#dcfce7", color: "#15803d" };
};

const mapApiProductToUi = (product: ApiProduct): Product => ({
  id: product.id,
  name: product.name,
  sku: product.id, // backend does not expose SKU; using id as a stable identifier
  category: product.category,
  brand: product.brand,
  price: product.price,
  originalPrice: product.originalPrice,
  stock: product.stockCount,
  description: product.description,
  condition: product.condition,
  image: product.image,
  skillLevel: product.skillLevel,
  isActive: product.inStock,
  onSale: product.onSale ?? false,
});

const buildProductPayload = (data: Product): ProductPayload => {
  const placeholderImage =
    data.image ||
    `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(data.name)}`;

  return {
    name: data.name,
    category: data.category,
    price: data.price,
    originalPrice: data.originalPrice,
    onSale: data.onSale,
    image: placeholderImage,
    images: [],
    description: data.description,
    rating: 0,
    reviews: 0,
    brand: data.brand,
    condition: data.condition,
    skillLevel: data.skillLevel || "Beginner",
    inStock: data.isActive,
    stockCount: data.stock,
    specifications: [],
  };
};

const EmptyModal = ({
  isOpen,
  title,
  onClose,
  children,
  footer,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h3
            style={{
              fontSize: "1.0625rem",
              fontWeight: 700,
              color: "#0f172a",
              margin: 0,
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              padding: "0.25rem",
              display: "flex",
              borderRadius: 6,
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
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    sku: "",
    category: "Amplifier",
    brand: "Ahuja",
    price: undefined,
    stock: undefined,
    description: "",
    condition: "New",
    isActive: true,
    onSale: false,
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductsApi({ page, limit: 20 });
        setProducts(data.products.map(mapApiProductToUi));
        setTotal(data.total);
        setPages(data.pages);
      } catch (err: any) {
        const message =
          err?.response?.data?.message || "Failed to load products.";
        setError(message);
        addToast("error", "Unable to load products", message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const handleImageClick = () => {
    if (isUploadingImage) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const { url } = await uploadProductImage(file);
      setFormData((prev) => ({ ...prev, image: url }));
      addToast("success", "Image Uploaded", "Product image has been uploaded.");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to upload image. Try again.";
      addToast("error", "Upload Failed", message);
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData(product);
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        sku: "",
        category: "Amplifier",
        brand: "Fender",
        price: undefined,
        stock: undefined,
        description: "",
        condition: "New",
        isActive: true,
        onSale: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || formData.stock === undefined) {
      addToast("error", "Validation Error", "Please fill all required fields");
      return;
    }
    try {
      const baseData: Product = {
        id: editingId || "",
        sku: formData.sku || "",
        name: formData.name,
        category: formData.category || "Amplifier",
        brand: formData.brand || "Ahuja",
        price: formData.price,
        originalPrice: formData.originalPrice,
        stock: formData.stock,
        description: formData.description || "",
        condition: formData.condition || "New",
        image: formData.image,
        skillLevel: formData.skillLevel,
        isActive: formData.isActive ?? true,
        onSale: formData.onSale ?? false,
      };

      if (editingId) {
        const updated = await updateProductApi(
          editingId,
          buildProductPayload(baseData),
        );
        const mapped = mapApiProductToUi(updated);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? mapped : p)),
        );
        addToast("success", "Product Updated", "Changes saved successfully");
      } else {
        const created = await createProductApi(buildProductPayload(baseData));
        const mapped = mapApiProductToUi(created);
        setProducts((prev) => [...prev, mapped]);
        setTotal((prev) => prev + 1);
        addToast("success", "Product Added", "New product created");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to save product. Try again.";
      addToast("error", "Save Failed", message);
    }
  };

  const handleDelete = async () => {
    if (selectedProduct) {
      try {
        await deleteProductApi(selectedProduct.id);
        setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
        setTotal((prev) => Math.max(0, prev - 1));
        addToast("success", "Product Deleted", "Product removed from catalog");
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          "Failed to delete product. Please try again.";
        addToast("error", "Delete Failed", message);
      }
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = !filterCategory || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const inStock = products.filter((p) => p.stock > 5).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

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
            Products
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "0.9375rem" }}>
            Manage your instrument inventory
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
          style={{ gap: "0.5rem" }}
        >
          <Plus size={17} />
          Add Product
        </button>
      </div>

      {/* Summary Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "0.875rem",
        }}
      >
        {[
          {
            label: "Total Products",
            value: products.length,
            icon: Package,
            color: "#4f46e5",
            bg: "#eef2ff",
          },
          {
            label: "In Stock",
            value: inStock,
            icon: CheckCircle,
            color: "#22c55e",
            bg: "#f0fdf4",
          },
          {
            label: "Low Stock",
            value: lowStock,
            icon: AlertTriangle,
            color: "#f59e0b",
            bg: "#fffbeb",
          },
          {
            label: "Out of Stock",
            value: outOfStock,
            icon: X,
            color: "#ef4444",
            bg: "#fef2f2",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="card"
              style={{
                padding: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                  {s.label}
                </p>
                <p
                  style={{
                    fontSize: "1.375rem",
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
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flex: 1,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                position: "relative",
                flex: 1,
                minWidth: 200,
                maxWidth: 320,
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
                placeholder="Search products or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "2.25rem", height: 38 }}
              />
            </div>
            <select
              className="select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: "auto", minWidth: 160, height: 38 }}
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {(searchTerm || filterCategory) && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("");
                }}
              >
                Clear
              </button>
            )}
          </div>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "#94a3b8",
              whiteSpace: "nowrap",
            }}
          >
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Table */}
        {loading ? (
          <div className="empty-state">
            <Package size={40} style={{ color: "#cbd5e1" }} />
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Loading products...
            </h3>
            <p style={{ color: "#94a3b8", margin: 0 }}>
              Please wait while we fetch your catalog.
            </p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <AlertTriangle size={40} style={{ color: "#f97316" }} />
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              Unable to load products
            </h3>
            <p style={{ color: "#94a3b8", margin: 0 }}>
              {error} Try refreshing the page.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Package size={40} style={{ color: "#cbd5e1" }} />
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              No products found
            </h3>
            <p style={{ color: "#94a3b8", margin: 0 }}>
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const stockInfo = getStockInfo(product.stock);
                  return (
                    <tr key={product.id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 8,
                              background: "#eef2ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Package size={20} style={{ color: "#4f46e5" }} />
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
                              {product.name}
                            </p>
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "#94a3b8",
                                margin: "1px 0 0",
                                fontFamily: "monospace",
                              }}
                            >
                              {product.sku}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{ fontSize: "0.8125rem", color: "#64748b" }}
                        >
                          {product.category}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p
                            style={{
                              fontWeight: 700,
                              color: "#0f172a",
                              margin: 0,
                            }}
                          >
                            {formatINR(product.price)}
                          </p>
                          {product.originalPrice && (
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "#94a3b8",
                                margin: 0,
                                textDecoration: "line-through",
                              }}
                            >
                              {formatINR(product.originalPrice)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.1875rem 0.625rem",
                            borderRadius: 99,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            background: stockInfo.bg,
                            color: stockInfo.color,
                          }}
                        >
                          {stockInfo.label}{" "}
                          {product.stock > 0 && `(${product.stock})`}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.1875rem 0.625rem",
                            borderRadius: 99,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            background: product.isActive
                              ? "#dcfce7"
                              : "#f1f5f9",
                            color: product.isActive ? "#15803d" : "#64748b",
                          }}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.25rem",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="btn btn-ghost btn-icon"
                            title="Edit"
                            style={{ color: "#64748b" }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "#eef2ff";
                              (e.currentTarget as HTMLElement).style.color =
                                "#4f46e5";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "transparent";
                              (e.currentTarget as HTMLElement).style.color =
                                "#64748b";
                            }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDeleteModalOpen(true);
                            }}
                            className="btn btn-ghost btn-icon"
                            title="Delete"
                            style={{ color: "#64748b" }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "#fef2f2";
                              (e.currentTarget as HTMLElement).style.color =
                                "#dc2626";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "transparent";
                              (e.currentTarget as HTMLElement).style.color =
                                "#64748b";
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div
          className="card-footer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: 0 }}>
            Showing {products.length > 0 ? 1 : 0}–
            {products.length} of {total || products.length} products
          </p>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={loading || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={loading || page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <EmptyModal
        isOpen={isModalOpen}
        title={editingId ? "Edit Product" : "Add New Product"}
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              {editingId ? "Update Product" : "Save Product"}
            </button>
          </>
        }
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}
        >
          <div className="form-group">
            <label className="label">Product Name *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Fender Stratocaster"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.875rem",
            }}
          >
            <div className="form-group">
              <label className="label">Category *</label>
              <select
                className="select"
                value={formData.category || "Amplifier"}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Brand</label>
              <select
                className="select"
                value={formData.brand || "Fender"}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.875rem",
            }}
          >
            <div className="form-group">
              <label className="label">Price (USD) *</label>
              <input
                type="number"
                className="input"
                placeholder="0"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="form-group">
              <label className="label">Stock Quantity *</label>
              <input
                type="number"
                className="input"
                placeholder="0"
                value={formData.stock ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              className="textarea"
              placeholder="Product description..."
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.875rem",
            }}
          >
            <div className="form-group">
              <label className="label">Status</label>
              <select
                className="select"
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isActive: e.target.value === "active",
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          {/* Image Upload */}
          <div
            style={{
              border: "2px dashed #e2e8f0",
              borderRadius: 10,
              padding: "1.25rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
            onClick={handleImageClick}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#4f46e5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
            }}
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <Upload
              size={24}
              style={{ color: "#94a3b8", marginBottom: "0.5rem" }}
            />
            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>
              {isUploadingImage
                ? "Uploading image..."
                : formData.image
                  ? "Image uploaded • Click to replace"
                  : "Click to upload product image"}
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#94a3b8",
                margin: "0.25rem 0 0",
              }}
            >
              PNG, JPG, WebP up to 5MB
            </p>
            {formData.image && !isUploadingImage && (
              <div
                style={{
                  marginTop: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                <img
                  src={formData.image}
                  alt="Product"
                  style={{
                    maxHeight: 96,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </EmptyModal>

      {/* Delete Confirmation Modal */}
      <EmptyModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedProduct(null);
              }}
            >
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete Product
            </button>
          </>
        }
      >
        {selectedProduct && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <p style={{ color: "#374151", margin: 0 }}>
              Are you sure you want to delete{" "}
              <strong style={{ color: "#0f172a" }}>
                {selectedProduct.name}
              </strong>
              ?
            </p>
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "0.875rem",
                display: "flex",
                gap: "0.625rem",
              }}
            >
              <AlertTriangle
                size={16}
                style={{ color: "#dc2626", flexShrink: 0, marginTop: 1 }}
              />
              <p style={{ fontSize: "0.875rem", color: "#b91c1c", margin: 0 }}>
                This action cannot be undone. The product will be permanently
                removed from your catalog.
              </p>
            </div>
          </div>
        )}
      </EmptyModal>

      <ToastContainer
        toasts={toasts}
        onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}