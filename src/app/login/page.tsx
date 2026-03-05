// 타겟 경로: src/app/login/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// OnboardingSurvey 컴포넌트 경로는 실제 구조에 맞게 수정 필요
import { OnboardingSurvey } from '@/components/OnboardingSurvey'; 

type OnboardingStep = 'LOADING' | 'MS_LOGIN' | 'ONEDRIVE_QR' | 'INSTA_LOGIN' | 'SURVEY';
// MS 로그인의 3가지 상태 정의
type LoginStatus = 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' ;

export default function LoginScreen() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('LOADING');
  const [msLoginStatus, setMsLoginStatus] = useState<LoginStatus>('IDLE');

  // 로딩 화면(Logo) 2초 후 MS 로그인 화면으로 자동 전환
  useEffect(() => {
    if (step === 'LOADING') {
      const timer = setTimeout(() => setStep('MS_LOGIN'), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // 실제 백엔드 연동 시 팝업창에서 보내는 '성공' 메시지를 감지하는 리스너
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      // 팝업창에서 넘어온 메시지가 'MS_LOGIN_SUCCESS'라면 완료 처리
      if (event.data === 'MS_LOGIN_SUCCESS') {
        setMsLoginStatus('COMPLETED');
      }
    };
    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  // 완료 후 대시보드로 이동
  const finishOnboarding = () => {
    router.push('/dashboard');
  };

  // MS 로그인 버튼 클릭 핸들러
  const handleMsLoginClick = () => {
    // 1. 진행 중 상태로 UI 변경
    setMsLoginStatus('IN_PROGRESS');
    
    // 2. 프론트엔드의 콜백 주소 (현재는 로컬 테스트용, 나중에 실제 도메인으로 변경해야 해)
    const frontendCallbackUrl = encodeURIComponent('http://localhost:3000/auth/callback');
    
    // 3. 백엔드 주소 + 로그인 후 돌아올 프론트엔드 주소 합치기
    const loginUrl = `https://bybaek-backend-awehcre3f3fpb4fg.koreacentral-01.azurewebsites.net/.auth/login/aad?post_login_redirect_uri=${frontendCallbackUrl}`;

    // 4. 팝업 열기
    window.open(loginUrl, 'MS_Login_Popup', 'width=500,height=600');
  };

  // 공통 모달(팝업) 컨테이너 렌더링 함수
  const renderModalContainer = (
    title: string, 
    content: React.ReactNode, 
    onNext: () => void, 
    onSkip: () => void, 
    nextText: string = '다음',
    isNextDisabled: boolean = false
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
            disabled={isNextDisabled}
            // [수정됨] disabled 상태일 때 스타일(색상 회색, 클릭 불가) 적용
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
        <div className="flex flex-col items-center w-full px-4">
          
          {/* 상태 1: 기본 진입 (IDLE) */}
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

          {/* 상태 2: 버튼 클릭 후 진행 중 (IN_PROGRESS) */}
          {msLoginStatus === 'IN_PROGRESS' && (
            <div className="flex flex-col items-center animate-pulse">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-body text-text-primary text-center font-bold">로그인 진행 중입니다...</p>
              <p className="text-[14px] text-text-secondary text-center mt-2">
                외부 창에서 로그인이 완료되면<br />자동으로 이 화면이 넘어갑니다.
              </p>
              {/* 프론트엔드 UI 테스트용 숨김 버튼 (실제 연동 완료 후 삭제하세요) */}
              <button onClick={() => setMsLoginStatus('COMPLETED')} className="mt-8 text-xs text-gray-400 underline">
                (테스트용) 로그인 완료 강제 트리거
              </button>
            </div>
          )}

          {/* 상태 3: 인증 완료 (COMPLETED) */}
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
        msLoginStatus !== 'COMPLETED' // 👈 여기가 핵심: 완료 상태가 아니면 '다음' 버튼 비활성화
      )}

      {/* 3. 원드라이브 QR 화면 */}
      {step === 'ONEDRIVE_QR' && renderModalContainer(
        'OneDrive 연동',
        <>
          <p className="text-body text-text-primary text-center mb-small">아래 QR을 찍어 휴대폰에 OneDrive를 설치해주세요.</p>
          <p className="text-body text-text-primary text-center mb-small">로그인 → 좌측상단 로고 버튼 클릭 → 설정<br /> → 카메라 백업 → 계정 선택 → 백업켜기 확인</p>
          <p className="text-body text-text-primary text-center mb-small">이미지가 OneDrive에 올라가면<br /> 자동으로 BYBAEK에 등록됩니다.</p>
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