// 타겟 경로: src/components/TutorialTour.tsx
"use client";

import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { usePathname } from 'next/navigation';

export function TutorialTour() {
  const [run, setRun] = useState(false);
  // 🚨 1. 컴포넌트가 브라우저에 마운트되었는지 확인하는 상태 추가
  const [isMounted, setIsMounted] = useState(false); 
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true); 

    // 🚨 1회용 티켓(sessionStorage) 대신, 로컬 스토리지로 '튜토리얼 본 적 있는지' 확인
    const hasSeenTutorial = localStorage.getItem('has_seen_tutorial');

    // 튜토리얼을 본 적이 없고, 현재 위치가 대시보드라면 튜토리얼 실행!
    if (!hasSeenTutorial && pathname === '/dashboard') {
      setRun(true);
      // 🚨 실행 즉시 도장을 찍어서, F5(새로고침)를 누르거나 메뉴를 왔다 갔다 해도 다시 안 뜨게 만듭니다.
      localStorage.setItem('has_seen_tutorial', 'true');
    }
  }, [pathname]);

  // 🚨 3. 브라우저에 마운트되기 전(서버 사이드)에는 아무것도 그리지 않음! (에러 방지 핵심)
  if (!isMounted) return null;

  const steps: Step[] = [
    {
      target: '.tour-step-dashboard',
      content: '이곳은 대시보드입니다. AI 마케터의 최근 활동 요약과 오늘의 업로드 스케줄을 한눈에 확인할 수 있어요.',
      disableBeacon: true, 
    },
    {
      target: '.tour-step-preview',
      content: 'AI와 대화하며 나만의 인스타그램 게시글을 작성하고, 즉시 업로드까지 진행할 수 있는 가장 중요한 메뉴입니다!',
    },
    {
      target: '.tour-step-photos',
      content: '원드라이브와 연동되어 AI가 필터링한 모든 시술 사진들을 모아보는 창고 같은 곳입니다.',
    },
    {
      target: '.tour-step-album',
      content: '페이드컷, 펌 등 헤어 스타일별로 사진을 묶어서 나만의 깔끔한 포트폴리오 앨범을 만들어보세요.',
    },
    {
      target: '.tour-step-setting',
      content: '샵의 브랜드 톤, 피해야 할 금지어 등 AI 마케터의 기본 성격을 언제든지 이곳에서 변경할 수 있습니다.',
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      callback={handleJoyrideCallback}
      continuous={true} 
      showProgress={true} 
      showSkipButton={true} 
      styles={{
        options: {
          primaryColor: '#8A0020',
          textColor: '#1A1A1A',
          zIndex: 10000,
        },
        buttonNext: {
          borderRadius: '8px',
          fontWeight: 'bold',
        },
        buttonBack: {
          color: '#666',
        }
      }}
      locale={{
        back: '이전',
        close: '닫기',
        last: '시작하기',
        next: '다음',
        skip: '건너뛰기',
      }}
    />
  );
}