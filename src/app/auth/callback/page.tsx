// 타겟 경로: src/app/auth/callback/page.tsx
"use client";

import React, { useEffect } from "react";

export default function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const provider = params.get("provider") || "ms";

    if (window.opener) {
      window.opener.postMessage(
        provider === "insta" ? "INSTA_LOGIN_SUCCESS" : "MS_LOGIN_SUCCESS",
        "*"
      );
      window.close();
    } else {
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-bold text-gray-700">로그인 처리 중입니다...</p>
        <p className="text-sm text-gray-500 mt-2">이 창은 곧 자동으로 닫힙니다.</p>
      </div>
    </div>
  );
}
