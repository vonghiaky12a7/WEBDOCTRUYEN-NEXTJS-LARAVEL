import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/authService";
import { User } from "@/models/user";
import { deleteCookie, getCookie } from "cookies-next";

interface AuthState {
  user: User | null;
  isLogged: boolean;
  setAuth: (user: User | null, isLogged: boolean) => void;
  login: (formData: FormData) => Promise<void>;
  signup: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearAuth: () => void;
  getExpiresAt: () => number | null;
  isTokenValid: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLogged: false,

      setAuth: (user, isLogged) => {
        set({ user, isLogged });
      },

      clearAuth: () => {
        deleteCookie("access_token");
        deleteCookie("refresh_token");
        deleteCookie("expires_at");
        deleteCookie("role_id");
        localStorage.removeItem("auth-storage");
        set({ user: null, isLogged: false });
      },

      login: async (formData) => {
        const { user } = await authService.login(formData);
        set({ user, isLogged: true });
      },

      signup: async (formData) => {
        await authService.signup(formData);
      },

      logout: async () => {
        await authService.logout();
        get().clearAuth();
      },

      isTokenValid: async () => {
        const expiresAt = getCookie("expires_at");
        if (!expiresAt) return false;
        const expiresAtNum = parseInt(expiresAt as string);
        return Date.now() < expiresAtNum;
      },

      checkAuthStatus: async () => {
        const isValid = await get().isTokenValid();
        if (!isValid) {
          try {
            await get().refreshToken(); // Thử refresh nếu token hết hạn
          } catch (error) {
            get().clearAuth();
            throw error;
          }
        }

        const currentUser = get().user;
        if (!currentUser) {
          try {
            const user = await authService.getProfile();
            set({ user, isLogged: true });
          } catch (error) {
            console.error("Error fetching user profile:", error);
            get().clearAuth();
            throw error;
          }
        } else {
          set({ isLogged: true });
        }
      },

      refreshToken: async () => {
        try {
          const { user } = await authService.refreshToken();
          set({ user, isLogged: true });
        } catch (error) {
          console.error("Refresh token failed:", error);
          get().clearAuth();
          throw error;
        }
      },

      getExpiresAt: () => {
        const expiresAt = getCookie("expires_at");
        return expiresAt ? parseInt(expiresAt as string) : null;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isLogged: state.isLogged }),
    }
  )
);
