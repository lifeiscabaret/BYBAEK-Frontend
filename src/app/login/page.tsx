// 타겟 경로: src/app/login/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
// 🚨 [다국어 적용] 번역 훅 불러오기
import { useTranslation } from '@/hooks/useTranslation';

type LoginStep = 'MS_LOGIN' | 'ONEDRIVE_QR' | 'INSTA_LOGIN';
type LoginStatus = 'IDLE' | 'IN_PROGRESS' | 'COMPLETED';

export default function LoginScreen() {
  // 🚨 window 에러 방지용 (React 규칙에 맞춰 null 반환)
  if (typeof window === "undefined") return null;

  const router = useRouter();
  
  // 🚨 [다국어 적용] 번역 객체 t 가져오기
  const { t } = useTranslation();

  const searchParams = new URLSearchParams(window.location.search); 
  const isFromSidebar = searchParams.get('from') === 'sidebar';

  const [step, setStep] = useState<LoginStep>('MS_LOGIN');
  const [msLoginStatus, setMsLoginStatus] = useState<LoginStatus>('IDLE');
  const [instaLoginStatus, setInstaLoginStatus] = useState<LoginStatus>('IDLE');

  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data === 'MS_LOGIN_SUCCESS') {
        setMsLoginStatus('COMPLETED');
      }
      if (event.data === 'INSTA_LOGIN_SUCCESS') {
        setInstaLoginStatus('COMPLETED'); 
      }
    };
    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  const handleMsLoginClick = () => {
    setMsLoginStatus('IN_PROGRESS');
    const currentOrigin = window.location.origin;
    const frontendCallbackUrl = encodeURIComponent(`${currentOrigin}/auth/callback`);
    const loginUrl = `https://bybaek-backend-awehcre3f3fpb4fg.koreacentral-01.azurewebsites.net/.auth/login/aad?post_login_redirect_uri=${frontendCallbackUrl}`;
    window.open(loginUrl, 'MS_Login_Popup', 'width=500,height=600');
  };

  const handleInstaLoginClick = () => {
    setInstaLoginStatus('IN_PROGRESS'); 
    const currentOrigin = window.location.origin;
    const redirectUri = encodeURIComponent(`${currentOrigin}/auth/callback`);
    const instaUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1219138883682659&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;
    window.open(instaUrl, 'Insta_Login_Popup', 'width=500,height=600');
  };

  const handleSkipToGuest = () => {
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem('isLoggedIn');
    router.push('/dashboard');
  };

  const handleFinishLogin = () => {
    if (msLoginStatus === 'COMPLETED' && instaLoginStatus === 'COMPLETED') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.removeItem('isGuest');
      
      if (isFromSidebar) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding/intro'); 
      }
    } else {
      handleSkipToGuest();
    }
  };

  const renderModalContainer = (
    title: string, 
    content: React.ReactNode, 
    onNext: () => void, 
    onSkip: () => void, 
    nextText: string = t.login.btn_next, // 🚨 [다국어 적용] 기본값을 사전에서 가져옴
    isNextDisabled: boolean = false
  ) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="w-[450px] min-h-[500px] bg-background rounded-xl shadow-lg p-large flex flex-col justify-between">
        <div className="flex justify-between items-center mb-large">
          <h2 className="text-h2 font-bold text-text-primary">{title}</h2>
          <button onClick={onSkip} className="text-[20px] text-text-secondary hover:text-text-primary transition-colors focus:outline-none">
            ✕
          </button>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
          {content}
        </div>
        <div className="flex flex-row justify-between mt-large">
          <button 
            onClick={onSkip} 
            className="flex-1 bg-[#E0E0E0] py-3 rounded-lg flex items-center justify-center mr-small text-text-primary font-bold hover:bg-gray-300 transition-colors focus:outline-none"
          >
            {/* 🚨 [다국어 적용] 나중에 */}
            {t.login.btn_later}
          </button>
          <button 
            onClick={onNext} 
            disabled={isNextDisabled}
            className={`flex-1 py-3 rounded-lg flex items-center justify-center font-bold transition-colors focus:outline-none ${
              isNextDisabled 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-accent text-text-inverse hover:bg-accent-dark'
            }`}
          >
            {nextText}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      
      {step === 'MS_LOGIN' && renderModalContainer(
        t.login.ms_title, // 🚨 [다국어 적용]
        <div className="flex flex-col items-center w-full px-4">
          {msLoginStatus === 'IDLE' && (
            <>
              <p className="text-body text-text-primary text-center mb-5">{t.login.ms_desc}</p>
              <button onClick={handleMsLoginClick} className="w-full bg-accent py-[14px] rounded-lg shadow-sm text-text-inverse font-bold text-[15px] hover:bg-accent-dark transition-colors focus:outline-none">
                {t.login.ms_btn}
              </button>
            </>
          )}
          {msLoginStatus === 'IN_PROGRESS' && (
            <div className="flex flex-col items-center animate-pulse">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-body text-text-primary text-center font-bold">{t.login.in_progress}</p>
              <button onClick={() => setMsLoginStatus('COMPLETED')} className="mt-8 text-xs text-gray-400 underline">{t.login.test_trigger}</button>
            </div>
          )}
          {msLoginStatus === 'COMPLETED' && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-600 text-3xl">✓</span>
              </div>
              <p className="text-[18px] font-bold text-text-primary">{t.login.ms_completed}</p>
            </div>
          )}
        </div>,
        () => setStep('ONEDRIVE_QR'),
        handleSkipToGuest,
        t.login.btn_next, // 🚨 [다국어 적용]
        msLoginStatus !== 'COMPLETED' 
      )}

      {step === 'ONEDRIVE_QR' && renderModalContainer(
        t.login.onedrive_title, // 🚨 [다국어 적용]
        <>
          <p className="text-body text-text-primary text-center mb-small">{t.login.onedrive_desc1}</p>
          {/* 🚨 [다국어 적용] <br /> 기준으로 문장 분리 */}
          <p className="text-body text-text-primary text-center mb-small">
            {t.login.onedrive_desc2_1}<br /> {t.login.onedrive_desc2_2}
          </p>
          <p className="text-body text-text-primary text-center mb-small">
            {t.login.onedrive_desc3_1}<br /> {t.login.onedrive_desc3_2}
          </p>
          <div className="w-[150px] h-[150px] bg-[#EAEAEA] flex justify-center items-center mt-large">
            <span className="text-h2 text-text-secondary font-bold mb-small">{t.login.qr_code}</span>
          </div>
        </>,
        () => setStep('INSTA_LOGIN'),
        handleSkipToGuest
      )}

      {step === 'INSTA_LOGIN' && renderModalContainer(
        t.login.insta_title, // 🚨 [다국어 적용]
        <div className="flex flex-col items-center w-full px-4">
          {instaLoginStatus === 'IDLE' && (
            <>
              <p className="text-body text-text-primary text-center mb-small">{t.login.insta_desc}</p>
              <button onClick={handleInstaLoginClick} className="w-full bg-accent py-[14px] px-6 rounded-lg mt-5 flex items-center justify-center shadow-sm text-text-inverse font-bold text-[15px] hover:bg-accent-dark transition-colors focus:outline-none">
                {t.login.insta_btn}
              </button>
            </>
          )}
          {instaLoginStatus === 'IN_PROGRESS' && (
            <div className="flex flex-col items-center animate-pulse">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-body text-text-primary text-center font-bold">{t.login.insta_in_progress}</p>
              <button onClick={() => setInstaLoginStatus('COMPLETED')} className="mt-8 text-xs text-gray-400 underline">{t.login.test_trigger}</button>
            </div>
          )}
          {instaLoginStatus === 'COMPLETED' && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-600 text-3xl">✓</span>
              </div>
              <p className="text-[18px] font-bold text-text-primary">{t.login.insta_completed}</p>
            </div>
          )}
        </div>,
        handleFinishLogin,
        handleSkipToGuest,
        t.login.btn_complete, // 🚨 [다국어 적용] 완료 버튼
        instaLoginStatus !== 'COMPLETED'
      )}

    </div>
  );
}