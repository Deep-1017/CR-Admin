import api from "../lib/api";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const changePassword = async (
  payload: ChangePasswordPayload,
): Promise<void> => {
  await api.patch("/auth/change-password", payload);
};
