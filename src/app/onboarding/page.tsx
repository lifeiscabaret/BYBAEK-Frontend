// 타겟 경로: src/app/onboarding/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingSurvey } from '@/components/OnboardingSurvey';
import apiClient from '@/api/index';
// 🚨 [다국어 적용] 번역 훅 추가
import { useTranslation } from '@/hooks/useTranslation';

export default function OnboardingScreen() {
  const router = useRouter();
  const shopId = '3sesac18'; // 🚨 테스트용 하드코딩 아이디

  // 🚨 [다국어 적용] 번역 객체 가져오기
  const { t } = useTranslation();

  // 온보딩 완료 시 실행되는 함수
  const handleFinishOnboarding = async (answers: Record<number, any>) => {
    try {
      // 1. 스케줄 데이터 파싱 (13번 문항)
      const schedule = answers[13] || {};
      const uploadTime = schedule.hour ? `${schedule.hour}:${schedule.minute} ${schedule.amPm}` : '';

      // 🚨 2. 언어 선택 매핑 ('한국어' -> 'ko', 'English' -> 'en')
      const languageMap: Record<string, string> = {
        '한국어': 'ko',
        'English': 'en'
      };
      // 14번 문항이 언어 선택이라고 가정 (매칭 안 되면 기본값 'ko')
      const dbLanguageCode = languageMap[answers[14]] || 'ko';

      // 🚨 3. 프론트엔드 전역 언어 설정 업데이트 (로컬 스토리지에 저장!)
      // 이렇게 해야 대시보드로 넘어갔을 때 번역 훅이 방금 선택한 언어를 읽어옵니다.
      localStorage.setItem('language', dbLanguageCode);

      // 4. 백엔드 DB 스키마에 맞게 데이터 예쁘게 포장
      const payload = {
        brand_tone: Array.isArray(answers[1]) ? answers[1] : (answers[1] ? [answers[1]] : []),
        preferred_styles: Array.isArray(answers[2]) ? answers[2] : (answers[2] ? [answers[2]] : []),
        exclude_conditions: Array.isArray(answers[3]) ? answers[3] : (answers[3] ? [answers[3]] : []),
        hashtag_style: Array.isArray(answers[4]) ? answers[4] : (answers[4] ? [answers[4]] : []),
        
        cta: answers[5] || '',
        shop_intro: answers[6] || '',
        forbidden_words: Array.isArray(answers[7]) ? answers[7] : (answers[7] ? [answers[7]] : []),
        rag_reference: answers[8] || '',
        city: answers[9] || '',
        
        insta_auto_upload_yn: answers[11] === '예 (추천)' ? 'Y' : 'N',
        gmail_address: answers[12] || '',
        insta_upload_time_slot: schedule.frequency || '매일',
        insta_upload_time: uploadTime,
        
        // 🚨 5. 백엔드에는 'ko' 또는 'en' 코드값으로 전송!
        language: dbLanguageCode,
        
        is_ms_connected: true,
        is_insta_connected: true
      };

      console.log("백엔드로 전송할 데이터:", payload);

      // 6. 백엔드 API로 전송! (POST)
      await apiClient.post(`/onboarding/${shopId}`, payload);

      // 🚨 7. 전송 완료 후 대시보드로 이동
      // (언어 설정이 완전히 리프레시되도록 단순 router.push 대신 window.location.href 사용을 강력 추천합니다!)
      window.location.href = '/dashboard';

    } catch (error) {
      console.error("온보딩 데이터 저장 실패:", error);
      // 🚨 [다국어 적용] 실패 알림창 번역
      alert(t.onboarding.error_alert);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <OnboardingSurvey
        onFinish={handleFinishOnboarding}
        onSkip={() => router.push('/dashboard')}
      />
    </div>
  );
}