// 타겟 경로: src/app/auth/callback/page.tsx
"use client";

import React, { useEffect, useState } from 'react';

export default function AuthCallback() {
  if (typeof window === "undefined") return;

  const searchParams = new URLSearchParams(window.location.search);
  const [statusMsg, setStatusMsg] = useState('로그인 처리 중입니다...');
  
  useEffect(() => {
    // URL에서 ?code= 값이 있는지 확인 (인스타 로그인인 경우 무조건 있음)
    const code = searchParams.get('code');

    if (code) {
      // [인스타 로그인 처리 로직]
      setStatusMsg('인스타그램 인증 코드를 백엔드로 전송 중입니다...');
      
      const sendCodeToBackend = async () => {
        try {
          // API 주소
          const BACKEND_API_URL = 'https://bybaek-backend-awehcre3f3fpb4fg.koreacentral-01.azurewebsites.net/api/login/instagram';
          
          const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code }) // 백엔드로 code를 담아서 쏨
          });

          if (response.ok) {
            // 백엔드에서 정상 처리 완료 응답이 오면
            setStatusMsg('인스타그램 연동 성공!');
            if (window.opener) {
              window.opener.postMessage('INSTA_LOGIN_SUCCESS', '*');
              setTimeout(() => window.close(), 1500);
            }
          } else {
            setStatusMsg('인스타그램 연동 실패 (백엔드 오류)');
          }
        } catch (error) {
          setStatusMsg('네트워크 오류가 발생했습니다.');
        }
      };

      sendCodeToBackend();

    } else {
      // [MS 로그인 처리 로직] (기존 로직 그대로)
      if (window.opener) {
        window.opener.postMessage('MS_LOGIN_SUCCESS', '*');
        setTimeout(() => window.close(), 1500);
      } else {
        window.location.href = '/login';
      }
    }
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-[#F5F5F5]">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">인증 처리 중</h1>
        {/* 상태에 따라 메시지가 바뀜 */}
        <p className="text-gray-600 mb-4">{statusMsg}</p> 
      </div>
    </div>
  );
}
