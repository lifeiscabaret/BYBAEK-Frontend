// 타겟 경로: src/app/auth/callback/page.tsx
"use client";

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthCallback() {
    const searchParams = useSearchParams();

  useEffect(() => {
    // URL에서 provider 값을 읽어옴 (예: ?provider=ms 또는 ?provider=insta)
    const provider = searchParams.get('provider') || 'ms'; 

    if (window.opener) {
      // provider에 따라 부모 창으로 다른 성공 메시지를 보냄
      if (provider === 'insta') {
        window.opener.postMessage('INSTA_LOGIN_SUCCESS', '*');
      } else {
        window.opener.postMessage('MS_LOGIN_SUCCESS', '*');
      }
      
      window.close();
    } else {
      window.location.href = '/login';
    }
  }, [searchParams]);

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