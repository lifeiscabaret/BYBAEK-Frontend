// 타겟 경로: src/components/OnboardingSurvey.tsx
"use client";

import React, { useState } from 'react';
// MockDB 및 데이터 상수는 기존 프로젝트와 동일한 경로에 있다고 가정합니다.
import { ONBOARDING_QUESTIONS, SurveyQuestion } from '../utils/constants/OnboardingData';
import { MockDB } from '../utils/MockDB';

interface OnboardingSurveyProps {
  onFinish: (answers: any) => void;
  onSkip: () => void;
}

export const OnboardingSurvey: React.FC<OnboardingSurveyProps> = ({ onFinish, onSkip }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({}); // 질문 ID별 답변 저장
  const [inputText, setInputText] = useState(''); // 주관식/추가입력용 임시 상태

  const currentQuestion: SurveyQuestion = ONBOARDING_QUESTIONS[currentIndex];

  // 🚨 현재 질문의 카테고리에 따른 한글 타이틀 결정
  const partTitle = currentQuestion.category === 'PERSONAL' ? '개인화 설정' : '앱 설정';

  // 답변 저장 및 다음 단계 이동
  const handleNext = () => {
    let finalAnswer = inputText.trim() || answers[currentQuestion.id];
    
    // 1. 가상 DB에 저장
    if (finalAnswer) {
      MockDB.saveAnswer(currentQuestion.id, finalAnswer);
    }

    // 2. 다음 질문 혹은 종료
    if (currentIndex < ONBOARDING_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setInputText('');
    } else {
      onFinish(MockDB.getAll()); // 전체 저장된 데이터 넘기며 종료
    }
  };

  // 객관식 선택 시 처리
  const handleSelect = (option: string) => {
    const currentAnswer = answers[currentQuestion.id];

    if (currentQuestion.isMultiSelect) {
      // 1. 중복 선택인 경우 (배열로 관리)
      const prevSelected = Array.isArray(currentAnswer) ? currentAnswer : [];
      
      if (prevSelected.includes(option)) {
        // 이미 선택된 거면 제거
        setAnswers({
          ...answers,
          [currentQuestion.id]: prevSelected.filter((item) => item !== option),
        });
      } else {
        // 새로 선택하는 거면 추가 (최대 3개 제한 예시)
        if (prevSelected.length < 3) {
          setAnswers({
            ...answers,
            [currentQuestion.id]: [...prevSelected, option],
          });
        }
      }
    } else {
        setAnswers({ ...answers, [currentQuestion.id]: option });
    }
  };

  // 🚨 선택 여부 확인 로직
  const checkIsSelected = (option: string) => {
    const currentAnswer = answers[currentQuestion.id];
    if (currentQuestion.isMultiSelect && Array.isArray(currentAnswer)) {
      return currentAnswer.includes(option);
    }
    return currentAnswer === option;
  };

  return (
    // 모달 배경 (기존 modalBackground 역할)
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      
      {/* 모달 컨테이너 (기존 modalContainer 역할) */}
      <div className="w-[450px] min-h-[500px] max-h-[80vh] bg-background rounded-xl shadow-lg p-large flex flex-col">
        
        {/* 상단 헤더: 카테고리별 타이틀 및 진행도 표시 */}
        <div className="flex justify-between items-start mb-large shrink-0">
          <div>
            <p className="text-[14px] text-accent font-bold mb-1">
              {partTitle}
            </p>
            <h2 className="text-h2 font-bold text-text-primary">
              스무고개 ({currentIndex + 1}/{ONBOARDING_QUESTIONS.length})
            </h2>
          </div>
          <button 
            onClick={onSkip} 
            className="text-[20px] text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* 본문 콘텐츠 (스크롤 영역) */}
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto pr-2">
          <p className="text-body font-bold text-text-primary mb-5">
            Q. {currentQuestion.question}
          </p>
          
          {/* 🚨 1. 객관식 (SELECT) 및 복합형 (SELECT_TEXT)의 선택지 렌더링 파트 */}
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
                      {isSelected 
                        ? (currentQuestion.isMultiSelect ? '☑️' : '🔘') 
                        : (currentQuestion.isMultiSelect ? '☐' : '⚪')
                      } {option}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 🚨 2. 주관식 (TEXT) 및 복합형 (SELECT_TEXT)의 입력창 렌더링 파트 */}
          {(currentQuestion.type === 'TEXT' || currentQuestion.type === 'SELECT_TEXT') && (
            <div className="mt-3 flex flex-col">
              {currentQuestion.type === 'SELECT_TEXT' && (
                <span className="text-[13px] text-text-secondary mb-2">
                  또는 직접 입력:
                </span>
              )}
              {/* TextInput multiline을 웹 표준인 textarea로 변환 */}
              <textarea 
                className="w-full h-[120px] border border-border rounded-lg p-medium text-body text-text-primary placeholder:text-[#A0A0A0] resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder={currentQuestion.placeholder}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex flex-row justify-between mt-large pt-2 shrink-0">
          <button 
            onClick={onSkip} 
            className="flex-1 bg-[#E0E0E0] py-3 rounded-lg flex items-center justify-center mr-small text-text-primary font-bold hover:bg-gray-300 transition-colors focus:outline-none"
          >
            나중에
          </button>
          <button 
            onClick={handleNext} 
            className="flex-1 bg-accent py-3 rounded-lg flex items-center justify-center ml-small text-text-inverse font-bold hover:bg-accent-dark transition-colors focus:outline-none"
          >
            {currentIndex === ONBOARDING_QUESTIONS.length - 1 ? '완료 및 시작' : '저장 후 다음'}
          </button>
        </div>

      </div>
    </div>
  );
};