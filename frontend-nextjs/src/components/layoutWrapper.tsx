/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Divider } from "@heroui/react";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isLogged,
    setAuth,
    refreshToken,
    clearAuth,
    checkAuthStatus,
    getExpiresAt,
    isTokenValid,
  } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const isAdminPage = pathname?.startsWith("/admin");

  useEffect(() => {
    console.log("Pathname:", pathname);
    console.log("Is Admin Page:", isAdminPage);
    console.log("Is Logged:", isLogged);

    const initializeAuth = async () => {
      try {
        console.log("Checking auth status...");
        await checkAuthStatus();
        console.log("Auth status checked successfully.");
      } catch (error) {
        console.error("Auth check failed:", error);
        clearAuth();
        if (pathname?.startsWith("/admin")) {
          console.log("Redirecting to /auth/signin...");
          router.push("/auth/signin");
        }
      }
    };

    initializeAuth();

    let timeoutId: NodeJS.Timeout | undefined;

    const scheduleTokenRefresh = async () => {
      console.log("Scheduling token-refresh...");
      const isValid = await isTokenValid();
      console.log("Is token valid:", isValid);

      if (!isValid) {
        console.warn("Token is invalid, clearing auth...");
        clearAuth();
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        if (pathname?.startsWith("/admin")) {
          console.log("Redirecting to /auth/signin...");
          router.push("/auth/signin");
        }
        return;
      }

      const expiresAt = getExpiresAt();
      console.log("Token expires at:", expiresAt);

      if (expiresAt) {
        const timeUntilExpiration = expiresAt - Date.now();
        console.log("Time until expiration (ms):", timeUntilExpiration);

        if (timeUntilExpiration <= 0) {
          console.warn("Token has already expired, clearing auth...");
          clearAuth();
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          if (pathname?.startsWith("/admin")) {
            console.log("Redirecting to /auth/signin...");
            router.push("/auth/signin");
          }
          return;
        }

        const bufferTime = 60 * 1000; // 1 minute
        const timeToRefresh = Math.max(timeUntilExpiration - bufferTime, 0);
        console.log("Scheduling refresh in (ms):", timeToRefresh);

        timeoutId = setTimeout(async () => {
          try {
            console.log("Refreshing token...");
            await refreshToken();
            console.log("Token refreshed successfully.");
            // Schedule the next refresh
            scheduleTokenRefresh();
          } catch (error) {
            console.error("Error refreshing token:", error);
            clearAuth();
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            if (pathname?.startsWith("/admin")) {
              console.log("Redirecting to /auth/signin...");
              router.push("/auth/signin");
            }
          }
        }, timeToRefresh);
      }
    };

    if (isLogged) {
      scheduleTokenRefresh();
    }

    return () => {
      if (timeoutId) {
        console.log("Clearing timeout...");
        clearTimeout(timeoutId);
      }
    };
  }, [
    isLogged,
    setAuth,
    refreshToken,
    clearAuth,
    checkAuthStatus,
    router,
    pathname,
    getExpiresAt,
    isTokenValid,
  ]);

  return (
    <>
      {!isAdminPage && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAdminPage && <Divider className="my-4" />}
      {!isAdminPage && <Footer />}
    </>
  );
}
