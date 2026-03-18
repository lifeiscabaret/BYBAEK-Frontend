// 타겟 경로: src/app/login/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import apiClient from '@/api/index';
import Image from 'next/image';

type LoginStep = 'LANGUAGE_SELECT' | 'MS_LOGIN' | 'ONEDRIVE_QR' | 'INSTA_LOGIN';
type LoginStatus = 'IDLE' | 'IN_PROGRESS' | 'COMPLETED';

const BACKEND_URL = 'https://bybaek-backend-awehcre3f3fpb4fg.koreacentral-01.azurewebsites.net';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // hydration 에러 방지 - typeof window 체크 대신 isMounted 패턴
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const [isFromSidebar, setIsFromSidebar] = useState(false);
  const [step, setStep] = useState<LoginStep>('LANGUAGE_SELECT');
  const [msLoginStatus, setMsLoginStatus] = useState<LoginStatus>('IDLE');
  const [instaLoginStatus, setInstaLoginStatus] = useState<LoginStatus>('IDLE');
  const [alertData, setAlertData] = useState<{ isOpen: boolean; message: string; onConfirm?: () => void }>({
    isOpen: false, message: ''
  });

  useEffect(() => {
    if (!isMounted) return;
    const searchParams = new URLSearchParams(window.location.search);
    setIsFromSidebar(searchParams.get('from') === 'sidebar');

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) setStep('MS_LOGIN');
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const handleAuthMessage = async (event: MessageEvent) => {
      if (event.data === 'MS_LOGIN_SUCCESS') {
        try {
          const response = await apiClient.get('/auth/me');
          const { shop_id } = response.data;

          if (shop_id) {
            localStorage.setItem('shop_id', shop_id);
            setMsLoginStatus('COMPLETED');
            console.log("Shop ID 동기화 성공:", shop_id);

            // withCredentials: true 덕분에 Azure가 헤더 자동 주입
            // 수동으로 토큰 꺼낼 필요 없음
            try {
              await new Promise(resolve => setTimeout(resolve, 1000));
              await apiClient.post('/onedrive/sync-photos', {
                root_folder_item_id: 'root',
                overwrite: false
              });
              console.log("OneDrive 동기화 시작");
            } catch (syncError) {
              console.warn("OneDrive 동기화 실패 (무시):", syncError);
            }
          }
        } catch (error) {
          console.error("MS 유저 동기화 실패:", error);
        }
      }
      if (event.data === 'INSTA_LOGIN_SUCCESS') {
        setInstaLoginStatus('COMPLETED');
      }
    };
    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [isMounted]);

  useEffect(() => {
    if (msLoginStatus === 'COMPLETED') {
      const timer = setTimeout(() => setStep('ONEDRIVE_QR'), 1500);
      return () => clearTimeout(timer);
    }
  }, [msLoginStatus]);

  useEffect(() => {
    if (instaLoginStatus === 'COMPLETED') {
      const timer = setTimeout(() => handleFinishLogin(), 1500);
      return () => clearTimeout(timer);
    }
  }, [instaLoginStatus]);

  const handleLanguageSelect = (lang: 'ko' | 'en') => {
    localStorage.setItem('language', lang);
    window.location.reload();
  };

  const handleMsLoginClick = () => {
    setMsLoginStatus('IN_PROGRESS');
    const frontendCallbackUrl = encodeURIComponent(`${window.location.origin}/auth/callback`);
    const loginUrl = `${BACKEND_URL}/.auth/login/aad?post_login_redirect_uri=${frontendCallbackUrl}`;
    window.open(loginUrl, 'MS_Login_Popup', 'width=500,height=600');
  };

  const handleInstaLoginClick = () => {
    setInstaLoginStatus('IN_PROGRESS');
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    const instaUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1219138883682659&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;
    window.open(instaUrl, 'Insta_Login_Popup', 'width=500,height=600');
  };

  const handleFinishLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.removeItem('isGuest');
    router.push(isFromSidebar ? '/dashboard' : '/onboarding/intro');
  };

  const handleOneDriveNextClick = () => {
    setAlertData({
      isOpen: true,
      message: t.login.onedrive_alert,
      onConfirm: () => {
        setAlertData({ isOpen: false, message: '' });
        setStep('INSTA_LOGIN');
      }
    });
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

  if (!isMounted) return null;

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">

        {step === 'LANGUAGE_SELECT' && renderModalContainer(
          "Language / 언어 설정",
          <div className="flex flex-col items-center w-full px-4 gap-4">
            <p className="text-body text-text-primary text-center mb-6">
              사용할 언어를 선택해주세요.<br />
              <span className="text-sm text-gray-500">Please select your preferred language.</span>
            </p>
            <button onClick={() => handleLanguageSelect('ko')} className="w-full bg-accent py-[14px] rounded-lg shadow-sm text-text-inverse font-bold text-[16px] hover:bg-accent-dark transition-colors cursor-pointer focus:outline-none">
              🇰🇷 한국어 (Korean)
            </button>
            <button onClick={() => handleLanguageSelect('en')} className="w-full bg-white border border-border py-[14px] rounded-lg shadow-sm text-text-primary font-bold text-[16px] hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none">
              🇺🇸 English (영어)
            </button>
          </div>
        )}

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
                <button onClick={() => { localStorage.setItem('shop_id', '3sesac18'); setMsLoginStatus('COMPLETED'); }} className="mt-8 text-xs text-gray-400 underline cursor-pointer">
                  {t.login.test_trigger}
                </button>
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

        {step === 'ONEDRIVE_QR' && renderModalContainer(
          t.login.onedrive_title,
          <div className="flex flex-col items-center w-full px-4">
            <p className="text-body text-text-primary text-center mb-small">{t.login.onedrive_desc1}</p>
            <p className="text-body text-text-primary text-center mb-small">
              {t.login.onedrive_desc2_1}<br />{t.login.onedrive_desc2_2}
            </p>
            <p className="text-body text-text-primary text-center mb-small">
              {t.login.onedrive_desc3_1}<br />{t.login.onedrive_desc3_2}
            </p>
            <div className="relative w-[150px] h-[150px] mt-6 mb-8 border border-border rounded-lg overflow-hidden shadow-sm">
              <Image src="/images/QRcode.png" alt="OneDrive QR Code" fill className="object-contain p-2" />
            </div>
            <button onClick={handleOneDriveNextClick} className="w-full bg-accent py-[14px] rounded-lg shadow-sm text-text-inverse font-bold text-[15px] hover:bg-accent-dark transition-colors cursor-pointer focus:outline-none">
              {t.login.btn_next}
            </button>
          </div>
        )}

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

      {alertData.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[10001] backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl shadow-2xl p-6 w-full max-w-[360px] flex flex-col items-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 shrink-0">
              <span className="text-red-500 text-2xl font-bold">!</span>
            </div>
            <p className="text-[15px] text-text-primary text-center mb-6 font-bold whitespace-pre-wrap leading-relaxed">
              {alertData.message}
            </p>
            <button onClick={alertData.onConfirm} className="w-full py-3 bg-accent text-white rounded-lg font-bold text-[15px] cursor-pointer hover:bg-accent-dark transition-colors focus:outline-none">
              {t.common?.confirm || '확인'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
