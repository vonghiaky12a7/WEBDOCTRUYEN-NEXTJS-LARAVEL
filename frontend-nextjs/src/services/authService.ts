/* eslint-disable @typescript-eslint/no-explicit-any */
// services/authService.ts
import { useAuthStore } from "@/stores/authStore";
import axiosInstance from "@/utils/axiosInstance";

export const authService = {
  login: async (formData: FormData) => {
    const response = await axiosInstance.post("/api/auth/login", formData);
    const user = response.data.user; // Get user from response
    return { user }; //return user
  },

  signup: async (formData: FormData) => {
    try {
      console.log("📤 Sending signup data:", Object.fromEntries(formData));
      const response = await axiosInstance.post("/api/auth/register", formData);
      console.log("✅ Signup success:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Signup error:", error.response?.data || error.message);
      throw error;
    }
  },

  logout: async () => {
    await axiosInstance
      .post("/api/auth/logout")
      .catch((error) =>
        console.error("Logout error:", error.response?.data || error.message)
      );
  },

  getProfile: async () => {
    try {
      const response = await axiosInstance.get("/api/me");
      return response.data;
    } catch (error: any) {
      console.error("Get profile error:", error);
      if (error.response?.status === 401) {
        useAuthStore.getState().clearAuth();
      }
      throw new Error(error.response?.data?.message || "Failed to get profile");
    }
  },

  requestPasswordReset: async (formData: FormData) => {
    try {
      const res = await axiosInstance.post(
        "/api/auth/forgot-password",
        formData
      );
      return { status: res.status, message: res.data.message };
    } catch (error: any) {
      console.error("Error requesting password reset:", error);
      return {
        status: error.response?.status || 500,
        message: error.response?.data?.message || "Something went wrong.",
      };
    }
  },

  resetPassword: async (formData: FormData) => {
    try {
      console.log("Gọi hàm resetPassword");
      const res = await axiosInstance.post(
        "/api/auth/reset-password",
        formData
      );
      return res.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Password reset failed."
      );
    }
  },

  refreshToken: async () => {
    try {
      const response = await axiosInstance.post(
        "/api/auth/refresh-token",
        null
      );
      console.log("Refresh token response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Refresh token error:", error);
      useAuthStore.getState().clearAuth();
      throw new Error(
        error.response?.data?.message || "Failed to refresh token."
      );
    }
  },
};
