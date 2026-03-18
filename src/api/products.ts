import api from "../lib/api";

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

// Mirrors the backend Product model shape (see CR-Backend/src/models/product.model.ts)
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  onSale?: boolean;
  image: string;
  images: string[];
  description: string;
  rating: number;
  reviews: number;
  brand: string;
  condition: string;
  skillLevel: string;
  inStock: boolean;
  stockCount: number;
  specifications: ProductSpecification[];
  customerReviews: ProductReview[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface FetchProductsParams {
  page?: number;
  limit?: number;
}

export type ProductPayload = Omit<
  Product,
  "id" | "createdAt" | "updatedAt" | "customerReviews"
>;

export const fetchProducts = async (
  params?: FetchProductsParams,
): Promise<PaginatedProductsResponse> => {
  const response = await api.get<PaginatedProductsResponse>("/products", {
    params,
  });
  return response.data;
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

export const createProduct = async (
  payload: ProductPayload,
): Promise<Product> => {
  const response = await api.post<Product>("/products", payload);
  return response.data;
};

export const updateProduct = async (
  id: string,
  payload: Partial<ProductPayload>,
): Promise<Product> => {
  const response = await api.put<Product>(`/products/${id}`, payload);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

