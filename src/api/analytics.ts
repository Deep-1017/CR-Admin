import api from "../lib/api";

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface RevenueAnalyticsResponse {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  dailyRevenue: RevenuePoint[];
  pipeline: unknown[];
}

export interface OrdersAnalyticsResponse {
  startDate: string;
  endDate: string;
  totalOrders: number;
  byStatus: {
    Processing: number;
    Shipped: number;
    Delivered: number;
    Cancelled: number;
  };
  pipeline: unknown[];
}

export interface TopProduct {
  productId: string;
  name: string;
  unitsSold: number;
  totalRevenue: number;
}

export interface TopProductsAnalyticsResponse {
  limit: number;
  topProducts: TopProduct[];
  pipeline: unknown[];
}

export interface CustomersAnalyticsResponse {
  startDate: string;
  endDate: string;
  totalCustomers: number;
  newSignups: number;
  pipeline: unknown[];
}

export interface DateRangeParams {
  startDate: string;
  endDate: string;
}

export const fetchRevenueAnalytics = async (
  params: DateRangeParams,
): Promise<RevenueAnalyticsResponse> => {
  const response = await api.get<RevenueAnalyticsResponse>("/admin/analytics/revenue", {
    params,
  });
  return response.data;
};

export const fetchOrdersAnalytics = async (
  params: DateRangeParams,
): Promise<OrdersAnalyticsResponse> => {
  const response = await api.get<OrdersAnalyticsResponse>("/admin/analytics/orders", {
    params,
  });
  return response.data;
};

export const fetchTopProductsAnalytics = async (
  limit = 5,
): Promise<TopProductsAnalyticsResponse> => {
  const response = await api.get<TopProductsAnalyticsResponse>(
    "/admin/analytics/top-products",
    {
      params: { limit },
    },
  );
  return response.data;
};

export const fetchCustomersAnalytics = async (
  params: DateRangeParams,
): Promise<CustomersAnalyticsResponse> => {
  const response = await api.get<CustomersAnalyticsResponse>(
    "/admin/analytics/customers",
    {
      params,
    },
  );
  return response.data;
};
