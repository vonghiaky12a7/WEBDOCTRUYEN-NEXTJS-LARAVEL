"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Divider } from "@heroui/react";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLogged, fetchUserProfile, refreshToken, clearAuth } =
    useAuthStore();
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin") || false;

  useEffect(() => {
    if (isLogged) {
      console.log("🔹 LayoutWrapper: Fetching user profile...");

      fetchUserProfile().catch((error) => {
        console.error("🔴 Token expired! Logging out...", error);
        clearAuth();
      });

      const refreshInterval = setInterval(() => {
        if (isLogged) {
          console.log("🔄 Auto refreshing token...");
          refreshToken().catch(() => {
            console.error("🔴 Auto refresh failed! Logging out...");
            alert("Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại.");
            clearAuth();
          });
        }
      }, 110 * 60 * 1000); // 110 phút

      return () => {
        console.log("🔻 Cleaning up interval...");
        clearInterval(refreshInterval);
      };
    }
  }, [isLogged, fetchUserProfile, refreshToken, clearAuth]);

  return (
    <>
      {!isAdminPage && <Navbar />}

      <main className="flex-1">{children}</main>

      {!isAdminPage && <Divider className="my-4" />}
      {!isAdminPage && <Footer />}
    </>
  );
}
