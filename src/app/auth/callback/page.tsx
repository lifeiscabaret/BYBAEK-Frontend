// 타겟 경로: src/app/auth/callback/page.tsx
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function AuthCallback() {
  const { t } = useTranslation();

  // 🚨 [다국어 적용] 초기 상태 메시지 설정 (옵셔널 체이닝으로 에러 방지)
  const [statusMsg, setStatusMsg] = useState(t.auth?.processing || "처리 중...");

  // 🚨 [에러 방지] OAuth 코드가 두 번 전송되는 것(React StrictMode 이슈)을 막는 방어막
  const hasFetched = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasFetched.current) return;
    hasFetched.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    const type = searchParams.get('type');
    const code = searchParams.get('code');

    if (type === 'instagram') {
      // 백엔드가 이미 처리 완료하고 리다이렉트한 것
      setStatusMsg(t.auth?.insta_success || "인스타그램 연동 성공!");
      if (window.opener) {
        window.opener.postMessage('INSTA_LOGIN_SUCCESS', window.location.origin);
        setTimeout(() => window.close(), 1500);
      }
    } else if (code) {
      // 혹시 모를 예외 처리 (현재는 안 쓰임)
      setStatusMsg(t.auth?.insta_fail || "처리 중 오류가 발생했습니다.");
    } else {
      // MS 로그인 완료
      setStatusMsg(t.auth?.ms_success || "Microsoft 인증 완료!");
      if (window.opener) {
        window.opener.postMessage('MS_LOGIN_SUCCESS', window.location.origin);
        setTimeout(() => window.close(), 1500);
      } else {
        window.location.href = '/login';
      }
    }
  }, [t]);
  // t가 바뀔 때 실행되지만, hasFetched.current 덕분에 백엔드로 코드를 중복 전송하지 않습니다.

  if (typeof window === "undefined") return null;

  return (
    <div className="flex h-screen items-center justify-center bg-[#F5F5F5]">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>

        {/* 🚨 [다국어 적용] 타이틀 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {t.auth?.auth_processing_title || "인증 처리 중"}
        </h1>
        {/* 상태 메시지 출력 부분 */}
        <p className="text-gray-600 mb-4">{statusMsg}</p>
      </div>
    </div>
  );
}