// services/authService.ts
import axiosInstance from "@/utils/axiosInstance";

export const authService = {
  login: async (formData: FormData) => {
    const response = await axiosInstance.post("/api/auth/login", formData);
    return response.data;
  },

  signup: async (formData: FormData) => {
    const response = await axiosInstance.post("/api/auth/register", formData);
    return response.data;
  },

  logout: async () => {
    await axiosInstance.post("/api/auth/logout");
  },

  getProfile: async () => {
    const response = await axiosInstance.get("/api/auth/me");
    return response.data;
  },

  requestPasswordReset: async (formData: FormData) => {
    const res = await axiosInstance.post("/api/auth/forgot-password", formData);
    return { status: res.status, message: res.data.message };
  },

  resetPassword: async (formData: FormData) => {
    const res = await axiosInstance.post("/api/auth/reset-password", formData);
    return res.data;
  },

  refreshToken: async () => {
    const response = await axiosInstance.post("/api/auth/refresh-token", null);
    return response.data;
  },
};