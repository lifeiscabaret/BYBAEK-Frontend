// 타겟 경로: src/app/post/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';

// Next.js App Router의 동적 라우팅 파라미터 타입 정의
interface PostDetailProps {
  params: {
    id: string;
  };
}

export default function PostDetailScreen({ params }: PostDetailProps) {
  const router = useRouter();

  const [postData, setPostData] = useState({
    title: '첫 게시글',
    images: [1, 2, 3, 4, 5, 6, 7, 8],
    content: '여기에 DB에서 불러온 게시글 텍스트 내용이 표시됩니다.\n\n고객님의 깔끔한 페이드컷 스타일링입니다. 가을 트렌드에 맞춰 정돈된 느낌을 주었습니다.\n\n#바버샵 #남자머리 #페이드컷 #가을유행',
  });

  useEffect(() => {
    // 추후 API 연동 시 params.id (URL의 게시글 ID)를 사용하여 데이터를 fetch 합니다.
    // fetchPostDetail(params.id).then(data => setPostData(data));
  }, [params.id]);

  return (
    // 메인 컨테이너 (사이드바 + 콘텐츠 가로 배치)
    <div className="flex flex-row min-h-screen bg-background">
      <Sidebar />

      {/* 우측 메인 콘텐츠 영역 */}
      <div className="flex-1 p-[32px] flex flex-col min-w-0">
        
        {/* 상단 타이틀 및 닫기 버튼 */}
        <div className="flex flex-row justify-between items-center mb-[32px] shrink-0">
          <h1 className="text-[28px] font-bold text-[#1A1A1A]">{postData.title}</h1>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-lg font-bold hover:bg-accent-dark transition-colors focus:outline-none shadow-sm"
          >
            ✕
          </button>
        </div>

        {/* 2단 메인 레이아웃 (flex-1로 남은 세로 공간 모두 차지, min-h-0으로 자식 스크롤 허용) */}
        <div className="flex-1 flex flex-row gap-[32px] min-h-0">
          
          {/* 좌측: 첨부된 사진 그리드 (독립 스크롤 영역) */}
          <div className="flex-1 overflow-y-auto pr-2">
            {/* flex-wrap과 gap을 이용한 그리드 배치 */}
            <div className="flex flex-row flex-wrap content-start gap-[16px] pb-[40px]">
              {postData.images.map((_, index) => (
                <div 
                  key={`img-${index}`} 
                  className="w-[160px] h-[160px] bg-[#E0E0E0] rounded-[12px] flex justify-center items-center"
                >
                  <span className="text-[16px] text-[#666666]">사진</span>
                </div>
              ))}
            </div>
          </div>

          {/* 우측: 게시글 텍스트 본문 (독립 스크롤 영역) */}
          <div className="flex-1 bg-[#E0E0E0] rounded-[12px] p-[32px] overflow-y-auto">
            {/* whitespace-pre-wrap 속성으로 \n 줄바꿈 정상 출력 */}
            <p className="text-[18px] text-[#1A1A1A] leading-[28px] whitespace-pre-wrap">
              {postData.content}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}