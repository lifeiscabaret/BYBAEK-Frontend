// 타겟 경로: src/app/auth/callback/page.tsx
"use client";

import React, { useEffect } from 'react';

export default function AuthCallback() {
  useEffect(() => {
    // 1. 이 창을 열어준 부모 창(window.opener)이 있는지 확인
    if (window.opener) {
      // 2. 부모 창(메인 화면)으로 'MS_LOGIN_SUCCESS'라는 메시지를 쏜다!
      // (보안상 실제 배포할 때는 '*' 대신 'https://bybaek.com' 같은 실제 도메인을 넣는 게 좋아)
      window.opener.postMessage('MS_LOGIN_SUCCESS', '*');
      
      // 3. 메시지를 쐈으니 이 팝업창은 미련 없이 닫는다.
      window.close();
    } else {
      // 만약 팝업이 아니라 그냥 탭으로 열렸을 경우를 대비한 예외 처리
      window.location.href = '/login';
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