/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/authService";
import { User } from "@/models/user";
import { deleteCookie } from "cookies-next";

interface AuthState {
  user: User | null;
  isLogged: boolean;
  setUser: (user: User | null) => void;
  setIsLogged: (isLogged: boolean) => void;
  login: (formData: FormData) => Promise<void>;
  signup: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
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
        deleteCookie("auth_token");
        localStorage.removeItem("auth-storage");
        set({ user: null, isLogged: false });
      },

      login: async (formData: FormData) => {
        console.log("Sending login data:", Object.fromEntries(formData));

        const { user } = await authService.login(formData); //get user
        console.log("Login response:", user);
        set({ user: user, isLogged: true }); //set user and isLogged
      },

      signup: async (formData: FormData) => {
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

      checkAuthStatus: async () => {
        try {
          const response = await authService.getProfile();
          console.log("Check auth status profile:", response);
          set({ user: response, isLogged: true });
        } catch (error) {
          console.error("Check auth status failed:", error);
          set({ isLogged: false, user: null }); // Set isLogged to false and user to null
          throw error; // Re-throw the error to be handled in LayoutWrapper
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
