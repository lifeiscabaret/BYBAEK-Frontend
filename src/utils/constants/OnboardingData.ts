// 타겟 경로: src/utils/constants/OnboardingData.ts

export type SurveyType = 'SELECT' | 'TEXT' | 'SELECT_TEXT'; 
export type SurveyCategory = 'PERSONAL' | 'APP'; // 파트 구분을 위한 카테고리 추가

export interface SurveyQuestion {
  id: number;
  category: SurveyCategory;
  type: SurveyType;
  question: string;
  isMultiSelect?: boolean; // 🚨 중복 선택 가능 여부 추가
  options?: string[];
  placeholder?: string;
}

export const ONBOARDING_QUESTIONS: SurveyQuestion[] = [
  /** * PART 1. 개인화 설정 (Personalization) 
   * 브랜드의 톤앤매너와 콘텐츠 성향을 파악합니다.
   */
  {
    id: 1,
    category: 'PERSONAL',
    type: 'SELECT',
    question: '우리 샵은 어떤 느낌인가요? (최대 3개)',
    isMultiSelect: true, // 🚨 중복 선택 활성화
    options: ['남성적/클래식', '트렌디/모던', '친근/편안', '프리미엄/고급', '미니멀', '빈티지']
  },
  {
    id: 2,
    category: 'PERSONAL',
    type: 'SELECT',
    question: '가장 강조하고 싶은 시술은 무엇인가요?',
    options: ['페이드컷', '슬릭백', '사이드파트', '수염트리밍', '가르마펌', '아이롱펌', '직접 입력']
  },
  {
    id: 3,
    category: 'PERSONAL',
    type: 'SELECT_TEXT', // 멀티 선택 + 자유 입력 형태
    question: '올리기 싫은 사진 유형이 있나요?',
    options: ['얼굴 클로즈업', '배경 지저분', '스타일링 미완성', '팀원 사진'],
    placeholder: '그 외 피하고 싶은 유형을 입력해주세요.'
  },
  {
    id: 4,
    category: 'PERSONAL',
    type: 'SELECT',
    question: '해시태그는 어떤 방향을 선호하시나요?',
    options: ['남성 헤어 전문', '지역명 포함', '감성/트렌드 태그', '전부 다']
  },
  {
    id: 5,
    category: 'PERSONAL',
    type: 'TEXT',
    question: '게시물 끝에 항상 넣고 싶은 문구(CTA)가 있나요?',
    placeholder: '예: DM으로 예약 / 전화주세요 / 네이버예약'
  },
  {
    id: 6,
    category: 'PERSONAL',
    type: 'TEXT',
    question: '가게 소개 고정 문구를 입력해주세요. (신규 고객용)',
    placeholder: '예: 10년 경력 바버샵, 남성 전문, 예약제 운영'
  },
  {
    id: 7,
    category: 'PERSONAL',
    type: 'TEXT',
    question: '절대 쓰면 안 되는 단어가 있나요?',
    placeholder: '예: 디자이너, 헤어샵 (쉼표로 구분하여 입력)'
  },
  {
    id: 8,
    category: 'PERSONAL',
    type: 'TEXT',
    question: '기존에 반응 좋았던 게시물 URL 혹은 내용을 알려주세요.',
    placeholder: '인스타 게시물 URL이나 특징을 적어주세요 (RAG 데이터 활용)'
  },
  {
    id: 9,
    category: 'PERSONAL',
    type: 'SELECT',
    question: '주로 올리는 시간대는 언제인가요?',
    options: ['오전 (09:00~12:00)', '오후 (13:00~17:00)', '저녁 (18:00~21:00)', '심야 (22:00~01:00)']
  },

  /** * PART 2. 앱 설정 (App Settings) 
   * 모두 객관식(SELECT)으로만 구성하여 빠른 설정을 유도합니다.
   */
  {
    id: 10,
    category: 'APP',
    type: 'SELECT',
    question: '자동 업로드를 활성화하시겠습니까?',
    options: ['예 (추천)', '아니오']
  },
  {
    id: 11,
    category: 'APP',
    type: 'SELECT',
    question: '게시물 검토 방식을 선택해주세요.',
    options: ['항상 내가 검토 후 업로드', '시간 되면 자동 업로드']
  },
  {
    id: 12,
    category: 'APP',
    type: 'SELECT',
    question: '업로드 전 알림을 받을까요?',
    options: ['10분 전', '30분 전', '1시간 전', '받지 않음']
  }
];