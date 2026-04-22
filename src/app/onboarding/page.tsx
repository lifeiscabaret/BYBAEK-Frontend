"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingSurvey } from '@/components/OnboardingSurvey';
import apiClient from '@/api/index';
import { useTranslation } from '@/hooks/useTranslation';

export default function OnboardingScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const getShopId = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem('shop_id') || 'guest_shop'; 
    }
    return 'guest_shop';
  };

  const { t } = useTranslation();

  const handleFinishOnboarding = async (answers: Record<number, any>) => {
    if (isSubmitting) return; 
    setIsSubmitting(true);
    const shopId = getShopId(); 

    try {
      const schedule = answers[13] || {};
      const uploadTime = schedule.hour ? `${schedule.hour}:${schedule.minute} ${schedule.amPm}` : '';

      const languageMap: Record<string, string> = {
        '한국어': 'ko',
        'English': 'en'
      };
      const dbLanguageCode = languageMap[answers[14]] || 'ko';
      localStorage.setItem('language', dbLanguageCode);

      // [FIX] insta_review_bfr_upload_yn 추가
      // 자동 업로드 ON(Y) → 검토 안 함(N), 자동 업로드 OFF(N) → 검토 필요(Y)
      const isAutoUpload = answers[11] === '예 (추천)';

      const payload = {
        brand_tone: Array.isArray(answers[1]) ? answers[1] : (answers[1] ? [answers[1]] : []),
        preferred_styles: Array.isArray(answers[2]) ? answers[2] : (answers[2] ? [answers[2]] : []),
        exclude_conditions: Array.isArray(answers[3]) ? answers[3] : (answers[3] ? [answers[3]] : []),
        hashtag_style: Array.isArray(answers[4]) ? answers[4] : (answers[4] ? [answers[4]] : []),
        cta: answers[5]?.trim() || null,
        shop_intro: answers[6]?.trim() || null,
        forbidden_words: Array.isArray(answers[7]) ? answers[7] : (answers[7] ? [answers[7]] : []),
        rag_reference: answers[8]?.trim() || null,
        city: answers[9]?.trim() || null,
        
        insta_auto_upload_yn: isAutoUpload ? 'Y' : 'N',
        insta_review_bfr_upload_yn: isAutoUpload ? 'N' : 'Y',  // [FIX] 추가
        
        owner_email: answers[12]?.trim() || null,
        insta_upload_time_slot: schedule.frequency || '매일',
        insta_upload_time: uploadTime || null,
        language: dbLanguageCode,
        is_ms_connected: true,
        is_insta_connected: true
      };

      await apiClient.post(`/onboarding/${shopId}`, payload);
      window.location.href = '/dashboard';

    } catch (error) {
      console.error("온보딩 데이터 저장 실패:", error);
      setAlertMessage(t.onboarding.error_alert || "데이터 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <OnboardingSurvey
          onFinish={handleFinishOnboarding}
          onSkip={() => router.push('/dashboard')}
        />
      </div>

      {alertMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[10001] backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl shadow-2xl p-6 w-full max-w-[320px] flex flex-col items-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 shrink-0">
              <span className="text-red-500 text-2xl font-bold">!</span>
            </div>
            <p className="text-[14px] text-text-primary text-center mb-6 font-bold whitespace-pre-wrap leading-relaxed">
              {alertMessage}
            </p>
            <button 
              onClick={() => setAlertMessage(null)} 
              className="w-full py-3 bg-accent text-white rounded-lg font-bold text-[15px] cursor-pointer hover:bg-accent-dark transition-colors focus:outline-none"
            >
              {t.common?.confirm || '확인'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
