// utils/csrf.ts
import Cookies from "js-cookie";
import axiosInstance from "@/utils/axiosInstance";

export const getCsrfToken = async (): Promise<string> => {
  await axiosInstance.get("/sanctum/csrf-cookie");

  const csrfToken = Cookies.get("XSRF-TOKEN");
  console.log("CSRF token:", csrfToken);

  if (!csrfToken) {
    console.error("Lỗi: Không lấy được CSRF token");
    throw new Error("CSRF token không hợp lệ.");
  }

  return csrfToken;
};
