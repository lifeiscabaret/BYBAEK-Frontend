// 타겟 경로: src/app/auth/callback/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
// 🚨 [다국어 적용] 번역 훅 불러오기
import { useTranslation } from '@/hooks/useTranslation';

export default function AuthCallback() {
  // 🚨 [다국어 적용] 번역 객체 t 장착
  const { t } = useTranslation();
  
  // 초기 상태를 번역된 텍스트로 설정
  const [statusMsg, setStatusMsg] = useState(t.auth.processing);
  
  useEffect(() => {
    // 언어가 로드된 후 초기 메시지 다시 세팅 (안전장치)
    setStatusMsg(t.auth.processing);

    // Next.js 에러 방지: 브라우저 환경에서만 URL 접근하도록 useEffect 내부로 이동
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (code) {
      // 🚨 [다국어 적용]
      setStatusMsg(t.auth.sending_insta_code);
      
      const sendCodeToBackend = async () => {
        try {
          const BACKEND_API_URL = 'https://bybaek-backend-awehcre3f3fpb4fg.koreacentral-01.azurewebsites.net/api/auth/instagram';
          
          const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code }) 
          });

          if (response.ok) {
            // 🚨 [다국어 적용]
            setStatusMsg(t.auth.insta_success);
            if (window.opener) {
              window.opener.postMessage('INSTA_LOGIN_SUCCESS', '*');
              setTimeout(() => window.close(), 1500);
            }
          } else {
            // 🚨 [다국어 적용]
            setStatusMsg(t.auth.insta_fail);
          }
        } catch (error) {
          // 🚨 [다국어 적용]
          setStatusMsg(t.auth.network_error);
        }
      };

      sendCodeToBackend();

    } else {
      if (window.opener) {
        window.opener.postMessage('MS_LOGIN_SUCCESS', '*');
        setTimeout(() => window.close(), 1500);
      } else {
        window.location.href = '/login';
      }
    }
  }, [t]); // 언어가 바뀌면 useEffect가 다시 실행되도록 의존성 배열에 t 추가

  // Next.js에서 window 객체를 안전하게 다루기 위해 early return을 방어적으로 처리
  if (typeof window === "undefined") return null; 

  return (
    <div className="flex h-screen items-center justify-center bg-[#F5F5F5]">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        
        {/* 🚨 [다국어 적용] 타이틀 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t.auth.auth_processing_title}</h1>
        {/* 상태 메시지 출력 부분 */}
        <p className="text-gray-600 mb-4">{statusMsg}</p> 
      </div>
    </div>
  );
}