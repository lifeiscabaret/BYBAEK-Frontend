import axios from "axios";
import { emitToast } from "@/components/Toast";

// 세션 토큰 저장 키 (로그인 시 /auth/me 응답의 access_token을 sessionStorage에 저장)
export const ACCESS_TOKEN_KEY = "access_token";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api2.bybaekofficial.com/api",
  // Bearer 토큰 방식으로 전환 — Easy Auth 쿠키 의존 제거 (stale 쿠키/시크릿창 403 근본 원인).
  timeout: 200000,
});

// ── 요청 인터셉터: 모든 백엔드 호출에 Authorization: Bearer <token> 자동 첨부 ──
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── 응답 인터셉터: 401/403 통일 처리 ──
// 401(인증 실패/토큰 만료·무효) → 토큰 정리 후 로그인 페이지로 이동
// 403(다른 샵 접근 등 권한 없음) → 토스트만 표시
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (typeof window !== "undefined") {
      if (status === 401) {
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        // 이미 로그인 페이지면 리다이렉트 생략 (무한 루프 방지)
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      } else if (status === 403) {
        emitToast("error", "접근 권한이 없습니다.");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
