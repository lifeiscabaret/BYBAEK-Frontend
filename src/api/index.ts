import axios from "axios";

const apiClient = axios.create({
  //baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://bybaek-backend-awehcre3f3fpb4fg.koreacentral-01.azurewebsites.net/api",
});

export default apiClient;