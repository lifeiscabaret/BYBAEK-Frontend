// 타겟 경로: src/app/onboarding/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingSurvey } from '@/components/OnboardingSurvey'; 

export default function OnboardingScreen() {
  const router = useRouter();

  const finishOnboarding = () => {
    // 설문을 다 끝내거나 건너뛰면 최종적으로 대시보드로 이동
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      {/* 1. 스무고개 (OnboardingSurvey 컴포넌트 호출) */}
      <div className="w-full h-full flex items-center justify-center absolute inset-0 bg-background">
        <OnboardingSurvey 
          onFinish={finishOnboarding}
          onSkip={finishOnboarding}
        />
      </div>
    </div>
  );
}