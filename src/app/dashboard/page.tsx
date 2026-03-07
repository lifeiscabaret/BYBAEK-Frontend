// 타겟 경로: src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar'; 
import { PostCard } from '@/components/PostCard'; 

// 임시 Mock Data
const MOCK_DATA = [
  { id: 'new', isNew: true },
  { id: '1', title: '깔끔한 페이드컷 스타일' },
  { id: '2', title: '가을 트렌드 바버 스타일링' },
  { id: '3', title: '포마드 스타일링 팁' },
  { id: '4', title: '고객 리뷰 사진' },
  { id: '5', title: '바버샵 내부 전경' },
];

export default function DashboardScreen() {
  const router = useRouter();
  
  // 🚨 Guest 여부를 판단할 상태 추가
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // 마운트 시 로컬 스토리지에서 isGuest 값 확인
    const guestStatus = localStorage.getItem('isGuest');
    if (guestStatus === 'true') {
      setIsGuest(true);
    }
  }, []);

  return (
    <div className="flex flex-row h-screen w-full bg-background overflow-hidden">
      
      {/* 1. 좌측 사이드바 */}
      <Sidebar />

      {/* 2. 우측 메인 콘텐츠 영역: h-full 추가 */}
      <div className="flex-1 p-large flex flex-col min-w-0 h-full">
        
        {/* 상단 헤더 영역: 찌그러짐 방지를 위해 shrink-0 추가 */}
        <div className="flex flex-row justify-between items-center mb-large shrink-0">
          <h1 className="text-h1 text-text-primary font-bold">내 대시보드</h1>
        </div>

        {/* 🚨 3. 체험 모드(Guest) 전용 우아한 경고 배너 */}
        {isGuest && (
          <div className="mb-large bg-[#FFF4F4] border border-[#FFD6D6] rounded-xl p-5 flex flex-row justify-between items-center shrink-0 shadow-sm">
            <div className="flex flex-row items-center">
              <div className="w-10 h-10 bg-[#FFE5E5] rounded-full flex items-center justify-center mr-4 shrink-0">
                <span className="text-[#E02424] text-lg">⚠️</span>
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#E02424] mb-1">현재 체험 모드로 접속 중입니다.</p>
                <p className="text-[13px] text-[#E02424]/80">개인 사진 업로드 및 인스타그램 자동 발행 기능이 제한됩니다. 전체 기능을 사용하시려면 계정을 연동해 주세요.</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="ml-4 px-5 py-2.5 bg-[#E02424] text-white text-[13px] font-bold rounded-lg hover:bg-red-800 transition-colors shrink-0 focus:outline-none"
            >
              계정 연동하기
            </button>
          </div>
        )}

        {/* 그리드 리스트 영역: 독립 스크롤을 위한 min-h-0 추가 */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-large">
            {MOCK_DATA.map((item) => {
              // 1. 새 게시물 만들기 버튼 카드
              if (item.isNew) {
                return (
                  <PostCard 
                    key={item.id}
                    id={item.id} 
                    isNewButton={true} 
                    onPress={() => router.push('/preview')} 
                  />
                );
              }
              
              // 2. 일반 게시물 카드
              return (
                <PostCard 
                  key={item.id}
                  id={item.id} 
                  title={item.title} 
                  onPress={() => router.push(`/post/${item.id}`)} 
                />
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}