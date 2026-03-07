// 타겟 경로: src/components/OnboardingSurvey.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ONBOARDING_QUESTIONS, SurveyQuestion } from '../utils/constants/OnboardingData';
import { MockDB } from '../utils/MockDB';

interface OnboardingSurveyProps {
  initialQuestionId?: number; // 🚨 설정 화면에서 특정 질문으로 바로가기 위한 Props 추가
  onFinish: (answers?: any) => void;
  onSkip: () => void;
}

export const OnboardingSurvey: React.FC<OnboardingSurveyProps> = ({ initialQuestionId, onFinish, onSkip }) => {
  // 1. 초기 인덱스 계산 (initialQuestionId가 있으면 해당 질문 인덱스로, 없으면 0으로 시작)
  const initialIndex = initialQuestionId
    ? ONBOARDING_QUESTIONS.findIndex((q) => q.id === initialQuestionId)
    : 0;
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
  
  // 🚨 설정 화면에서 진입한 "단일 수정 모드"인지 판별
  const isSingleEditMode = !!initialQuestionId;

  // 2. 초기 답변 세팅 (MockDB에서 기존 저장된 데이터를 모두 불러와서 세팅)
  const [answers, setAnswers] = useState<Record<number, any>>(() => {
    const savedData = MockDB.getAll() as { id: number; answer: any }[];
    const loadedAnswers: Record<number, any> = {};
    savedData.forEach((item) => {
      loadedAnswers[item.id] = item.answer;
    });
    return loadedAnswers;
  });

  const currentQuestion: SurveyQuestion = ONBOARDING_QUESTIONS[currentIndex];
  const partTitle = currentQuestion.category === 'PERSONAL' ? '개인화 설정 - 설정 탭에서 언제든지 변경 가능' : '앱 설정 - 설정 탭에서 언제든지 변경 가능';

  // 3. 주관식 입력창 초기값 세팅 (텍스트 답변이 존재하면 불러오기)
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    // 이전 답변을 불러와서 세팅하는 건 '질문이 바뀔 때(currentQuestion.id)'만 딱 한 번 실행되어야 함.
    const currentAnswer = answers[currentQuestion.id];
    let newText = '';
    
    // 현재 답변이 문자열이고, 단순 객관식이 아닐 때
    if (typeof currentAnswer === 'string' && currentQuestion.type !== 'SELECT') {
      if (currentQuestion.options && !currentQuestion.options.includes(currentAnswer)) {
        newText = currentAnswer;
      } else if (!currentQuestion.options) {
        newText = currentAnswer;
      }
    }
    setInputText(newText);
    
    // 🚨 eslint 경고가 뜨더라도 answers는 의존성 배열에서 무조건 빼야 해! 
    // 안 그러면 타자 칠 때마다 초기화되는 버그가 생겨.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion.id]);
  // 답변 저장 및 다음 단계 (혹은 종료) 처리
  const handleNext = () => {
    // 입력창에 적은 글이 있으면 우선시하고, 없으면 선택된 옵션 사용
    let finalAnswer = inputText.trim() || answers[currentQuestion.id];
    
    // 1. 가상 DB에 저장
    if (finalAnswer) {
      MockDB.saveAnswer(currentQuestion.id, finalAnswer);
    }

    // 2. 🚨 단일 수정 모드면 여기서 바로 저장 후 팝업 닫기!
    if (isSingleEditMode) {
      onFinish(MockDB.getAll());
      return;
    }

    // 3. 전체 진행 모드면 다음 질문으로 이동
    if (currentIndex < ONBOARDING_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setInputText('');
    } else {
      onFinish(MockDB.getAll());
    }
  };

  // 객관식 선택 시 처리 (기존 로직 동일)
  const handleSelect = (option: string) => {
    const currentAnswer = answers[currentQuestion.id];

    if (currentQuestion.isMultiSelect) {
      const prevSelected = Array.isArray(currentAnswer) ? currentAnswer : [];
      if (prevSelected.includes(option)) {
        // 이미 선택된 거면 해제
        setAnswers({
          ...answers,
          [currentQuestion.id]: prevSelected.filter((item) => item !== option),
        });
      } else {
        
        setAnswers({
          ...answers,
          [currentQuestion.id]: [...prevSelected, option],
        });
      }
    } else {
      // 단일 선택일 경우: 새로운 객관식을 선택하면 입력창(inputText)은 비워줌
      setInputText(''); 
      setAnswers({ ...answers, [currentQuestion.id]: option });
    }
  };

  // 선택 여부 확인 로직 (기존 로직 동일)
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
        
        {/* 상단 헤더 */}
        <div className="flex justify-between items-start mb-large shrink-0">
          <div>
            <p className="text-[14px] text-accent font-bold mb-1">{partTitle}</p>
            <h2 className="text-h2 font-bold text-text-primary">
              {/* 단일 수정 모드일 때는 제목을 살짝 다르게 표시 */}
              {isSingleEditMode ? '프롬프트 수정' : `스무고개 (${currentIndex + 1}/${ONBOARDING_QUESTIONS.length})`}
            </h2>
          </div>
          <button onClick={onSkip} className="text-[20px] text-text-secondary hover:text-text-primary transition-colors focus:outline-none">
            ✕
          </button>
        </div>

        {/* 본문 콘텐츠 (질문 및 답변) */}
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
                  // 텍스트를 입력하면 객관식 선택은 해제 (단일 선택일 경우만)
                  if (!currentQuestion.isMultiSelect) {
                    setAnswers({ ...answers, [currentQuestion.id]: '' });
                  }
                }}
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
            취소
          </button>
          <button 
            onClick={handleNext} 
            className="flex-1 bg-accent py-3 rounded-lg flex items-center justify-center ml-small text-text-inverse font-bold hover:bg-accent-dark transition-colors focus:outline-none"
          >
            {/* 단일 수정 모드일 때는 '저장 완료', 아니면 '다음' */}
            {isSingleEditMode 
              ? '수정 완료' 
              : (currentIndex === ONBOARDING_QUESTIONS.length - 1 ? '완료 및 시작' : '저장 후 다음')}
          </button>
        </div>

      </div>
    </div>
  );
};