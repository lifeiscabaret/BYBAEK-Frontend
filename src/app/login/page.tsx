// 타겟 경로: src/app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import apiClient from '@/api/index';
import Image from 'next/image';

// 🚨 [유지] LANGUAGE_SELECT 단계 포함 완벽한 타입 정의
type LoginStep = 'LANGUAGE_SELECT' | 'MS_LOGIN' | 'ONEDRIVE_QR' | 'INSTA_LOGIN';
type LoginStatus = 'IDLE' | 'IN_PROGRESS' | 'COMPLETED';

// 🚨 [복구] 사장님이 깔끔하게 빼두셨던 백엔드 주소 상수!
const BACKEND_URL = 'https://bybaek-b-bzhhgzh8d2gthpb3.koreacentral-01.azurewebsites.net'

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // hydration 에러 방지 - isMounted 패턴
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

    // 페이지 로드 시 이미 언어가 설정되어 있다면 언어 선택 단계를 건너뛰고 MS_LOGIN으로 이동
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) setStep('MS_LOGIN');
  }, [isMounted]);

  // 팝업 인증 메시지 수신
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

            try {
              await new Promise(resolve => setTimeout(resolve, 1000));
              await apiClient.post('/onedrive/sync-photos', {
                root_folder_item_id: 'root',
                overwrite: false
              });
            } catch {
              // OneDrive 동기화 실패 시 무시 (이미 실행 중이거나 연동 안 됨)
            }
          }
        } catch {
          // MS 유저 동기화 실패
        }
      }
      if (event.data === 'INSTA_LOGIN_SUCCESS') {
        setInstaLoginStatus('COMPLETED');
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [isMounted]);

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
  }, [instaLoginStatus]);

  const handleLanguageSelect = (lang: 'ko' | 'en') => {
    localStorage.setItem('language', lang);
    window.location.reload();
  };

  const handleMsLoginClick = () => {
    setMsLoginStatus('IN_PROGRESS');
    const frontendCallbackUrl = encodeURIComponent(`${window.location.origin}/auth/callback`);
    // 🚨 [복구] 깔끔한 변수 사용
    const loginUrl = `${BACKEND_URL}/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(BACKEND_URL + '/api/auth/ms/callback')}&scope=openid+profile+email+Files.ReadWrite.All+offline_access`;
    window.open(loginUrl, 'MS_Login_Popup', 'width=500,height=600');
  };

  const handleInstaLoginClick = () => {
    setInstaLoginStatus('IN_PROGRESS');
    const redirectUri = encodeURIComponent(`${BACKEND_URL}/api/auth/instagram`);
    const instaUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=3357678851057487&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;
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


  if (!isMounted) return null;

  const lang = (localStorage.getItem('language') as 'ko' | 'en') || 'ko';
  const switchLang = (l: 'ko' | 'en') => {
    localStorage.setItem('language', l);
    window.location.reload();
  };

  const copyText = lang === 'ko'
    ? '간단한 설정만 하면\n마케팅이 자동으로 시작됩니다'
    : 'Simple setup.\nMarketing runs itself.';

  return (
    <>
      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #fdf0f0 50%, #F5F0EB 100%)' }}
      >
        {/* 상단 좌측: B 로고 */}
        <div className="absolute left-12 top-8 z-10">
          <Link href="/">
            <img src="/BYBAEK_icon.svg" alt="BYBAEK" className="w-10 h-10 object-contain cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        {/* 상단 우측: KR | EN */}
        <div className="absolute right-12 top-10 z-10 text-lg tracking-wide text-[#8B0000]">
          <span
            className={`cursor-pointer transition-opacity duration-300 ${lang === 'ko' ? 'font-bold opacity-100' : 'font-normal opacity-40 hover:opacity-70'}`}
            onClick={() => switchLang('ko')}
          >KR</span>
          <span className="mx-2 opacity-40">|</span>
          <span
            className={`cursor-pointer transition-opacity duration-300 ${lang === 'en' ? 'font-bold opacity-100' : 'font-normal opacity-40 hover:opacity-70'}`}
            onClick={() => switchLang('en')}
          >EN</span>
        </div>

        {/* 중앙 콘텐츠 */}
        <div className="flex flex-col items-center w-full max-w-[420px] px-6">
          {/* 워드마크 */}
          <h1
            className="text-[4rem] tracking-[0.2em] font-thin text-[#5a0000] mb-4"
            style={{ fontFamily: "'S-Core Dream', sans-serif", fontWeight: 100 }}
          >
            BYBAEK
          </h1>

          {/* 카피 텍스트 */}
          <p
            className="text-center text-[1rem] text-[#5a2a2a] whitespace-pre-line leading-relaxed mb-10"
            style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif", fontWeight: 400 }}
          >
            {copyText}
          </p>

          {/* 언어 선택 단계 */}
          {step === 'LANGUAGE_SELECT' && (
            <div
              className="w-full bg-white/80 backdrop-blur-md rounded-2xl px-10 py-10 animate-[fadeInUp_0.5s_ease_both]"
              style={{ boxShadow: '0 4px 24px rgba(139,0,0,0.06)' }}
            >
              <p className="text-center text-[0.9rem] text-[#5a2a2a] mb-7" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif", fontWeight: 400 }}>
                {lang === 'ko' ? '사용할 언어를 선택해주세요' : 'Select your language'}
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={() => handleLanguageSelect('ko')} className="w-full bg-[#8B0000] py-[15px] rounded-xl text-white text-[0.95rem] hover:bg-[#6b0000] transition-all duration-200 cursor-pointer focus:outline-none" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
                  한국어
                </button>
                <button onClick={() => handleLanguageSelect('en')} className="w-full bg-white border border-[#e8d8d8] py-[15px] rounded-xl text-[#5a2a2a] text-[0.95rem] hover:bg-[#fdf5f5] transition-all duration-200 cursor-pointer focus:outline-none" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
                  English
                </button>
              </div>
            </div>
          )}

          {/* MS 로그인 단계 */}
          {step === 'MS_LOGIN' && (
            <div
              className="w-full bg-white/80 backdrop-blur-md rounded-2xl px-10 py-10 animate-[fadeInUp_0.5s_ease_both]"
              style={{ boxShadow: '0 4px 24px rgba(139,0,0,0.06)' }}
            >
              {msLoginStatus === 'IDLE' && (
                <div className="flex flex-col items-center">
                  <button onClick={handleMsLoginClick} className="w-full flex items-center justify-center gap-3 bg-[#8B0000] py-[15px] rounded-xl text-white text-[0.95rem] hover:bg-[#6b0000] transition-all duration-200 cursor-pointer focus:outline-none mb-7" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
                    <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0" y="0" width="10" height="10" fill="#F25022"/>
                      <rect x="11" y="0" width="10" height="10" fill="#7FBA00"/>
                      <rect x="0" y="11" width="10" height="10" fill="#00A4EF"/>
                      <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
                    </svg>
                    {lang === 'ko' ? 'Microsoft로 시작하기' : 'Continue with Microsoft'}
                  </button>
                  <div className="space-y-2.5 w-full pl-1">
                    <p className="text-[0.85rem] text-[#5a2a2a] flex items-center gap-2.5" style={{ fontWeight: 400, fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
                      <span className="text-[#8B0000] text-sm">✓</span> {lang === 'ko' ? '원드라이브 사진 자동 연동' : 'Auto-sync OneDrive photos'}
                    </p>
                    <p className="text-[0.85rem] text-[#5a2a2a] flex items-center gap-2.5" style={{ fontWeight: 400, fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
                      <span className="text-[#8B0000] text-sm">✓</span> {lang === 'ko' ? '계정 하나로 모든 기능 이용' : 'All features with one account'}
                    </p>
                  </div>
                </div>
              )}
              {msLoginStatus === 'IN_PROGRESS' && (
                <div className="flex flex-col items-center py-4">
                  <div className="w-10 h-10 border-3 border-[#8B0000] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-[0.9rem] text-[#5a2a2a] text-center" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif", fontWeight: 400 }}>{t.login.in_progress}</p>
                  <button onClick={() => { localStorage.setItem('shop_id', '3sesac18'); setMsLoginStatus('COMPLETED'); }} className="mt-6 text-xs text-gray-400 underline cursor-pointer">
                    {t.login.test_trigger}
                  </button>
                </div>
              )}
              {msLoginStatus === 'COMPLETED' && (
                <div className="flex flex-col items-center py-4">
                  <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-green-600 text-2xl">✓</span>
                  </div>
                  <p className="text-[1rem] font-medium text-[#5a2a2a]">{t.login.ms_completed}</p>
                </div>
              )}
            </div>
          )}

          {/* OneDrive QR 단계 */}
          {step === 'ONEDRIVE_QR' && (
            <div
              className="w-full bg-white/80 backdrop-blur-md rounded-2xl px-10 py-10 animate-[fadeInUp_0.5s_ease_both]"
              style={{ boxShadow: '0 4px 24px rgba(139,0,0,0.06)' }}
            >
              <p className="text-[0.85rem] text-[#5a2a2a] text-center mb-4" style={{ fontWeight: 400, fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>{t.login.onedrive_desc1}</p>
              <p className="text-[0.85rem] text-[#5a2a2a] text-center mb-2" style={{ fontWeight: 400, fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
                {t.login.onedrive_desc2_1}<br />{t.login.onedrive_desc2_2}
              </p>
              <p className="text-[0.85rem] text-[#5a2a2a] text-center mb-6" style={{ fontWeight: 400, fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
                {t.login.onedrive_desc3_1}<br />{t.login.onedrive_desc3_2}
              </p>
              <div className="flex flex-row gap-5 justify-center mb-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-[100px] h-[100px] border border-[#e8d8d8] rounded-xl overflow-hidden bg-white">
                    <Image src="/images/QRcode_android.png" alt="Android QR Code" fill className="object-contain p-2" />
                  </div>
                  <span className="text-[12px] text-[#5a2a2a]" style={{ fontWeight: 400 }}>Android</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-[100px] h-[100px] border border-[#e8d8d8] rounded-xl overflow-hidden bg-white">
                    <Image src="/images/QRcode_ios.png" alt="iOS QR Code" fill className="object-contain p-2" />
                  </div>
                  <span className="text-[12px] text-[#5a2a2a]" style={{ fontWeight: 400 }}>iOS</span>
                </div>
              </div>
              <button onClick={handleOneDriveNextClick} className="w-full bg-[#8B0000] py-[15px] rounded-xl text-white text-[0.95rem] hover:bg-[#6b0000] transition-all duration-200 cursor-pointer focus:outline-none" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
                {t.login.btn_next}
              </button>
            </div>
          )}

          {/* 인스타그램 로그인 단계 */}
          {step === 'INSTA_LOGIN' && (
            <div
              className="w-full bg-white/80 backdrop-blur-md rounded-2xl px-10 py-10 animate-[fadeInUp_0.5s_ease_both]"
              style={{ boxShadow: '0 4px 24px rgba(139,0,0,0.06)' }}
            >
              {instaLoginStatus === 'IDLE' && (
                <div className="flex flex-col items-center">
                  <p className="text-[0.9rem] text-[#5a2a2a] text-center mb-7" style={{ fontWeight: 400, fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>{t.login.insta_desc}</p>
                  <button onClick={handleInstaLoginClick} className="w-full bg-[#8B0000] py-[15px] rounded-xl text-white text-[0.95rem] hover:bg-[#6b0000] transition-all duration-200 cursor-pointer focus:outline-none" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
                    {t.login.insta_btn}
                  </button>
                </div>
              )}
              {instaLoginStatus === 'IN_PROGRESS' && (
                <div className="flex flex-col items-center py-4">
                  <div className="w-10 h-10 border-3 border-[#8B0000] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-[0.9rem] text-[#5a2a2a] text-center" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif", fontWeight: 400 }}>{t.login.insta_in_progress}</p>
                  <button onClick={() => setInstaLoginStatus('COMPLETED')} className="mt-6 text-xs text-gray-400 underline cursor-pointer">{t.login.test_trigger}</button>
                </div>
              )}
              {instaLoginStatus === 'COMPLETED' && (
                <div className="flex flex-col items-center py-4">
                  <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-green-600 text-2xl">✓</span>
                  </div>
                  <p className="text-[1rem] font-medium text-[#5a2a2a]">{t.login.insta_completed}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 커스텀 알림창 UI */}
      {alertData.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[10001] backdrop-blur-sm p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-[360px] flex flex-col items-center border border-[rgba(139,0,0,0.08)]">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 shrink-0">
              <span className="text-[#8B0000] text-2xl font-bold">!</span>
            </div>
            <p className="text-[0.9rem] text-[#5a2a2a] text-center mb-6 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif", fontWeight: 400 }}>
              {alertData.message}
            </p>
            <button onClick={alertData.onConfirm} className="w-full py-3 bg-[#8B0000] text-white rounded-xl font-normal text-[1rem] cursor-pointer hover:bg-[#6b0000] transition-all duration-200 focus:outline-none" style={{ fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" }}>
              {t.common?.confirm || '확인'}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}