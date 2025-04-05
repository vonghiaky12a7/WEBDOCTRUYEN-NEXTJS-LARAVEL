// utils/axiosInstance.ts
import axios from "axios";


const axiosInstance = axios.create({
  baseURL: "http://localhost:8000", // Your API base URL
  withCredentials: true, // Enable sending cookies with requests
});


export default axiosInstance;