"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function Page() {
  const router = useRouter();
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      console.log("Google Callback: Processing...");
      await checkAuthStatus();
      router.replace("/"); // Để middleware quyết định chuyển hướng
    };

    handleCallback();
  }, [router, checkAuthStatus]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Processing Google login...</p>
    </div>
  );
}
