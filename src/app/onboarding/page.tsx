// 타겟 경로: src/app/onboarding/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingSurvey } from '@/components/OnboardingSurvey';
import apiClient from '@/api/index';

export default function OnboardingScreen() {
  const router = useRouter();
  const shopId = '3sesac18'; // 🚨 테스트용 하드코딩 아이디

  // 온보딩 완료 시 실행되는 함수
  const handleFinishOnboarding = async (answers: Record<number, any>) => {
    try {
      // 1. 스케줄 데이터 파싱 (13번 문항)
      const schedule = answers[13] || {};
      const uploadTime = schedule.hour ? `${schedule.hour}:${schedule.minute} ${schedule.amPm}` : '';

      // 2. 백엔드 DB 스키마에 맞게 데이터 예쁘게 포장 (Mapping)
      const payload = {
        // 다중 선택(배열)은 묶지 않고 배열 그대로 쏩니다!
        brand_tone: Array.isArray(answers[1]) ? answers[1] : (answers[1] ? [answers[1]] : []),
        preferred_styles: Array.isArray(answers[2]) ? answers[2] : (answers[2] ? [answers[2]] : []),
        exclude_conditions: Array.isArray(answers[3]) ? answers[3] : (answers[3] ? [answers[3]] : []),
        hashtag_style: Array.isArray(answers[4]) ? answers[4] : (answers[4] ? [answers[4]] : []),
        
        // 주관식 텍스트
        cta: answers[5] || '',
        shop_intro: answers[6] || '',
        forbidden_words: Array.isArray(answers[7]) ? answers[7] : (answers[7] ? [answers[7]] : []), // JSON 보니 이것도 배열이네요!
        rag_reference: answers[8] || '',
        city: answers[9] || '',
        
        // 앱 설정
        insta_auto_upload_yn: answers[11] === '예 (추천)' ? 'Y' : 'N',
        gmail_address: answers[12] || '',
        insta_upload_time_slot: schedule.frequency || '매일',
        insta_upload_time: uploadTime,
        language: answers[14] || '한국어',
        
        is_ms_connected: true,
        is_insta_connected: true
      };

      console.log("백엔드로 전송할 데이터:", payload);

      // 3. 백엔드 API로 전송! (POST)
      await apiClient.post(`/onboarding/${shopId}`, payload);

      // 4. 전송 완료 후 대시보드로 이동
      router.push('/dashboard');

    } catch (error) {
      console.error("온보딩 데이터 저장 실패:", error);
      // 에러가 나더라도 사용자가 갇히지 않도록 대시보드로 이동
      alert("설정 저장 중 오류가 발생했습니다. 나중에 설정 화면에서 다시 저장해주세요.");
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