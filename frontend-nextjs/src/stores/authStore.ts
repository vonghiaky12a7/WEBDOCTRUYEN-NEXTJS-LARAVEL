/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/authService";
import { User } from "@/models/user";

interface AuthState {
  user: User | null;
  isLogged: boolean;
  setUser: (user: User | null) => void;
  setIsLogged: (isLogged: boolean) => void;
  login: (formData: FormData) => Promise<void>;
  signup: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLogged: false,

      setUser: (user) => set({ user }),
      setIsLogged: (isLogged) => set({ isLogged }),

      clearAuth: () => {
        localStorage.removeItem("auth-storage");
        set({ user: null, isLogged: false });
      },

      login: async (formData: FormData) => {
        console.log("Sending login data:", Object.fromEntries(formData));

        const loginResponse = await authService.login(formData);
        console.log("Login response:", loginResponse);

        await get().fetchUserProfile();
      },

      signup: async (formData) => {
        try {
          await authService.signup(formData);
        } catch (error) {
          console.error("Signup failed:", error);
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
          get().clearAuth();
        } catch (error: any) {
          console.error("Logout error:", error.response?.data || error.message);
        }
      },

      fetchUserProfile: async () => {
        try {
          const response = await authService.getProfile();
          console.log("Fetched profile:", response);
          set({ user: response, isLogged: true });
        } catch (error) {
          console.error("Fetch profile error:", error);
          get().clearAuth();
          throw error;
        }
      },

      checkAuthStatus: async () => {
        try {
          const profile = await authService.getProfile();
          console.log("Check auth status profile:", profile);
          set({ user: profile, isLogged: true });
        } catch (error) {
          console.error("Check auth status failed:", error);
          get().clearAuth();
        }
      },

      refreshToken: async () => {
        try {
          const response = await authService.refreshToken();
          console.log("Token refreshed successfully:", response);
          set({ user: response.user, isLogged: true });
        } catch (error) {
          console.error("Failed to refresh token:", error);
          get().clearAuth();
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isLogged: state.isLogged }),
    }
  )
);
