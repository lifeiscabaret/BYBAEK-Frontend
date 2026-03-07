"use client";

import React, { useState, useEffect } from 'react';
import { ONBOARDING_QUESTIONS, SurveyQuestion } from '../utils/constants/OnboardingData';
import apiClient from '@/api/index';
interface OnboardingSurveyProps {
  //shopId: string;
  initialQuestionId?: number;
  onFinish: (answers?: any) => void;
  onSkip: () => void;
}

/**
 * 질문 id → CosmosDB Shop 필드 매핑
 */
const QUESTION_FIELD_MAP: Record<number, string> = {
  1: "brand_tone",
  2: "preferred_styles",
  3: "exclude_conditions",
  4: "hashtag_style",
  5: "cta",
  6: "shop_intro",
  7: "forbidden_words",
  8: "rag_reference",
  9: "insta_upload_time_slot",
  10: "city",
  11: "insta_auto_upload_yn", 
  12: "insta_review_bfr_upload_yn",
  13: "insta_notice_time",
  14: "language", 
  15: "insta_upload_notice_yn"
};

export const OnboardingSurvey: React.FC<OnboardingSurveyProps> = ({ initialQuestionId, onFinish, onSkip }) => {

  const initialIndex = initialQuestionId
    ? ONBOARDING_QUESTIONS.findIndex((q) => q.id === initialQuestionId)
    : 0;

  const [currentIndex, setCurrentIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
  const isSingleEditMode = !!initialQuestionId;

  const [answers, setAnswers] = useState<Record<number, any>>({});

  const currentQuestion: SurveyQuestion = ONBOARDING_QUESTIONS[currentIndex];

  const partTitle =
    currentQuestion.category === 'PERSONAL'
      ? '개인화 설정 - 설정 탭에서 언제든지 변경 가능'
      : '앱 설정 - 설정 탭에서 언제든지 변경 가능';

  const [inputText, setInputText] = useState('');
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const shopId = "3sesac18";
        const response = await apiClient.get(`/onboarding/${shopId}`);
        const shopInfo = response.data.shop_info;

        if (shopInfo) {
          const savedAnswers: Record<number, any> = {};
          Object.entries(QUESTION_FIELD_MAP).forEach(([id, field]) => {
            if (shopInfo[field] !== undefined) {
              savedAnswers[Number(id)] = shopInfo[field];
            }
          });

          // 답변 상태 전체 저장
          setAnswers(savedAnswers);

          // [중요] 현재 수정 모달이 열린 질문의 텍스트 필드를 즉시 채워줌
          const targetId = initialQuestionId || ONBOARDING_QUESTIONS[currentIndex].id;
          const currentField = QUESTION_FIELD_MAP[targetId];
          const currentData = shopInfo[currentField];

          if (currentData !== undefined) {
            if (Array.isArray(currentData)) {
              setInputText(currentData.join(', '));
            } else {
              setInputText(String(currentData));
            }
          }
        }
      } catch (e) {
        console.error("데이터 로드 실패:", e);
      }
    };

    fetchExistingData();
  }, [initialQuestionId, currentIndex]); // 질문이 바뀔 때마다 다시 확인

  /**
   * 현재 질문이 바뀔 때 inputText 초기화
   */
  useEffect(() => {
    const currentAnswer = answers[currentQuestion.id];
    let newText = '';

    if (typeof currentAnswer === 'string' && currentQuestion.type !== 'SELECT') {
      newText = currentAnswer;
    }

    setInputText(newText);
  }, [currentQuestion.id]);

  /**
   * answers → backend 저장 구조로 변환
   */
  const convertAnswersToPayload = (answerObj: Record<number, any>) => {
    const payload: Record<string, any> = {};

    Object.entries(answerObj).forEach(([questionId, value]) => {
      const field = QUESTION_FIELD_MAP[Number(questionId)];
      if (!field) return;

      // 1. 이미 배열인 경우 (멀티 셀렉트 등) -> 그대로 유지
      if (Array.isArray(value)) {
        payload[field] = value;
      } 
      // 2. 7번 금기어이고 문자열로 들어온 경우 -> 리스트화
      else if (Number(questionId) === 7 && typeof value === 'string') {
        payload[field] = value.split(',').map(word => word.trim()).filter(word => word !== "");
      } 
      // 3. 그 외 일반 문자열
      else {
        payload[field] = value;
      }
    });

    return payload;
  };

  /**
   * API 호출 (저장)
   */
  const saveOnboarding = async (data: Record<string, any>) => {
    const shopId = "3sesac18"; // 로그인 유저 ID 고정

    try {
      // fetch 대신 SettingScreen에서 검증된 apiClient 사용
      const res = await apiClient.post(`/onboarding/${shopId}`, data);
      
      // apiClient(axios)는 2xx 범위를 벗어나면 자동으로 에러를 던지므로 
      // 별도의 res.ok 체크가 없어도 catch로 넘어갑니다.
      return res.data; 

    } catch (error: any) {
      console.error("온보딩 저장 실패:", error);
      throw new Error(error.response?.data?.message || "온보딩 저장 실패");
    }
  };

  /**
   * 다음 단계
   */
  const handleNext = async () => {
    // 현재 질문이 선택형(SELECT)이면 answers에 저장된 배열/값을 쓰고, 
    // 직접 입력형(TEXT)이면 inputText를 씁니다.
    let finalAnswer;
    if (currentQuestion.type === 'SELECT') {
      finalAnswer = answers[currentQuestion.id];
    } else {
      finalAnswer = inputText.trim() || answers[currentQuestion.id];
    }

    const updatedAnswers = { 
      ...answers, 
      [currentQuestion.id]: finalAnswer 
    };

    setAnswers(updatedAnswers);

    if (isSingleEditMode) {
      try {
        const payload = convertAnswersToPayload(updatedAnswers);
        console.log("전송될 데이터:", payload); // 🚨 여기서 데이터가 배열인지 꼭 확인하세요!
        await saveOnboarding(payload);
        onFinish(updatedAnswers);
      } catch (e) {
        console.error(e);
        alert("저장 실패");
      }
      return;
    }

    /**
     * 일반 온보딩 모드 (다음 버튼)
     */
    if (currentIndex < ONBOARDING_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setInputText('');
    } else {
      try {
        const payload = convertAnswersToPayload(updatedAnswers);
        await saveOnboarding(payload);
        onFinish(updatedAnswers);
      } catch (e) {
        alert("최종 저장 실패");
      }
    }
  };

  const handleSelect = (option: string) => {

    const currentAnswer = answers[currentQuestion.id];

    if (currentQuestion.isMultiSelect) {

      const prevSelected = Array.isArray(currentAnswer) ? currentAnswer : [];

      if (prevSelected.includes(option)) {

        setAnswers({
          ...answers,
          [currentQuestion.id]: prevSelected.filter((item) => item !== option)
        });

      } else {

        if (prevSelected.length < 3) {

          setAnswers({
            ...answers,
            [currentQuestion.id]: [...prevSelected, option]
          });

        }

      }

    } else {

      setInputText('');
      setAnswers({ ...answers, [currentQuestion.id]: option });

    }

  };

  const checkIsSelected = (option: string) => {

    const currentAnswer = answers[currentQuestion.id];

    if (currentQuestion.isMultiSelect && Array.isArray(currentAnswer)) {
      return currentAnswer.includes(option);
    }

    return currentAnswer === option;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[10000]">
      <div className="w-[450px] min-h-[500px] max-h-[80vh] bg-background rounded-xl shadow-lg p-large flex flex-col relative">
        
        <div className="flex justify-between items-start mb-large shrink-0">
          <div>
            <p className="text-[14px] text-accent font-bold mb-1">{partTitle}</p>
            <h2 className="text-h2 font-bold text-text-primary">
              {isSingleEditMode ? '프롬프트 수정' : `스무고개 (${currentIndex + 1}/${ONBOARDING_QUESTIONS.length})`}
            </h2>
          </div>
          <button onClick={onSkip} className="text-[20px] text-text-secondary hover:text-text-primary transition-colors focus:outline-none">
            ✕
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto pr-2">
          <p className="text-body font-bold text-text-primary mb-5">
            Q. {currentQuestion.question}
          </p>
          
          {(currentQuestion.type === 'SELECT' || currentQuestion.type === 'SELECT_TEXT') && (
            <div className="flex flex-col mb-3">
              {currentQuestion.options?.map((option, idx) => {
                const isSelected = checkIsSelected(option); 
                return (
                  <button 
                    key={idx} 
                    onClick={() => handleSelect(option)}
                    className={`p-medium mt-3 border rounded-lg text-left transition-colors focus:outline-none ${
                      isSelected ? 'border-accent border-[1.5px] bg-red-50' : 'border-border bg-background hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-body ${isSelected ? 'text-accent font-bold' : 'text-text-primary'}`}>
                      {isSelected ? (currentQuestion.isMultiSelect ? '☑️' : '🔘') : (currentQuestion.isMultiSelect ? '☐' : '⚪')} {option}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {(currentQuestion.type === 'TEXT' || currentQuestion.type === 'SELECT_TEXT') && (
            <div className="mt-3 flex flex-col">
              {currentQuestion.type === 'SELECT_TEXT' && (
                <span className="text-[13px] text-text-secondary mb-2">또는 직접 입력:</span>
              )}
              <textarea 
                className="w-full h-[120px] border border-border rounded-lg p-medium text-body text-text-primary placeholder:text-[#A0A0A0] resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder={currentQuestion.placeholder}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (!currentQuestion.isMultiSelect) {
                    setAnswers({ ...answers, [currentQuestion.id]: '' });
                  }
                }}
              />
            </div>
          )}
        </div>

        <div className="flex flex-row justify-between mt-large pt-2 shrink-0">
          <button 
            onClick={onSkip} 
            className="flex-1 bg-[#E0E0E0] py-3 rounded-lg flex items-center justify-center mr-small text-text-primary font-bold hover:bg-gray-300 transition-colors focus:outline-none"
          >
            취소
          </button>
          <button 
            onClick={handleNext} 
            className="flex-1 bg-accent py-3 rounded-lg flex items-center justify-center ml-small text-text-inverse font-bold hover:bg-accent-dark transition-colors focus:outline-none"
          >
            {isSingleEditMode 
              ? '수정 완료' 
              : (currentIndex === ONBOARDING_QUESTIONS.length - 1 ? '완료 및 시작' : '저장 후 다음')}
          </button>
        </div>

      </div>
    </div>
  );
};