// utils/axiosInstance.ts
import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // Important for sending cookies in requests
});

// Add a request interceptor to automatically include CSRF token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get CSRF token from cookies
    const csrfToken = Cookies.get("XSRF-TOKEN");

    // If we don't have a CSRF token and this is not a request to get one
    if (!csrfToken && !config.url?.includes("/sanctum/csrf-cookie")) {
      // Fetch a new CSRF token
      await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sanctum/csrf-cookie`,
        {
          withCredentials: true,
        }
      );

      // Now get the token from cookies
      const newToken = Cookies.get("XSRF-TOKEN");
      if (newToken) {
        config.headers["X-XSRF-TOKEN"] = newToken;
      }
    } else if (csrfToken) {
      // If we already have a token, include it in the request
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
