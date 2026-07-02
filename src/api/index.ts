import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api2.bybaekofficial.com/api",
  withCredentials: true,

  timeout: 60000,
});

export default apiClient;