import api from "../lib/api";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled";

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state?: string;
  zipCode: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface PaymentDetails {
  provider: string;
  paymentIntentId?: string;
  status: PaymentStatus;
}

// Mirrors the backend Order model shape (see CR-Backend/src/models/order.model.ts)
export interface Order {
  id: string;
  customer: OrderCustomer;
  items: OrderItem[];
  totalAmount: number;
  paymentDetails: PaymentDetails;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
}

export interface FetchOrdersParams {
  page?: number;
  limit?: number;
}

export const fetchOrders = async (
  params?: FetchOrdersParams,
): Promise<PaginatedOrdersResponse> => {
  const response = await api.get<PaginatedOrdersResponse>("/orders", {
    params,
  });
  return response.data;
};

export const fetchOrderById = async (id: string): Promise<Order> => {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
): Promise<Order> => {
  const response = await api.put<Order>(`/orders/${id}`, { status });
  return response.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await api.delete(`/orders/${id}`);
};

