// 타겟 경로: src/app/login/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingSurvey } from '@/components/OnboardingSurvey'; 

// 🚨 1. 'LOADING' 단계 삭제됨
type OnboardingStep = 'MS_LOGIN' | 'ONEDRIVE_QR' | 'INSTA_LOGIN' | 'SURVEY';
type LoginStatus = 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' ;

export default function LoginScreen() {
  const router = useRouter();
  // 🚨 2. 접속하자마자 바로 MS 로그인 화면이 뜨도록 초기값을 'MS_LOGIN'으로 설정
  const [step, setStep] = useState<OnboardingStep>('MS_LOGIN');
  const [msLoginStatus, setMsLoginStatus] = useState<LoginStatus>('IDLE');
  const [instaLoginStatus, setInstaLoginStatus] = useState<LoginStatus>('IDLE');

  // 자동 전환(setTimeout) useEffect 삭제됨

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

  const handleInstaLoginClick = () => {
    setInstaLoginStatus('IN_PROGRESS'); 
    const redirectUri = encodeURIComponent('https://bybaek-frontend-dcctbxfhdnhge4ap.koreacentral-01.azurewebsites.net/auth/callback');
    const instaUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1219138883682659&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;
    window.open(instaUrl, 'Insta_Login_Popup', 'width=500,height=600');
  };

  const finishOnboarding = () => {
    // 🚨 MS와 인스타가 둘 다 완료(COMPLETED) 상태인지 확인
    if (msLoginStatus === 'COMPLETED' && instaLoginStatus === 'COMPLETED') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.removeItem('isGuest'); // 혹시 모를 Guest 기록 삭제
    } else {
      // 🚨 하나라도 건너뛰었다면 Guest 모드로 진입
      localStorage.setItem('isGuest', 'true');
      localStorage.removeItem('isLoggedIn');
    }
    router.push('/dashboard');
  };

  const handleMsLoginClick = () => {
    setMsLoginStatus('IN_PROGRESS');
    const frontendCallbackUrl = encodeURIComponent('https://bybaek-frontend-dcctbxfhdnhge4ap.koreacentral-01.azurewebsites.net/auth/callback');
    const loginUrl = `https://bybaek-backend-awehcre3f3fpb4fg.koreacentral-01.azurewebsites.net/.auth/login/aad?post_login_redirect_uri=${frontendCallbackUrl}`;
    window.open(loginUrl, 'MS_Login_Popup', 'width=500,height=600');
  };

  const renderModalContainer = (
    title: string, 
    content: React.ReactNode, 
    onNext: () => void, 
    onSkip: () => void, 
    nextText: string = '다음',
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
            나중에
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
      
      {/* 1. MS 로그인 화면 */}
      {step === 'MS_LOGIN' && renderModalContainer(
        'MS 로그인 화면',
        <div className="flex flex-col items-center w-full px-4">
          {msLoginStatus === 'IDLE' && (
            <>
              <p className="text-body text-text-primary text-center mb-5">보안을 위해 외부 브라우저에서 로그인을 진행합니다.</p>
              <button 
                onClick={handleMsLoginClick}
                className="w-full bg-accent py-[14px] rounded-lg shadow-sm text-text-inverse font-bold text-[15px] hover:bg-accent-dark transition-colors focus:outline-none"
              >
                Microsoft 계정으로 로그인
              </button>
            </>
          )}

          {msLoginStatus === 'IN_PROGRESS' && (
            <div className="flex flex-col items-center animate-pulse">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-body text-text-primary text-center font-bold">로그인 진행 중입니다...</p>
              <p className="text-[14px] text-text-secondary text-center mt-2">
                외부 창에서 로그인이 완료되면<br />자동으로 이 화면이 넘어갑니다.
              </p>
              <button onClick={() => setMsLoginStatus('COMPLETED')} className="mt-8 text-xs text-gray-400 underline">
                (테스트용) 로그인 완료 강제 트리거
              </button>
            </div>
          )}

          {msLoginStatus === 'COMPLETED' && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-600 text-3xl">✓</span>
              </div>
              <p className="text-[18px] font-bold text-text-primary">인증 완료!</p>
              <p className="text-body text-text-secondary mt-2">다음 단계를 진행해주세요.</p>
            </div>
          )}
        </div>,
        () => setStep('ONEDRIVE_QR'),
        () => setStep('ONEDRIVE_QR'),
        '다음',
        msLoginStatus !== 'COMPLETED' 
      )}

      {/* 2. 원드라이브 QR 화면 */}
      {step === 'ONEDRIVE_QR' && renderModalContainer(
        'OneDrive 연동',
        <>
          <p className="text-body text-text-primary text-center mb-small">아래 QR을 찍어 휴대폰에 OneDrive를 설치해주세요.</p>
          <p className="text-body text-text-primary text-center mb-small">로그인 → 좌측상단 로고 버튼 클릭 → 설정<br /> → 카메라 백업 → 계정 선택 → 백업켜기 확인</p>
          <p className="text-body text-text-primary text-center mb-small">사진이 OneDrive에 저장되면<br /> 자동으로 인스타용 사진을 선별하여<br /> BYBAEK에 등록합니다.</p>
          <div className="w-[150px] h-[150px] bg-[#EAEAEA] flex justify-center items-center mt-large">
            <span className="text-h2 text-text-secondary font-bold mb-small">QR 코드</span>
          </div>
        </>,
        () => setStep('INSTA_LOGIN'),
        () => setStep('INSTA_LOGIN')
      )}

      {/* 3. 인스타 연동 화면 */}
      {step === 'INSTA_LOGIN' && renderModalContainer(
        '인스타 연동',
        <div className="flex flex-col items-center w-full px-4">
          {instaLoginStatus === 'IDLE' && (
            <>
              <p className="text-body text-text-primary text-center mb-small">Instagram 연동을 위해 권한을 부여해 주세요.</p>
              <button 
                onClick={handleInstaLoginClick}
                className="w-full bg-accent py-[14px] px-6 rounded-lg mt-5 flex items-center justify-center shadow-sm text-text-inverse font-bold text-[15px] hover:bg-accent-dark transition-colors focus:outline-none"
              >
                Instagram 연동하기
              </button>
            </>
          )}

          {instaLoginStatus === 'IN_PROGRESS' && (
            <div className="flex flex-col items-center animate-pulse">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-body text-text-primary text-center font-bold">인스타그램 연동 중입니다...</p>
              <button onClick={() => setInstaLoginStatus('COMPLETED')} className="mt-8 text-xs text-gray-400 underline">
                (테스트용) 연동 완료 강제 트리거
              </button>
            </div>
          )}

          {instaLoginStatus === 'COMPLETED' && (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-600 text-3xl">✓</span>
              </div>
              <p className="text-[18px] font-bold text-text-primary">인스타그램 연동 완료!</p>
            </div>
          )}
        </div>,
        () => setStep('SURVEY'), 
        () => setStep('SURVEY'),
        '다음',
        instaLoginStatus !== 'COMPLETED'
      )}

      {/* 4. 스무고개 (OnboardingSurvey 컴포넌트 호출) */}
      {step === 'SURVEY' && (
        <div className="w-full h-full flex items-center justify-center absolute inset-0 bg-background">
          <OnboardingSurvey 
            onFinish={finishOnboarding}
            onSkip={finishOnboarding}
          />
        </div>
      )}
    </div>
  );
}