// 타겟 경로: src/utils/constants/OnboardingData.ts

export type SurveyType = 'SELECT' | 'TEXT' | 'SELECT_TEXT' | 'SCHEDULE'; 
export type SurveyCategory = 'PERSONAL' | 'APP'; 

export interface SurveyQuestion {
  id: number;
  category: SurveyCategory;
  type: SurveyType;
  question: string;
  isMultiSelect?: boolean; 
  options?: string[];
  placeholder?: string;
}

export const ONBOARDING_QUESTIONS: SurveyQuestion[] = [
  /** * PART 1. 개인화 설정 (Personalization) */
  {
    id: 1,
    category: 'PERSONAL',
    type: 'SELECT_TEXT', // 🚨 SELECT -> SELECT_TEXT 로 변경
    question: '우리 샵은 어떤 느낌인가요?', // 🚨 (최대 3개) 문구 삭제
    isMultiSelect: true, 
    options: ['남성적/클래식', '트렌디/모던', '친근/편안', '프리미엄/고급', '미니멀', '빈티지'],
    placeholder: '그 외 느낌을 직접 입력해주세요.' // 🚨 입력창 안내 문구 추가
  },
  {
    id: 2,
    category: 'PERSONAL',
    type: 'SELECT_TEXT', // 🚨 SELECT -> SELECT_TEXT 로 변경
    question: '가장 강조하고 싶은 시술은 무엇인가요?',
    isMultiSelect: true, // 🚨 다중 선택 추가
    options: ['페이드컷', '슬릭백', '사이드파트', '수염트리밍', '가르마펌', '아이롱펌'], // '직접 입력' 옵션 제거
    placeholder: '그 외 시술을 직접 입력해주세요.' // 🚨 입력창 안내 문구 추가
  },
  {
    id: 3,
    category: 'PERSONAL',
    type: 'SELECT_TEXT', 
    question: '올리기 싫은 사진 유형이 있나요?',
    isMultiSelect: true, // 🚨 다중 선택 명시
    options: ['얼굴 클로즈업', '배경 지저분', '스타일링 미완성', '팀원 사진'],
    placeholder: '그 외 피하고 싶은 유형을 입력해주세요.'
  },
  {
    id: 4,
    category: 'PERSONAL',
    type: 'SELECT_TEXT', // 🚨 SELECT -> SELECT_TEXT 로 변경
    question: '해시태그는 어떤 방향을 선호하시나요?',
    isMultiSelect: true, // 🚨 다중 선택 추가
    options: ['남성 헤어 전문', '지역명 포함', '감성/트렌드 태그'],
    placeholder: '그 외 선호하는 방향을 입력해주세요.' // 🚨 입력창 안내 문구 추가
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
    id: 10,
    category: 'PERSONAL',
    type: 'TEXT',
    question: '샵의 위치는 어디인가요? (도시까지 입력)',
    placeholder: '예: 서울 강남구, 부산 해운대구'
  },

  /** * PART 2. 앱 설정 (App Settings) */
  {
    id: 11,
    category: 'APP',
    type: 'SELECT',
    question: '자동 업로드를 활성화하시겠습니까?\n활성화하면 업로드 30분 전 메일을 보냅니다.',
    options: ['예 (추천)', '아니오']
  },
  {
    id: 13,
    category: 'APP',
    type: 'SCHEDULE',
    question: '원하시는 업로드 스케줄을 설정해주세요.',
  },
  {
    id: 12,
    category: 'APP',
    type: 'TEXT',
    question: '알람을 받을 메일 주소를 입력해주세요',
    placeholder: '예: example@gmail.com'
  },
  {
    id: 14,
    category: 'APP',
    type: 'SELECT',
    question: '사용하는 언어를 고르세요',
    options: ['한국어', 'English']
  }
];

export const mapDBToSurveyAnswers = (data: any): Record<number, any> => {
  if (!data) return {};

  return {
    1: data.brand_tone || [], // DB가 이미 배열[]로 주니까 그대로 씁니다!
    2: data.preferred_styles || [],
    // exclude_conditions는 문자열로 오기도 하니, 배열이 아니면 배열로 감싸줍니다.
    3: Array.isArray(data.exclude_conditions) ? data.exclude_conditions : (data.exclude_conditions ? [data.exclude_conditions] : []),
    4: Array.isArray(data.hashtag_style) ? data.hashtag_style : (data.hashtag_style ? [data.hashtag_style] : []),
    5: data.cta || '',
    6: data.shop_intro || '',
    7: data.forbidden_words || [],
    8: data.rag_reference || '',
    9: data.city || '',
    
    11: data.insta_auto_upload_yn === 'Y' ? '예 (추천)' : '아니오',
    12: data.gmail_address || '',
    13: {
      frequency: data.insta_upload_time_slot || '매일',
      amPm: data.insta_upload_time ? data.insta_upload_time.split(' ')[1] : 'AM',
      hour: data.insta_upload_time ? data.insta_upload_time.split(' ')[0].split(':')[0] : '10',
      minute: data.insta_upload_time ? data.insta_upload_time.split(' ')[0].split(':')[1] : '30'
    },
    14: data.language || '한국어'
  };
};