// 타겟 경로: src/app/login/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// OnboardingSurvey 컴포넌트 경로는 실제 구조에 맞게 수정 필요
import { OnboardingSurvey } from '@/components/OnboardingSurvey'; 

type OnboardingStep = 'LOADING' | 'MS_LOGIN' | 'ONEDRIVE_QR' | 'INSTA_LOGIN' | 'SURVEY';

export default function LoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('LOADING');

  // 로딩 화면(Logo) 2초 후 MS 로그인 화면으로 자동 전환
  useEffect(() => {
    if (step === 'LOADING') {
      const timer = setTimeout(() => setStep('MS_LOGIN'), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // 완료 후 대시보드로 이동
  const finishOnboarding = () => {
    router.push('/dashboard');
  };

  // 공통 모달(팝업) 컨테이너 렌더링 함수
  const renderModalContainer = (
    title: string, 
    content: React.ReactNode, 
    onNext: () => void, 
    onSkip: () => void, 
    nextText: string = '다음'
  ) => (
    // 반투명 딤 처리 배경 (모달)
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      {/* 모달 컨테이너 */}
      <div className="w-[450px] min-h-[500px] bg-background rounded-xl shadow-lg p-large flex flex-col justify-between">
        
        {/* 상단 닫기/타이틀 영역 */}
        <div className="flex justify-between items-center mb-large">
          <h2 className="text-h2 font-bold text-text-primary">{title}</h2>
          <button onClick={onSkip} className="text-[20px] text-text-secondary hover:text-text-primary transition-colors focus:outline-none">
            ✕
          </button>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col justify-center items-center">
          {content}
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex flex-row justify-between mt-large">
          <button 
            onClick={onSkip} 
            className="flex-1 bg-[#E0E0E0] py-3 rounded-lg flex items-center justify-center mr-small text-text-primary font-bold hover:bg-gray-300 transition-colors focus:outline-none"
          >
            나중에
          </button>
          <button 
            onClick={onNext} 
            className="flex-1 bg-accent py-3 rounded-lg flex items-center justify-center ml-small text-text-inverse font-bold hover:bg-accent-dark transition-colors focus:outline-none"
          >
            {nextText}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    // 전체 배경 (연한 회색)
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      
      {/* 1. 로딩 화면 */}
      {step === 'LOADING' && (
        <div className="flex flex-col items-center">
          <div className="flex flex-row items-center mb-medium">
            <div className="relative w-12 h-12 mr-medium">
              {/* public 폴더 내에 이미지를 배치해야 함 */}
              <Image 
                src="/images/logo.png" 
                alt="BYBAEK 로고" 
                fill 
                className="object-contain"
              />
            </div>
            <span className="text-[48px] font-bold text-text-primary">BYBAEK</span>
          </div>
          <p className="text-body text-text-secondary">초기 설정 중...</p>
        </div>
      )}

      {/* 2. MS 로그인 화면 */}
      {step === 'MS_LOGIN' && renderModalContainer(
        'MS 로그인 화면',
        <>
          <p className="text-body text-text-primary text-center mb-small">보안을 위해 외부 브라우저에서 로그인을 진행합니다.</p>
          <button 
            onClick={() => window.open('https://login.microsoftonline.com/common/oauth2/v2.0/authorize?scope=service%3A%3Aaccount.microsoft.com%3A%3AMBI_SSL openid profile offline_access&response_type=code&client_id=81feaced-5ddd-41e7-8bef-3e20a2689bb7&redirect_uri=https%3A%2F%2Faccount.microsoft.com%2Fauth%2Fcomplete-signin-oauth&client-request-id=2de73f4c-17c6-4693-8b13-8e334d00b0bd&x-client-SKU=MSAL.Desktop&x-client-Ver=4.79.2.0&prompt=login&client_info=1&state=H4sIAAAAAAAEAA3LzWJDMAAA4HfZ1QHdYhyZRSI0VSHi5rd-WmWt0D399t2_t2cEi2_zRlSri_tgTkCBXiDW-z478kcLO684jUc8Bw5TUZ3clPtiDrNyGT4i_Z6Etk9DCKaMoiPKR6XIUHxoZEncdJw9XNux-tx3ElmrTTHSom1TL1ziOx1bPiylwca-0cmJRZklms6ARzNBP_l5yZugosueVl6qetU0GETrb7_XpuKVu_2KNmHCsm1JszuAxF1nmwyPSK4JxOBsp9cVvLQ0DOXkSIYt_oKFdT3xtl6loKtYmL5PiY-Ae6ketPJYKZ5e5nqmY563ji9XMo-RUIwO1QvW2ZQZhKZ-WoNM2S913Md5GT49z5lbK3b8_2t9fWCxyvdDwPbG9cWrhYdQJvk76qGhFRg4y_IpA07LeVsxDX7YSJLsVkXurvG3P8G0z7uCAQAA&msaoauth2=true&instance_aware=true&lc=1042&sso_reload=true', '_blank')}
            className="bg-accent py-[14px] px-6 rounded-lg mt-5 flex items-center justify-center shadow-sm text-text-inverse font-bold text-[15px] hover:bg-accent-dark transition-colors focus:outline-none"
          >
            Microsoft 계정으로 로그인 (브라우저 열기)
          </button>
        </>,
        () => setStep('ONEDRIVE_QR'),
        () => setStep('ONEDRIVE_QR')
      )}

      {/* 3. 원드라이브 QR 화면 */}
      {step === 'ONEDRIVE_QR' && renderModalContainer(
        'OneDrive 연동',
        <>
          <p className="text-body text-text-primary text-center mb-small">아래 QR을 찍어 OneDrive를 설치해주세요.</p>
          <p className="text-body text-text-primary text-center mb-small">이미지를 OneDrive에 올리면 자동으로 BYBAEK에 등록됩니다.</p>
          <div className="w-[150px] h-[150px] bg-[#EAEAEA] flex justify-center items-center mt-large">
            <span className="text-h2 text-text-secondary font-bold mb-small">QR 코드</span>
          </div>
        </>,
        () => setStep('INSTA_LOGIN'),
        () => setStep('INSTA_LOGIN')
      )}

      {/* 4. 인스타 연동 화면 */}
      {step === 'INSTA_LOGIN' && renderModalContainer(
        '인스타 연동',
        <>
          <p className="text-body text-text-primary text-center mb-small">Instagram Graph API 권한 부여를 위해 브라우저를 엽니다.</p>
          <button 
            onClick={() => window.open('https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1219138883682659&redirect_uri=https://bybaek.azurewebsites.net/api/instagram_business_login&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights', '_blank')}
            className="bg-accent py-[14px] px-6 rounded-lg mt-5 flex items-center justify-center shadow-sm text-text-inverse font-bold text-[15px] hover:bg-accent-dark transition-colors focus:outline-none"
          >
            Instagram 연동하기 (브라우저 열기)
          </button>
        </>,
        () => setStep('SURVEY'), 
        () => setStep('SURVEY'),
        '다음'
      )}

      {/* 5. 스무고개 (OnboardingSurvey 컴포넌트 호출) */}
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