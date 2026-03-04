// 타겟 경로: src/utils/MockDB.ts
import { ONBOARDING_QUESTIONS } from './constants/OnboardingData'; // 기존 상수 데이터 경로 유지

export interface SavedAnswer {
  id: number;
  question: string;
  answer: string | string[];
}

// 로컬 스토리지에 저장될 키 이름
const STORAGE_KEY = 'bybaek_mock_db';

// [핵심] Next.js SSR 환경 에러 방지: 현재 코드가 브라우저에서 실행 중인지 확인
const isBrowser = typeof window !== 'undefined';

// 로컬 스토리지에서 데이터 불러오기 헬퍼 함수
const loadStorage = (): Record<number, SavedAnswer> => {
  if (!isBrowser) return {};
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

// 로컬 스토리지에 데이터 저장 헬퍼 함수
const saveToStorage = (data: Record<number, SavedAnswer>) => {
  if (isBrowser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const MockDB = {
  // 답변 저장
  saveAnswer: (id: number, answer: string | string[]) => {
    const mockStorage = loadStorage(); // 기존 데이터 불러오기
    const question = ONBOARDING_QUESTIONS.find(q => q.id === id)?.question || '';
    
    // 데이터 갱신
    mockStorage[id] = { id, question, answer };
    saveToStorage(mockStorage); // 로컬 스토리지에 다시 저장
    
    console.log(`[DB 저장] ${id}번 질문 완료:`, answer);
  },

  // 특정 ID의 답변 가져오기
  getAnswer: (id: number) => {
    const mockStorage = loadStorage();
    return mockStorage[id]?.answer;
  },

  // 전체 데이터 가져오기
  getAll: () => {
    const mockStorage = loadStorage();
    return Object.values(mockStorage);
  },

  // PERSONAL 답변들을 조합하여 '시스템 프롬프트' 생성 (한글 문자열 보존)
  generateSystemPrompt: () => {
    const pAnswers = loadStorage();
    if (Object.keys(pAnswers).length === 0) return '당신은 바버샵 마케팅 전문가입니다... (데이터 없음)';

    return `당신은 바버샵 마케팅 전문가입니다. 
우리 샵의 분위기는 [${pAnswers[1]?.answer || '미지정'}]이며, 
가장 강조할 시술은 [${pAnswers[2]?.answer || '미지정'}]입니다. 
[${pAnswers[3]?.answer || '없음'}] 유형의 사진은 배제하고, 
해시태그는 [${pAnswers[4]?.answer || '기본'}] 방향으로 작성하세요. 
게시물 끝에는 반드시 "${pAnswers[5]?.answer || ''}" 문구를 넣으세요.
가게 소개 고정 문구는 [${pAnswers[6]?.answer || '없음'}]입니다.
금기어는 [${pAnswers[7]?.answer || '없음'}]입니다.
예시 게시물은 [${pAnswers[8]?.answer || '없음'}]입니다.
주로 올리는 시간대는 [${pAnswers[9]?.answer || '미지정'}]입니다.`;
  }
};