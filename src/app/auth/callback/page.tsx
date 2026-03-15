// 타겟 경로: src/app/auth/callback/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function AuthCallback() {
  const { t } = useTranslation();
  const [statusMsg, setStatusMsg] = useState(t.auth?.processing || "처리 중...");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (code) {
      // 인스타그램 인증 코드 처리
      setStatusMsg(t.auth?.sending_insta_code || "인스타그램 인증 코드를 백엔드로 전송 중입니다...");

      const sendCodeToBackend = async () => {
        try {
          const BACKEND_API_URL =
            'https://bybaek-backend-awehcre3f3fpb4fg.koreacentral-01.azurewebsites.net/api/auth/instagram';

          const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',   // ← MS 세션 쿠키 포함
            body: JSON.stringify({ code }),
          });

          if (response.ok) {
            setStatusMsg(t.auth?.insta_success || "인스타그램 연동 성공!");
            if (window.opener) {
              window.opener.postMessage('INSTA_LOGIN_SUCCESS', '*');
              setTimeout(() => window.close(), 1500);
            }
          } else {
            const err = await response.json().catch(() => ({}));
            console.error('[auth/callback] 인스타 연동 실패:', response.status, err);
            setStatusMsg(t.auth?.insta_fail || "인스타그램 연동 실패 (백엔드 오류)");
          }
        } catch (error) {
          console.error('[auth/callback] 네트워크 오류:', error);
          setStatusMsg(t.auth?.network_error || "네트워크 오류가 발생했습니다.");
        }
      };

      sendCodeToBackend();

    } else {
      // MS 로그인 완료 처리
      setStatusMsg("Microsoft 인증 완료!");
      if (window.opener) {
        window.opener.postMessage('MS_LOGIN_SUCCESS', '*');
        setTimeout(() => window.close(), 1500);
      } else {
        window.location.href = '/login';
      }
    }
  }, []);

  if (typeof window === "undefined") return null;

  return (
    <div className="flex h-screen items-center justify-center bg-[#F5F5F5]">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {t.auth?.auth_processing_title || "인증 처리 중"}
        </h1>
        <p className="text-gray-600 mb-4">{statusMsg}</p>
      </div>
    </div>
  );
}
