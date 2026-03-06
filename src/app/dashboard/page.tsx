// 타겟 경로: src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react'; //DB 연동
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar'; 
import { PostCard } from '@/components/PostCard'; 
import apiClient from '@/api/index';

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
  const [posts, setPosts] = useState<any[]>([]); //DB 연동
  const shopId = "3sesac18"; //DB 연동

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiClient.get(`/agent/posts/${shopId}`);
        
        // axios는 response.data 안에 실제 결과값이 들어있습니다.
        setPosts(response.data.posts || []);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      }
    };
    fetchPosts();
  }, [shopId]);

  return (
    // 1. [핵심] min-h-screen을 h-screen으로 변경하고 overflow-hidden 추가
    <div className="flex flex-row h-screen w-full bg-background overflow-hidden">
      
      {/* 1. 좌측 사이드바 */}
      <Sidebar />

      {/* 2. 우측 메인 콘텐츠 영역: h-full 추가 */}
      <div className="flex-1 p-large flex flex-col min-w-0 h-full">
        
        {/* 상단 헤더 영역: 찌그러짐 방지를 위해 shrink-0 추가 */}
        <div className="flex flex-row justify-between items-center mb-large shrink-0">
          <h1 className="text-h1 text-text-primary font-bold">내 대시보드</h1>
        </div>

        {/* 그리드 리스트 영역: 독립 스크롤을 위한 min-h-0 추가 */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-large">
            
            <PostCard 
              id="new" 
              isNewButton={true} 
              onPress={() => router.push('/preview')} 
            />
            
            {posts.map((post) => (
              <PostCard 
                key={post.id}
                id={post.id} 
                title={post.caption?.substring(0, 15) + "..."} // 제목이 없을 경우 캡션 일부 사용
                imageUrl={post.thumbnail_url}
                onPress={() => router.push(`/post/${post.id}?shop_id=${shopId}`)} 
              />
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}