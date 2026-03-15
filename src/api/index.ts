import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://bybaek-backend-awehcre3f3fpb4fg.koreacentral-01.azurewebsites.net/api",
  withCredentials: true,  // Azure Easy Auth 세션 쿠키 자동 포함
});

export default apiClient;