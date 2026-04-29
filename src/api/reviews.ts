import api from "../lib/api";

export interface ReviewUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ReviewProduct {
  _id: string;
  name: string;
  image: string;
}

export interface Review {
  _id: string;
  userId: ReviewUser;
  productId: ReviewProduct;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  helpful: number;
  notHelpful: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAdminReviewsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
  productId?: string;
  sortBy?: "recent" | "rating" | "product";
}

export interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const fetchAdminReviews = async (params: GetAdminReviewsParams = {}): Promise<ReviewsResponse> => {
  const { data } = await api.get("/admin/reviews", { params });
  return data;
};

export const approveReview = async (reviewId: string): Promise<void> => {
  await api.patch(`/admin/reviews/${reviewId}/approve`);
};

export const rejectReview = async (reviewId: string, rejectionReason: string): Promise<void> => {
  await api.patch(`/admin/reviews/${reviewId}/reject`, { rejectionReason });
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await api.delete(`/admin/reviews/${reviewId}`);
};
