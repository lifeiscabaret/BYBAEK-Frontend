// 타겟 경로: src/app/login/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { useTranslation } from '@/hooks/useTranslation';

type LoginStep = 'MS_LOGIN' | 'ONEDRIVE_QR' | 'INSTA_LOGIN';
type LoginStatus = 'IDLE' | 'IN_PROGRESS' | 'COMPLETED';

export default function LoginScreen() {
  if (typeof window === "undefined") return null;

  const router = useRouter();
  const { t } = useTranslation();

  const searchParams = new URLSearchParams(window.location.search); 
  const isFromSidebar = searchParams.get('from') === 'sidebar';

  const [step, setStep] = useState<LoginStep>('MS_LOGIN');
  const [msLoginStatus, setMsLoginStatus] = useState<LoginStatus>('IDLE');
  const [instaLoginStatus, setInstaLoginStatus] = useState<LoginStatus>('IDLE');

  // 팝업 인증 메시지 수신
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

  // MS 인증 성공 시 자동으로 다음 단계(QR)로 넘어가게 하는 타이머
  useEffect(() => {
    if (msLoginStatus === 'COMPLETED') {
      const timer = setTimeout(() => setStep('ONEDRIVE_QR'), 1500);
      return () => clearTimeout(timer);
    }
  }, [msLoginStatus]);

  // 인스타 인증 성공 시 자동으로 최종 완료 처리하는 타이머
  useEffect(() => {
    if (instaLoginStatus === 'COMPLETED') {
      const timer = setTimeout(() => handleFinishLogin(), 1500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instaLoginStatus]);

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

  const handleFinishLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.removeItem('isGuest');
    
    if (isFromSidebar) {
      router.push('/dashboard');
    } else {
      router.push('/onboarding/intro'); 
    }
  };

  const renderModalContainer = (title: string, content: React.ReactNode) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
      <div className="w-[450px] min-h-[450px] bg-background rounded-xl shadow-2xl p-large flex flex-col relative">
        <div className="flex justify-center items-center mb-8 mt-2">
          <h2 className="text-h2 font-bold text-text-primary text-center">{title}</h2>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
          {content}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      
      {/* 1. MS 로그인 단계 */}
      {step === 'MS_LOGIN' && renderModalContainer(
        t.login.ms_title,
        <div className="flex flex-col items-center w-full px-4">
          {msLoginStatus === 'IDLE' && (
            <>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-red-500 text-3xl font-bold">!</span>
              </div>
              <p className="text-[18px] font-bold text-accent mb-4">{t.login.not_authenticated}</p>
              
              <p className="text-body text-text-primary text-center mb-8">{t.login.ms_desc}</p>
              <button onClick={handleMsLoginClick} className="w-full bg-accent py-[14px] rounded-lg shadow-sm text-text-inverse font-bold text-[15px] hover:bg-accent-dark transition-colors cursor-pointer focus:outline-none">
                {t.login.ms_btn}
              </button>
            </>
          )}
          {msLoginStatus === 'IN_PROGRESS' && (
            <div className="flex flex-col items-center animate-pulse">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-body text-text-primary text-center font-bold">{t.login.in_progress}</p>
              <button onClick={() => setMsLoginStatus('COMPLETED')} className="mt-8 text-xs text-gray-400 underline cursor-pointer">{t.login.test_trigger}</button>
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
        </div>
      )}

      {/* 2. OneDrive QR 단계 */}
      {step === 'ONEDRIVE_QR' && renderModalContainer(
        t.login.onedrive_title,
        <div className="flex flex-col items-center w-full px-4">
          <p className="text-body text-text-primary text-center mb-small">{t.login.onedrive_desc1}</p>
          <p className="text-body text-text-primary text-center mb-small">
            {t.login.onedrive_desc2_1}<br /> {t.login.onedrive_desc2_2}
          </p>
          <p className="text-body text-text-primary text-center mb-small">
            {t.login.onedrive_desc3_1}<br /> {t.login.onedrive_desc3_2}
          </p>
          
          <div className="w-[150px] h-[150px] bg-[#EAEAEA] flex justify-center items-center mt-6 mb-8">
            <span className="text-h2 text-text-secondary font-bold mb-small">{t.login.qr_code}</span>
          </div>

          {/* 🚨 QR 단계에만 존재하는 유일한 '다음' 버튼 추가! */}
          <button 
            onClick={() => setStep('INSTA_LOGIN')}
            className="w-full bg-accent py-[14px] rounded-lg shadow-sm text-text-inverse font-bold text-[15px] hover:bg-accent-dark transition-colors cursor-pointer focus:outline-none"
          >
            {t.login.btn_next}
          </button>
        </div>
      )}

      {/* 3. 인스타그램 로그인 단계 */}
      {step === 'INSTA_LOGIN' && renderModalContainer(
        t.login.insta_title,
        <div className="flex flex-col items-center w-full px-4">
          {instaLoginStatus === 'IDLE' && (
            <>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-red-500 text-3xl font-bold">!</span>
              </div>
              <p className="text-[18px] font-bold text-accent mb-4">{t.login.not_authenticated}</p>
              
              <p className="text-body text-text-primary text-center mb-small">{t.login.insta_desc}</p>
              <button onClick={handleInstaLoginClick} className="w-full bg-accent py-[14px] px-6 rounded-lg mt-5 flex items-center justify-center shadow-sm text-text-inverse font-bold text-[15px] hover:bg-accent-dark transition-colors cursor-pointer focus:outline-none">
                {t.login.insta_btn}
              </button>
            </>
          )}
          {instaLoginStatus === 'IN_PROGRESS' && (
            <div className="flex flex-col items-center animate-pulse">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-body text-text-primary text-center font-bold">{t.login.insta_in_progress}</p>
              <button onClick={() => setInstaLoginStatus('COMPLETED')} className="mt-8 text-xs text-gray-400 underline cursor-pointer">{t.login.test_trigger}</button>
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
        </div>
      )}

    </div>
  );
}