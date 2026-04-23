import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
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
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  LayoutList,
  Eye,
} from "lucide-react";
import { ToastContainer, type ToastType } from "../components/ui/Toast";
import {
  fetchProducts as fetchProductsApi,
  createProduct as createProductApi,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
  type Product as ApiProduct,
  type ProductVariant as ApiProductVariant,
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
  image?: string;
  images?: string[];
  skillLevel?: string;
  isActive: boolean;
  onSale: boolean;
  variants: ProductVariantFormValue[];
}

interface ProductVariantFormValue {
  variantId?: string;
  configuration: string;
  finish: string;
  sku: string;
  stock: number;
  price?: number;
  images?: string[];
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

// SKU validation: Must match format like AMP-50000-BLK-RH
const SKU_PATTERN = /^[A-Z]{2,10}-[A-Z0-9]{1,20}(?:-[A-Z0-9]{2,12}){2,5}$/;
const validateSKU = (sku: string): boolean => SKU_PATTERN.test(sku.trim().toUpperCase());

const createEmptyVariant = (): ProductVariantFormValue => ({
  configuration: "",
  finish: "",
  sku: "",
  stock: 0,
  price: undefined,
  images: [],
});

const buildLegacyVariantSku = (productId: string): string => {
  const compactId = productId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const identifier = compactId.slice(0, 12) || "CATALOG1";
  return `PRD-${identifier}-STANDARD-DEFAULT`;
};

const createLegacyVariant = (
  product: Pick<ApiProduct, "id" | "stockCount">,
): ProductVariantFormValue => ({
  configuration: "Default",
  finish: "Standard",
  sku: buildLegacyVariantSku(product.id),
  stock: Math.max(0, product.stockCount || 0),
  price: undefined,
  images: [],
});

const normalizeVariantFormValue = (
  variant?: Partial<ApiProductVariant>,
): ProductVariantFormValue => ({
  variantId: variant?.variantId,
  configuration: variant?.configuration || "",
  finish: variant?.finish || "",
  sku: variant?.sku || "",
  stock: Number.isFinite(variant?.stock) ? Math.max(0, Number(variant?.stock)) : 0,
  price:
    variant?.price !== undefined && Number.isFinite(variant.price)
      ? Number(variant.price)
      : undefined,
  images: variant?.images || [],
});

const sanitizeVariants = (
  variants: ProductVariantFormValue[] = [],
): ApiProductVariant[] =>
  variants.flatMap((variant) => {
    const configuration = variant.configuration.trim();
    const finish = variant.finish.trim();
    const sku = variant.sku.trim().toUpperCase();
    const stock = Math.max(0, Number(variant.stock) || 0);
    const price =
      variant.price !== undefined && variant.price !== null && `${variant.price}`.trim() !== ""
        ? Number(variant.price)
        : undefined;

    if (!configuration && !finish && !sku && stock === 0 && price === undefined) {
      return [];
    }

    return [{
      ...(variant.variantId ? { variantId: variant.variantId } : {}),
      configuration,
      finish,
      sku,
      stock,
      ...(price !== undefined ? { price } : {}),
      images: variant.images || [],
    }];
  });

const getTotalVariantStock = (
  variants: Array<Pick<ProductVariantFormValue, "stock">> = [],
): number =>
  variants.reduce((total, variant) => total + Math.max(0, Number(variant.stock) || 0), 0);

const getStockInfo = (
  stock: number,
): { label: string; bgColor: string; textColor: string; dotColor: string } => {
  if (stock === 0)
    return {
      label: "Out of Stock",
      bgColor: "#fff5f5",
      textColor: "#c53030",
      dotColor: "#e53e3e",
    };
  if (stock <= 5)
    return {
      label: "Low Stock",
      bgColor: "#fffaf0",
      textColor: "#c05621",
      dotColor: "#ed8936",
    };
  return {
    label: "In Stock",
    bgColor: "#f0fdf4",
    textColor: "#166534",
    dotColor: "#22c55e",
  };
};

const mapApiProductToUi = (product: ApiProduct): Product => ({
  id: product.id,
  name: product.name,
  sku: product.variants?.[0]?.sku || product.id,
  category: product.category,
  brand: product.brand,
  price: product.basePrice ?? product.price,
  originalPrice: product.originalPrice,
  stock: product.stockCount,
  description: product.description,
  condition: product.condition,
  image: product.image,
  images: product.images,
  skillLevel: product.skillLevel,
  isActive: product.inStock,
  onSale: product.onSale ?? false,
  variants:
    product.variants && product.variants.length > 0
      ? product.variants.map((variant) => normalizeVariantFormValue(variant))
      : [createLegacyVariant(product)],
});

const buildProductPayload = (data: Product): ProductPayload => {
  const primaryImage =
    data.images?.find((image) => typeof image === "string" && image.trim().length > 0) ||
    data.image;
  const placeholderImage =
    primaryImage ||
    `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(data.name)}`;
  const variants = sanitizeVariants(data.variants);
  const stockCount = getTotalVariantStock(variants);

  return {
    name: data.name,
    category: data.category,
    basePrice: data.price,
    price: data.price,
    originalPrice: data.originalPrice,
    onSale: data.onSale,
    image: placeholderImage,
    images: data.images || [],
    description: data.description,
    rating: 0,
    reviews: 0,
    brand: data.brand,
    condition: data.condition,
    skillLevel: data.skillLevel || "Beginner",
    inStock: stockCount > 0 ? data.isActive : false,
    stockCount,
    variants,
    specifications: [],
  };
};

const Modal = ({
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
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 40,
          opacity: 1,
          transition: "opacity 0.3s ease-out",
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1rem",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            width: "100%",
            maxWidth: "800px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            animation: "slideInUp 0.3s ease-out",
          }}
        >
          {/* Modal Header */}
          <div
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              borderBottom: "1px solid #f3f4f6",
              padding: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                padding: "0.5rem",
                backgroundColor: "transparent",
                color: "#9ca3af",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#f3f4f6";
                (e.currentTarget as HTMLButtonElement).style.color = "#6b7280";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.5rem",
            }}
          >
            {children}
          </div>

          {/* Modal Footer */}
          {footer && (
            <div
              style={{
                borderTop: "1px solid #f3f4f6",
                backgroundColor: "#f9fafb",
                padding: "1.5rem",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                borderBottomLeftRadius: "1rem",
                borderBottomRightRadius: "1rem",
                flexWrap: "wrap",
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
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
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    sku: "",
    category: "Amplifier",
    brand: "Ahuja",
    price: undefined,
    stock: 0,
    description: "",
    condition: "New",
    isActive: true,
    onSale: false,
    images: [],
    variants: [createEmptyVariant()],
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
  }, [page]);

  const addToast = (type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImages = formData.images || [];
    if (currentImages.length >= 7) {
      addToast("error", "Maximum Images Reached", "You can upload maximum 7 images");
      return;
    }

    const remainingSlots = 7 - currentImages.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    setIsUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of filesToUpload) {
        const { url } = await uploadProductImage(file);
        uploadedUrls.push(url);
      }
      setFormData((prev) => {
        const nextImages = [...(prev.images || []), ...uploadedUrls];
        return {
          ...prev,
          image: nextImages[0] || prev.image,
          images: nextImages,
        };
      });
      addToast("success", "Images Uploaded", `${uploadedUrls.length} image(s) uploaded successfully.`);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to upload images. Try again.";
      addToast("error", "Upload Failed", message);
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        ...product,
        variants:
          product.variants && product.variants.length > 0
            ? product.variants.map((variant) => normalizeVariantFormValue(variant))
            : [createEmptyVariant()],
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        sku: "",
        category: "Amplifier",
        brand: "Ahuja",
        price: undefined,
        stock: 0,
        description: "",
        condition: "New",
        isActive: true,
        onSale: false,
        images: [],
        variants: [createEmptyVariant()],
      });
    }
    setIsModalOpen(true);
  };

  const handleVariantChange = (
    index: number,
    field: keyof ProductVariantFormValue,
    value: string | number | undefined,
  ) => {
    setFormData((prev) => {
      const currentVariants = prev.variants?.length
        ? prev.variants.map((variant) => ({ ...variant }))
        : [createEmptyVariant()];
      const nextVariants = currentVariants.map((variant, variantIndex) => {
        if (variantIndex !== index) {
          return variant;
        }

        if (field === "stock") {
          return {
            ...variant,
            stock: Math.max(0, Number(value) || 0),
          };
        }

        if (field === "price") {
          return {
            ...variant,
            price:
              value === "" || value === undefined || value === null
                ? undefined
                : Math.max(0, Number(value) || 0),
          };
        }

        return {
          ...variant,
          [field]: typeof value === "string" ? value : "",
        };
      });

      return {
        ...prev,
        variants: nextVariants,
        stock: getTotalVariantStock(nextVariants),
      };
    });
  };

  const handleAddVariant = () => {
    setFormData((prev) => {
      const nextVariants = [...(prev.variants || [createEmptyVariant()]), createEmptyVariant()];
      return {
        ...prev,
        variants: nextVariants,
        stock: getTotalVariantStock(nextVariants),
      };
    });
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => {
      const currentVariants = prev.variants || [createEmptyVariant()];
      const nextVariants = currentVariants.filter((_, variantIndex) => variantIndex !== index);
      const safeVariants = nextVariants.length > 0 ? nextVariants : [createEmptyVariant()];

      return {
        ...prev,
        variants: safeVariants,
        stock: getTotalVariantStock(safeVariants),
      };
    });
  };

  const handleSave = async () => {
    const sanitizedVariants = sanitizeVariants(formData.variants || []);

    if (!formData.name || !formData.price) {
      addToast("error", "Validation Error", "Please fill all required fields");
      return;
    }
    if (sanitizedVariants.length === 0) {
      addToast("error", "Validation Error", "Add at least one complete variant before saving.");
      return;
    }
    const incompleteVariant = (formData.variants || []).find((variant) => {
      const hasAnyValue =
        variant.configuration.trim() ||
        variant.finish.trim() ||
        variant.sku.trim() ||
        (variant.stock ?? 0) > 0 ||
        variant.price !== undefined;

      return hasAnyValue && (!variant.configuration.trim() || !variant.finish.trim() || !variant.sku.trim());
    });
    if (incompleteVariant) {
      addToast(
        "error",
        "Validation Error",
        "Each variant must include configuration, finish, and SKU.",
      );
      return;
    }
    const duplicateSku = sanitizedVariants.find(
      (variant, index) =>
        sanitizedVariants.findIndex((candidate) => candidate.sku === variant.sku) !== index,
    );
    if (duplicateSku) {
      addToast("error", "Validation Error", `Duplicate variant SKU: ${duplicateSku.sku}`);
      return;
    }
    // Validate SKU format: must match pattern like AMP-50000-BLK-RH
    const invalidSkuVariant = sanitizedVariants.find((variant) => !validateSKU(variant.sku));
    if (invalidSkuVariant) {
      addToast(
        "error",
        "Invalid SKU Format",
        `SKU "${invalidSkuVariant.sku}" is invalid. Format must be like: AMP-50000-BLK-RH (2-10 letters, then numbers/letters separated by hyphens).`,
      );
      return;
    }
    const imageCount = formData.images?.length || 0;
    if (imageCount < 4) {
      addToast("error", "Validation Error", `Please upload at least 4 images (currently ${imageCount})`);
      return;
    }
    if (imageCount > 7) {
      addToast("error", "Validation Error", `Maximum 7 images allowed (currently ${imageCount})`);
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
        stock: getTotalVariantStock(sanitizedVariants),
        description: formData.description || "",
        condition: formData.condition || "New",
        image: formData.image,
        images: formData.images || [],
        skillLevel: formData.skillLevel,
        isActive: formData.isActive ?? true,
        onSale: formData.onSale ?? false,
        variants: sanitizedVariants.map((variant) => normalizeVariantFormValue(variant)),
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
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #f8fafc, #ffffff, #f8fafc)",
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
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-in {
          animation: slideInUp 0.3s ease-out;
        }
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        .zoom-in-95 {
          animation: zoomIn 0.3s ease-out;
        }
        .duration-300 {
          animation-duration: 0.3s;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
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
        input:focus, select:focus, textarea:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          border-color: #2563eb;
        }
        @media (max-width: 768px) {
          body {
            font-size: 14px;
          }
        }
      `}</style>

      {/* Header Section */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            maxWidth: "100%",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "1rem",
            paddingRight: "1rem",
            paddingTop: "1.5rem",
            paddingBottom: "1.5rem",
          }}
        >
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
                  fontSize: "clamp(1.5rem, 5vw, 2rem)",
                  fontWeight: 800,
                  background: "linear-gradient(to right, #111827, #4b5563)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  margin: 0,
                }}
              >
                Products
              </h1>
              <p
                style={{
                  color: "#4b5563",
                  fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                  marginTop: "0.25rem",
                  marginBottom: 0,
                }}
              >
                Manage your complete inventory catalog
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              style={{
                width: "100%",
                maxWidth: "300px",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                background: "linear-gradient(to right, #1e40af, #1e3a8a)",
                color: "white",
                fontWeight: 600,
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
                fontSize: "0.875rem",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 20px 25px -5px rgba(0, 0, 0, 0.15)";
                (e.currentTarget as HTMLButtonElement).style.background =
                  "linear-gradient(to right, #1e3a8a, #172554)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                (e.currentTarget as HTMLButtonElement).style.background =
                  "linear-gradient(to right, #1e40af, #1e3a8a)";
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(0.95)";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(1)";
              }}
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div
        style={{
          maxWidth: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          paddingTop: "2rem",
          paddingBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(clamp(150px, 100%, 250px), 1fr))",
            gap: "1rem",
          }}
        >
          {[
            {
              label: "Total Products",
              value: products.length,
              icon: Package,
              gradient: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
              accentColor: "#2563eb",
              iconBg: "#dbeafe",
            },
            {
              label: "In Stock",
              value: inStock,
              icon: CheckCircle,
              gradient: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              accentColor: "#16a34a",
              iconBg: "#bbf7d0",
            },
            {
              label: "Low Stock",
              value: lowStock,
              icon: AlertTriangle,
              gradient: "linear-gradient(135deg, #fffbeb, #fef3c7)",
              accentColor: "#d97706",
              iconBg: "#fde68a",
            },
            {
              label: "Out of Stock",
              value: outOfStock,
              icon: X,
              gradient: "linear-gradient(135deg, #fef2f2, #fee2e2)",
              accentColor: "#dc2626",
              iconBg: "#fecaca",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                style={{
                  background: stat.gradient,
                  borderRadius: "1rem",
                  padding: "clamp(1rem, 4vw, 1.5rem)",
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 1px 3px 0 rgba(0, 0, 0, 0.05)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        color: "#4b5563",
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {stat.label}
                    </p>
                    <p
                      style={{
                        fontSize: "clamp(1.25rem, 5vw, 1.875rem)",
                        fontWeight: 800,
                        color: stat.accentColor,
                        margin: "0.5rem 0 0 0",
                      }}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "0.75rem",
                      background: stat.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color={stat.accentColor} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          paddingBottom: "2rem",
        }}
      >
        {/* Filters & Controls */}
        <div
          style={{
            background: "white",
            borderRadius: "1rem",
            border: "1px solid rgba(229, 231, 235, 0.5)",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "clamp(1rem, 4vw, 1.5rem)",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {/* Search & Controls Row */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "1rem",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                {/* Search */}
                <div
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    position: "relative",
                  }}
                >
                  <Search
                    size={18}
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9ca3af",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search by product name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "100%",
                      paddingLeft: "2.25rem",
                      paddingRight: "1rem",
                      paddingTop: "0.625rem",
                      paddingBottom: "0.625rem",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      transition: "all 0.2s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.background = "white";
                      (e.target as HTMLInputElement).style.boxShadow =
                        "0 0 0 3px rgba(37, 99, 235, 0.1)";
                      (e.target as HTMLInputElement).style.borderColor =
                        "#2563eb";
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.background =
                        "#f8fafc";
                      (e.target as HTMLInputElement).style.boxShadow = "none";
                      (e.target as HTMLInputElement).style.borderColor =
                        "#e2e8f0";
                    }}
                  />
                </div>

                {/* Controls */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      paddingTop: "0.625rem",
                      paddingBottom: "0.625rem",
                      background: "#f3f4f6",
                      color: "#374151",
                      fontWeight: 500,
                      borderRadius: "0.5rem",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#e5e7eb";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#f3f4f6";
                    }}
                  >
                    <Filter size={16} />
                    <span>Filters</span>
                  </button>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.25rem",
                      background: "#f3f4f6",
                      padding: "0.25rem",
                      borderRadius: "0.5rem",
                    }}
                  >
                    <button
                      onClick={() => setViewMode("table")}
                      style={{
                        flex: 1,
                        paddingLeft: "0.75rem",
                        paddingRight: "0.75rem",
                        paddingTop: "0.5rem",
                        paddingBottom: "0.5rem",
                        borderRadius: "0.375rem",
                        border: "none",
                        background:
                          viewMode === "table" ? "white" : "transparent",
                        color: viewMode === "table" ? "#2563eb" : "#4b5563",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow:
                          viewMode === "table"
                            ? "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
                            : "none",
                      }}
                      title="Table view"
                    >
                      <LayoutList size={16} style={{ margin: "0 auto" }} />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      style={{
                        flex: 1,
                        paddingLeft: "0.75rem",
                        paddingRight: "0.75rem",
                        paddingTop: "0.5rem",
                        paddingBottom: "0.5rem",
                        borderRadius: "0.375rem",
                        border: "none",
                        background:
                          viewMode === "grid" ? "white" : "transparent",
                        color: viewMode === "grid" ? "#2563eb" : "#4b5563",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow:
                          viewMode === "grid"
                            ? "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
                            : "none",
                      }}
                      title="Grid view"
                    >
                      <LayoutGrid size={16} style={{ margin: "0 auto" }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Filters */}
              {showFilters && (
                <div
                  style={{
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #f3f4f6",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#374151",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Category
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      style={{
                        width: "100%",
                        paddingLeft: "1rem",
                        paddingRight: "1rem",
                        paddingTop: "0.625rem",
                        paddingBottom: "0.625rem",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        transition: "all 0.2s ease",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLSelectElement).style.background =
                          "white";
                        (e.target as HTMLSelectElement).style.boxShadow =
                          "0 0 0 3px rgba(37, 99, 235, 0.1)";
                        (e.target as HTMLSelectElement).style.borderColor =
                          "#2563eb";
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLSelectElement).style.background =
                          "#f8fafc";
                        (e.target as HTMLSelectElement).style.boxShadow =
                          "none";
                        (e.target as HTMLSelectElement).style.borderColor =
                          "#e2e8f0";
                      }}
                    >
                      <option value="">All Categories</option>
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(searchTerm || filterCategory) && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setFilterCategory("");
                        }}
                        style={{
                          width: "100%",
                          paddingLeft: "1rem",
                          paddingRight: "1rem",
                          paddingTop: "0.625rem",
                          paddingBottom: "0.625rem",
                          background: "#fee2e2",
                          color: "#991b1b",
                          fontWeight: 500,
                          borderRadius: "0.5rem",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#fca5a5";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "#fee2e2";
                        }}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Results Count */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.875rem",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <p style={{ color: "#4b5563", margin: 0 }}>
                  Showing{" "}
                  <span style={{ fontWeight: 600, color: "#111827" }}>
                    {filtered.length}
                  </span>{" "}
                  of{" "}
                  <span style={{ fontWeight: 600, color: "#111827" }}>
                    {products.length}
                  </span>{" "}
                  products
                </p>
                {(searchTerm || filterCategory) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterCategory("");
                    }}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "#2563eb",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#1d4ed8";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "#2563eb";
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: "4rem",
                paddingBottom: "4rem",
              }}
            >
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  border: "4px solid #e5e7eb",
                  borderTop: "4px solid #2563eb",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "1rem",
                }}
              />
              <p style={{ color: "#4b5563", fontWeight: 500, margin: 0 }}>
                Loading products...
              </p>
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                }}
              >
                Please wait while we fetch your catalog
              </p>
            </div>
          ) : error ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: "4rem",
                paddingBottom: "4rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
            >
              <div
                style={{
                  background: "#fef2f2",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  maxWidth: "28rem",
                  textAlign: "center",
                }}
              >
                <AlertTriangle
                  size={40}
                  color="#dc2626"
                  style={{ margin: "0 auto 0.75rem" }}
                />
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "#7f1d1d",
                    margin: 0,
                    marginBottom: "0.5rem",
                  }}
                >
                  Unable to Load Products
                </h3>
                <p
                  style={{
                    color: "#991b1b",
                    fontSize: "0.875rem",
                    margin: "0 0 1rem",
                  }}
                >
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                    paddingTop: "0.5rem",
                    paddingBottom: "0.5rem",
                    background: "#dc2626",
                    color: "white",
                    fontWeight: 500,
                    borderRadius: "0.5rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#b91c1c";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#dc2626";
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: "4rem",
                paddingBottom: "4rem",
              }}
            >
              <Package
                size={48}
                color="#d1d5db"
                style={{ marginBottom: "1rem" }}
              />
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                  marginBottom: "0.5rem",
                }}
              >
                No Products Found
              </h3>
              <p
                style={{
                  color: "#4b5563",
                  fontSize: "0.875rem",
                  marginBottom: "1.5rem",
                }}
              >
                {searchTerm || filterCategory
                  ? "Try adjusting your search or filters"
                  : "No products in your catalog yet"}
              </p>
              <button
                onClick={() => handleOpenModal()}
                style={{
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                  background: "#2563eb",
                  color: "white",
                  fontWeight: 500,
                  borderRadius: "0.5rem",
                  border: "none",
                  cursor: "pointer",
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
                Create First Product
              </button>
            </div>
          ) : viewMode === "table" ? (
            /* Table View */
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      background: "#f9fafb",
                    }}
                  >
                    <th
                      style={{
                        paddingLeft: "1.5rem",
                        paddingRight: "1.5rem",
                        paddingTop: "1rem",
                        paddingBottom: "1rem",
                        textAlign: "left",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Product
                    </th>
                    <th
                      style={{
                        paddingLeft: "1.5rem",
                        paddingRight: "1.5rem",
                        paddingTop: "1rem",
                        paddingBottom: "1rem",
                        textAlign: "left",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Category
                    </th>
                    <th
                      style={{
                        paddingLeft: "1.5rem",
                        paddingRight: "1.5rem",
                        paddingTop: "1rem",
                        paddingBottom: "1rem",
                        textAlign: "left",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Price
                    </th>
                    <th
                      style={{
                        paddingLeft: "1.5rem",
                        paddingRight: "1.5rem",
                        paddingTop: "1rem",
                        paddingBottom: "1rem",
                        textAlign: "left",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Stock
                    </th>
                    <th
                      style={{
                        paddingLeft: "1.5rem",
                        paddingRight: "1.5rem",
                        paddingTop: "1rem",
                        paddingBottom: "1rem",
                        textAlign: "left",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        paddingLeft: "1.5rem",
                        paddingRight: "1.5rem",
                        paddingTop: "1rem",
                        paddingBottom: "1rem",
                        textAlign: "right",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#374151",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => {
                    const stockInfo = getStockInfo(product.stock);
                    return (
                      <tr
                        key={product.id}
                        style={{
                          borderBottom: "1px solid #f3f4f6",
                          transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLTableRowElement
                          ).style.backgroundColor = "rgba(249, 250, 251, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLTableRowElement
                          ).style.backgroundColor = "transparent";
                        }}
                      >
                        <td
                          style={{
                            paddingLeft: "1.5rem",
                            paddingRight: "1.5rem",
                            paddingTop: "1rem",
                            paddingBottom: "1rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                            }}
                          >
                            <div
                              style={{
                                position: "relative",
                                width: "2.5rem",
                                height: "2.5rem",
                                borderRadius: "0.5rem",
                                background:
                                  "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                overflow: "hidden",
                              }}
                            >
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <Package size={18} color="#2563eb" />
                              )}
                              {product.images && product.images.length > 1 && (
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: "-4px",
                                    right: "-4px",
                                    background: "#2563eb",
                                    color: "white",
                                    width: "1.25rem",
                                    height: "1.25rem",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.625rem",
                                    fontWeight: 700,
                                    border: "2px solid white",
                                  }}
                                >
                                  {product.images.length}
                                </div>
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  fontWeight: 600,
                                  color: "#111827",
                                  margin: 0,
                                  fontSize: "0.875rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {product.name}
                              </p>
                              <p
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#9ca3af",
                                  margin: "0.25rem 0 0",
                                  fontFamily: "monospace",
                                }}
                              >
                                {product.sku}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            paddingLeft: "1.5rem",
                            paddingRight: "1.5rem",
                            paddingTop: "1rem",
                            paddingBottom: "1rem",
                            fontSize: "0.8125rem",
                            color: "#4b5563",
                          }}
                        >
                          {product.category}
                        </td>
                        <td
                          style={{
                            paddingLeft: "1.5rem",
                            paddingRight: "1.5rem",
                            paddingTop: "1rem",
                            paddingBottom: "1rem",
                          }}
                        >
                          <div>
                            <p
                              style={{
                                fontWeight: 700,
                                color: "#111827",
                                margin: 0,
                              }}
                            >
                              {formatINR(product.price)}
                            </p>
                            {product.originalPrice && (
                              <p
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#9ca3af",
                                  margin: 0,
                                  textDecoration: "line-through",
                                }}
                              >
                                {formatINR(product.originalPrice)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td
                          style={{
                            paddingLeft: "1.5rem",
                            paddingRight: "1.5rem",
                            paddingTop: "1rem",
                            paddingBottom: "1rem",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.375rem",
                              paddingLeft: "0.75rem",
                              paddingRight: "0.75rem",
                              paddingTop: "0.375rem",
                              paddingBottom: "0.375rem",
                              borderRadius: "0.375rem",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              backgroundColor: stockInfo.bgColor,
                              color: stockInfo.textColor,
                            }}
                          >
                            <span
                              style={{
                                width: "0.375rem",
                                height: "0.375rem",
                                borderRadius: "50%",
                                backgroundColor: stockInfo.dotColor,
                              }}
                            />
                            {stockInfo.label}
                            {product.stock > 0 && ` (${product.stock})`}
                          </span>
                        </td>
                        <td
                          style={{
                            paddingLeft: "1.5rem",
                            paddingRight: "1.5rem",
                            paddingTop: "1rem",
                            paddingBottom: "1rem",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              paddingLeft: "0.75rem",
                              paddingRight: "0.75rem",
                              paddingTop: "0.375rem",
                              paddingBottom: "0.375rem",
                              borderRadius: "0.375rem",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              backgroundColor: product.isActive
                                ? "#dcfce7"
                                : "#f1f5f9",
                              color: product.isActive ? "#15803d" : "#4b5563",
                            }}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td
                          style={{
                            paddingLeft: "1.5rem",
                            paddingRight: "1.5rem",
                            paddingTop: "1rem",
                            paddingBottom: "1rem",
                            textAlign: "right",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              onClick={() => handleOpenModal(product)}
                              style={{
                                padding: "0.5rem",
                                background: "transparent",
                                color: "#2563eb",
                                border: "none",
                                borderRadius: "0.5rem",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Edit"
                              onMouseEnter={(e) => {
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.background = "#f0f9ff";
                              }}
                              onMouseLeave={(e) => {
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.background = "transparent";
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsDeleteModalOpen(true);
                              }}
                              style={{
                                padding: "0.5rem",
                                background: "transparent",
                                color: "#dc2626",
                                border: "none",
                                borderRadius: "0.5rem",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              title="Delete"
                              onMouseEnter={(e) => {
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.background = "#fef2f2";
                              }}
                              onMouseLeave={(e) => {
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.background = "transparent";
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
          ) : (
            /* Grid View */
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(clamp(250px, 100%, 300px), 1fr))",
                gap: "1.5rem",
                padding: "1.5rem",
              }}
            >
              {filtered.map((product) => {
                const stockInfo = getStockInfo(product.stock);
                return (
                  <div
                    key={product.id}
                    style={{
                      background: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
                      transition: "all 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        "#d1d5db";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow =
                        "0 1px 3px 0 rgba(0, 0, 0, 0.05)";
                      (e.currentTarget as HTMLDivElement).style.borderColor =
                        "#e5e7eb";
                    }}
                  >
                    {/* Image Gallery */}
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "10rem",
                        background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {product.images && product.images.length > 0 ? (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            gap: "2px",
                          }}
                        >
                          {product.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`${product.name} ${idx + 1}`}
                              style={{
                                flex: 1,
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ))}
                        </div>
                      ) : product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Package size={32} color="rgba(37, 99, 235, 0.2)" />
                      )}
                      {product.onSale && (
                        <div
                          style={{
                            position: "absolute",
                            top: "0.75rem",
                            right: "0.75rem",
                            background: "#ef4444",
                            color: "white",
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                            paddingTop: "0.25rem",
                            paddingBottom: "0.25rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          Sale
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        padding: "1rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                          fontFamily: "monospace",
                          margin: 0,
                          marginBottom: "0.5rem",
                        }}
                      >
                        {product.sku}
                      </p>
                      <h3
                        style={{
                          fontWeight: 700,
                          color: "#111827",
                          margin: 0,
                          marginBottom: "0.5rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {product.name}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#4b5563",
                          margin: 0,
                          marginBottom: "0.75rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {product.category}
                      </p>

                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "space-between",
                          marginBottom: "1rem",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontWeight: 700,
                              fontSize: "1.125rem",
                              color: "#111827",
                              margin: 0,
                            }}
                          >
                            {formatINR(product.price)}
                          </p>
                          {product.originalPrice && (
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "#9ca3af",
                                margin: 0,
                                textDecoration: "line-through",
                              }}
                            >
                              {formatINR(product.originalPrice)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            paddingLeft: "0.5rem",
                            paddingRight: "0.5rem",
                            paddingTop: "0.25rem",
                            paddingBottom: "0.25rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            backgroundColor: stockInfo.bgColor,
                            color: stockInfo.textColor,
                          }}
                        >
                          <span
                            style={{
                              width: "0.25rem",
                              height: "0.25rem",
                              borderRadius: "50%",
                              backgroundColor: stockInfo.dotColor,
                            }}
                          />
                          {stockInfo.label}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            paddingLeft: "0.5rem",
                            paddingRight: "0.5rem",
                            paddingTop: "0.25rem",
                            paddingBottom: "0.25rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            backgroundColor: product.isActive
                              ? "#dcfce7"
                              : "#f1f5f9",
                            color: product.isActive ? "#15803d" : "#4b5563",
                          }}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                        }}
                      >
                        <Link
                          to={`/products/${product.id}`}
                          style={{
                            flex: 1,
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                            paddingTop: "0.5rem",
                            paddingBottom: "0.5rem",
                            background: "#f0f9ff",
                            color: "#2563eb",
                            fontWeight: 500,
                            borderRadius: "0.5rem",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.375rem",
                            fontSize: "0.75rem",
                            transition: "all 0.2s ease",
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) => {
                            (
                              e.currentTarget as HTMLAnchorElement
                            ).style.background = "#e0f2fe";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.currentTarget as HTMLAnchorElement
                            ).style.background = "#f0f9ff";
                          }}
                        >
                          <Eye size={14} />
                          View
                        </Link>
                        <button
                          onClick={() => handleOpenModal(product)}
                          style={{
                            flex: 1,
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                            paddingTop: "0.5rem",
                            paddingBottom: "0.5rem",
                            background: "#f3f4f6",
                            color: "#4b5563",
                            fontWeight: 500,
                            borderRadius: "0.5rem",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.375rem",
                            fontSize: "0.75rem",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "#e5e7eb";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "#f3f4f6";
                          }}
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsDeleteModalOpen(true);
                          }}
                          style={{
                            flex: 1,
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                            paddingTop: "0.5rem",
                            paddingBottom: "0.5rem",
                            background: "#fef2f2",
                            color: "#dc2626",
                            fontWeight: 500,
                            borderRadius: "0.5rem",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.375rem",
                            fontSize: "0.75rem",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "#fee2e2";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "#fef2f2";
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div
              style={{
                borderTop: "1px solid #f3f4f6",
                paddingLeft: "clamp(1rem, 4vw, 1.5rem)",
                paddingRight: "clamp(1rem, 4vw, 1.5rem)",
                paddingTop: "1rem",
                paddingBottom: "1rem",
                display: "flex",
                flexDirection: "row",
                gap: "1rem",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f9fafb",
                flexWrap: "wrap",
              }}
            >
              <p style={{ fontSize: "0.8125rem", color: "#4b5563", margin: 0 }}>
                Page{" "}
                <span style={{ fontWeight: 600, color: "#111827" }}>
                  {page}
                </span>{" "}
                of{" "}
                <span style={{ fontWeight: 600, color: "#111827" }}>
                  {pages}
                </span>{" "}
                •{" "}
                <span style={{ fontWeight: 600, color: "#111827" }}>
                  {total}
                </span>{" "}
                total products
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  disabled={loading || page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                    paddingTop: "0.5rem",
                    paddingBottom: "0.5rem",
                    background: "white",
                    border: "1px solid #e5e7eb",
                    color: "#4b5563",
                    fontWeight: 500,
                    borderRadius: "0.5rem",
                    cursor: loading || page <= 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    transition: "all 0.2s ease",
                    opacity: loading || page <= 1 ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && page > 1) {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#f9fafb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "white";
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                <button
                  disabled={loading || page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                    paddingTop: "0.5rem",
                    paddingBottom: "0.5rem",
                    background: "white",
                    border: "1px solid #e5e7eb",
                    color: "#4b5563",
                    fontWeight: 500,
                    borderRadius: "0.5rem",
                    cursor:
                      loading || page >= pages ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    transition: "all 0.2s ease",
                    opacity: loading || page >= pages ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && page < pages) {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#f9fafb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "white";
                  }}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingId ? "Edit Product" : "Add New Product"}
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                color: "#4b5563",
                fontWeight: 500,
                background: "#f3f4f6",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#f3f4f6";
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                background: "#2563eb",
                color: "white",
                fontWeight: 500,
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
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
              {editingId ? "Update Product" : "Save Product"}
            </button>
          </>
        }
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {/* Product Name */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "0.5rem",
              }}
            >
              Product Name <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              style={{
                width: "100%",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Category & Brand */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "0.5rem",
                }}
              >
                Category <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                value={formData.category || "Amplifier"}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                style={{
                  width: "100%",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "0.5rem",
                }}
              >
                Brand
              </label>
              <select
                value={formData.brand || "Ahuja"}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                style={{
                  width: "100%",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
              >
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Variant Stock */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "0.5rem",
                }}
              >
                Price <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseInt(e.target.value) || 0,
                  })
                }
                style={{
                  width: "100%",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.625rem",
                  paddingBottom: "0.625rem",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Variants */}
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "0.75rem",
              padding: "1rem",
              background: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: "0.25rem",
                  }}
                >
                  Variants <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    color: "#64748b",
                  }}
                >
                  Add every sellable combination with its own configuration, finish, SKU, and stock.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.625rem 1rem",
                  borderRadius: "999px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Plus size={16} />
                Add Variant
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  padding: "0.625rem 0.875rem",
                  borderRadius: "999px",
                  background: "#e2e8f0",
                  color: "#0f172a",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                {sanitizeVariants(formData.variants || []).length} configured variant(s)
              </div>
              <div
                style={{
                  padding: "0.625rem 0.875rem",
                  borderRadius: "999px",
                  background: "#dcfce7",
                  color: "#166534",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                Total stock: {getTotalVariantStock(formData.variants || [])}
              </div>
            </div>

            {(formData.variants || [createEmptyVariant()]).map((variant, index) => (
              <div
                key={variant.variantId || `${index}-${variant.sku}-${variant.configuration}-${variant.finish}`}
                style={{
                  border: "1px solid #dbe4ee",
                  borderRadius: "0.75rem",
                  background: "#ffffff",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      Variant {index + 1}
                    </h4>
                    <p
                      style={{
                        margin: "0.25rem 0 0",
                        fontSize: "0.75rem",
                        color: "#64748b",
                      }}
                    >
                      Use a unique SKU for each purchasable option.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(index)}
                    disabled={(formData.variants?.length || 0) <= 1}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.875rem",
                      borderRadius: "999px",
                      border: "1px solid #fecaca",
                      background: "#fff1f2",
                      color: "#b91c1c",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      cursor: (formData.variants?.length || 0) <= 1 ? "not-allowed" : "pointer",
                      opacity: (formData.variants?.length || 0) <= 1 ? 0.5 : 1,
                    }}
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "#111827",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Configuration <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Right-Handed"
                      value={variant.configuration}
                      onChange={(e) =>
                        handleVariantChange(index, "configuration", e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "0.625rem 0.875rem",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "#111827",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Finish <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Black"
                      value={variant.finish}
                      onChange={(e) => handleVariantChange(index, "finish", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.625rem 0.875rem",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "#111827",
                        marginBottom: "0.5rem",
                      }}
                    >
                      SKU <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="AMP-50000-BLK-RH"
                      value={variant.sku}
                      onChange={(e) =>
                        handleVariantChange(index, "sku", e.target.value.toUpperCase())
                      }
                      style={{
                        width: "100%",
                        padding: "0.625rem 0.875rem",
                        background: "#f8fafc",
                        border: variant.sku && !validateSKU(variant.sku) ? "2px solid #dc2626" : "1px solid #e2e8f0",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                        textTransform: "uppercase",
                      }}
                    />
                    {variant.sku && !validateSKU(variant.sku) && (
                      <p style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem", margin: "0.25rem 0 0 0" }}>
                        Invalid format. Use format like: AMP-50000-BLK-RH
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "#111827",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Stock <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.625rem 0.875rem",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "#111827",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Variant Price Override
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Leave blank to use base price"
                      value={variant.price ?? ""}
                      onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.625rem 0.875rem",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "0.5rem",
              }}
            >
              Description
            </label>
            <textarea
              placeholder="Describe your product..."
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              style={{
                width: "100%",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "inherit",
                minHeight: "100px",
              }}
            />
          </div>

          {/* Status */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "0.5rem",
              }}
            >
              Status
            </label>
            <select
              value={formData.isActive ? "active" : "inactive"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isActive: e.target.value === "active",
                })
              }
              style={{
                width: "100%",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
                boxSizing: "border-box",
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Product Images Upload */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Product Images <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: (formData.images?.length || 0) < 4 ? "#dc2626" : "#6b7280",
                  fontWeight: 500,
                }}
              >
                {(formData.images?.length || 0)}/7 images
              </span>
            </div>
            {(formData.images?.length || 0) < 4 && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#dc2626",
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                  background: "#fee2e2",
                  borderRadius: "0.375rem",
                  border: "1px solid #fecaca",
                }}
              >
                ⚠️ Minimum 4 images required (currently {formData.images?.length || 0})
              </div>
            )}
            <div
              onClick={() => {
                if (!isUploadingImage && (formData.images?.length || 0) < 7) {
                  fileInputRef.current?.click();
                }
              }}
              style={{
                position: "relative",
                border: "2px dashed #d1d5db",
                borderRadius: "0.75rem",
                paddingTop: "2rem",
                paddingBottom: "2rem",
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                textAlign: "center",
                cursor:
                  isUploadingImage || (formData.images?.length || 0) >= 7
                    ? "not-allowed"
                    : "pointer",
                transition: "all 0.2s ease",
                background: "#f8fafc",
                minHeight: "100px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity:
                  isUploadingImage || (formData.images?.length || 0) >= 7
                    ? 0.6
                    : 1,
              }}
              onMouseEnter={(e) => {
                if (
                  !isUploadingImage &&
                  (formData.images?.length || 0) < 7
                ) {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "#2563eb";
                  (e.currentTarget as HTMLDivElement).style.background =
                    "#f0f9ff";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "#d1d5db";
                (e.currentTarget as HTMLDivElement).style.background =
                  "#f8fafc";
              }}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
                disabled={
                  isUploadingImage || (formData.images?.length || 0) >= 7
                }
                multiple
              />
              <Upload
                size={32}
                color="#9ca3af"
                style={{ marginBottom: "0.5rem" }}
              />
              <p
                style={{
                  fontWeight: 600,
                  color: "#111827",
                  margin: 0,
                  fontSize: "0.8125rem",
                }}
              >
                {isUploadingImage
                  ? "Uploading images..."
                  : (formData.images?.length || 0) >= 7
                    ? "Maximum images reached"
                    : "Click or drag images to upload"}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#9ca3af",
                  margin: "0.375rem 0 0",
                }}
              >
                PNG, JPG, WebP (max 5MB each) • Upload 4-7 images
              </p>
            </div>

            {/* Image Previews */}
            {(formData.images?.length || 0) > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "0.75rem",
                  marginTop: "1rem",
                }}
              >
                {formData.images?.map((url, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#f3f4f6",
                      aspectRatio: "1",
                    }}
                  >
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      onClick={() => {
                        setFormData((prev) => {
                          const nextImages = prev.images?.filter((_, i) => i !== index) || [];
                          return {
                            ...prev,
                            image: nextImages[0] || "",
                            images: nextImages,
                          };
                        });
                      }}
                      style={{
                        position: "absolute",
                        top: "0.25rem",
                        right: "0.25rem",
                        background: "rgba(0, 0, 0, 0.7)",
                        border: "none",
                        color: "white",
                        width: "1.5rem",
                        height: "1.5rem",
                        borderRadius: "50%",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        fontSize: "0.875rem",
                        transition: "background 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "rgba(0, 0, 0, 0.9)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "rgba(0, 0, 0, 0.7)";
                      }}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        footer={
          <>
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedProduct(null);
              }}
              style={{
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                color: "#4b5563",
                fontWeight: 500,
                background: "#f3f4f6",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#f3f4f6";
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              style={{
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                paddingTop: "0.625rem",
                paddingBottom: "0.625rem",
                background: "#dc2626",
                color: "white",
                fontWeight: 500,
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#b91c1c";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#dc2626";
              }}
            >
              Delete Product
            </button>
          </>
        }
      >
        {selectedProduct && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <p style={{ color: "#374151", margin: 0, fontSize: "0.9375rem" }}>
              Are you sure you want to delete{" "}
              <span style={{ fontWeight: 700, color: "#111827" }}>
                {selectedProduct.name}
              </span>
              ?
            </p>
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fee2e2",
                borderRadius: "0.75rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "1rem",
                paddingBottom: "1rem",
                display: "flex",
                gap: "0.75rem",
              }}
            >
              <AlertTriangle
                size={20}
                color="#dc2626"
                style={{ flexShrink: 0, marginTop: "0.125rem" }}
              />
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "#991b1b",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                This action cannot be undone. The product will be permanently
                removed from your catalog.
              </p>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer
        toasts={toasts}
        onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
