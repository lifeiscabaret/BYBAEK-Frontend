// 타겟 경로: src/app/dashboard/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar'; // 실제 Sidebar 경로에 맞게 수정 필요
import { PostCard } from '@/components/PostCard'; // 실제 PostCard 경로에 맞게 수정 필요

// 임시 Mock Data (추후 Cosmos DB 연동 시 교체)
const MOCK_DATA = [
  { id: 'new', isNew: true }, // 첫 번째 아이템은 항상 '새 게시물 만들기' 버튼
  { id: '1', title: '깔끔한 페이드컷 스타일' },
  { id: '2', title: '가을 트렌드 바버 스타일링' },
  { id: '3', title: '포마드 스타일링 팁' },
  { id: '4', title: '고객 리뷰 사진' },
  { id: '5', title: '바버샵 내부 전경' },
];

export default function DashboardScreen() {
  const router = useRouter();

  return (
    // 기존 container: flex-row로 사이드바와 메인 콘텐츠 배치
    <div className="flex flex-row min-h-screen bg-background">
      
      {/* 1. 좌측 사이드바 */}
      <Sidebar />

      {/* 2. 우측 메인 콘텐츠 영역 */}
      <div className="flex-1 p-large flex flex-col min-w-0">
        
        {/* 상단 헤더 영역 */}
        <div className="flex flex-row justify-between items-center mb-large">
          <h1 className="text-h1 text-text-primary font-bold">내 대시보드</h1>
          
          {/* 🚨 우측 상단 버튼 (현재 주석 처리되어 있으나, 필요 시 아래 코드 주석 해제) */}
          {/* <button 
            onClick={() => router.push('/preview')}
            className="bg-accent py-[10px] px-5 rounded-lg text-text-inverse text-body font-bold hover:bg-accent-dark transition-colors focus:outline-none"
          >
            이미지 선택 & 게시물 생성
          </button>
          */}
        </div>

        {/* 그리드 리스트 영역 (FlatList 대체) */}
        <div className="flex-1 overflow-y-auto">
          {/* Tailwind CSS Grid를 사용하여 반응형 4열 레이아웃 구현 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-large">
            {MOCK_DATA.map((item) => {
              // 1. 새 게시물 만들기 버튼 카드
              if (item.isNew) {
                return (
                  <PostCard 
                    key={item.id}
                    id={item.id} 
                    isNewButton={true} 
                    onPress={() => router.push('/preview')} // 게시글 작성 화면으로 이동
                  />
                );
              }
              
              // 2. 일반 게시물 카드
              return (
                <PostCard 
                  key={item.id}
                  id={item.id} 
                  title={item.title} 
                  onPress={() => router.push(`/post/${item.id}`)} // 동적 라우팅 적용 (게시글 상세)
                />
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}