import api from "../lib/api";
import type { Order } from "./orders";
import type { Review } from "./reviews";

export interface Customer {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "user" | "customer" | "admin";
  provider: "local" | "google";
  isEmailVerified: boolean;
  isBanned: boolean;
  ordersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FetchCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CustomersResponse {
  success: boolean;
  users: Customer[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface CustomerDetailResponse {
  success: boolean;
  user: Customer;
  orders: Order[];
  reviews: Review[];
}

export const fetchCustomers = async (
  params: FetchCustomersParams = {},
): Promise<CustomersResponse> => {
  const { data } = await api.get<CustomersResponse>("/admin/users", { params });
  return data;
};

export const fetchCustomerById = async (
  id: string,
): Promise<CustomerDetailResponse> => {
  const { data } = await api.get<CustomerDetailResponse>(`/admin/users/${id}`);
  return data;
};

export const toggleCustomerBan = async (id: string): Promise<Customer> => {
  const { data } = await api.patch<{ success: boolean; user: Customer }>(
    `/admin/users/${id}/ban`,
  );
  return data.user;
};
