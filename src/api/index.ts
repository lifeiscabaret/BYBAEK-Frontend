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
// 401(인증 실패/토큰 만료·무효) / 403(권한 없음) 처리.
// [전환기 진단] 백엔드 Bearer 수용이 확정되기 전까지, 401에서 자동으로 /login으로 튕기지 않는다.
//   - 이유: 로그인 직후 어떤 호출이 401을 내면 인터셉터가 즉시 리다이렉트해서 대시보드 진입 자체가 막히고,
//     "어느 요청이 왜 401인지"도 안 보였음. 지금은 실패 URL/상태를 콘솔에 남겨 원인 추적을 우선한다.
//   - 근본 원인(백엔드가 해당 엔드포인트에서 Bearer를 수용하는지)이 확정되면 자동 리다이렉트를 다시 켠다.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (typeof window !== "undefined") {
      if (status === 401) {
        // 어느 요청이 401인지 그대로 노출 (진단용).
        console.error("[auth] 401 Unauthorized:", error?.config?.url, error?.response?.data);
        // 자동 /login 리다이렉트는 전환기 동안 비활성화 (대시보드 진입 차단 방지).
        // 필요 시 아래 두 줄을 되살려 재활성화:
        //   sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        //   if (window.location.pathname !== "/login") window.location.href = "/login";
      } else if (status === 403) {
        emitToast("error", "접근 권한이 없습니다.");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
