// 타겟 경로: src/components/PostCard.tsx
"use client";

import React from 'react';

interface PostCardProps {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  isNewButton?: boolean;
  onPress: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  id, 
  title, 
  description, 
  imageUrl,
  isNewButton = false, 
  onPress 
}) => {
  
  // 1. 새 게시물 만들기 카드
  if (isNewButton) {
    return (
      <button 
        onClick={onPress}
        className="w-full h-[200px] bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none group"
      >
        <span className="text-4xl text-gray-400 group-hover:text-accent font-light mb-2 transition-colors">
          +
        </span>
        <span className="text-sm font-bold text-gray-500 group-hover:text-text-primary transition-colors">
          새 게시물 만들기
        </span>
      </button>
    );
  }

  // 2. 일반 게시물 카드
  return (
    <button 
      onClick={onPress}
      className="w-full h-[200px] bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden hover:shadow-md hover:border-accent transition-all focus:outline-none text-left"
    >
      {/* 사진 영역 (추후 Image 컴포넌트로 교체) */}
      <div className="h-3/5 bg-gray-100 flex justify-center items-center w-full">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title || "게시물 이미지"} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <span className="text-sm text-gray-400">사진 없음</span>
        )}
      </div>
      
      {/* 텍스트 영역 */}
      <div className="h-2/5 p-3 flex flex-col justify-center bg-white w-full border-t border-gray-100">
        <span className="text-sm font-semibold text-text-primary truncate w-full">
          {title || '게시물 설명'}
        </span>
        {description && (
          <span className="text-xs text-gray-500 mt-1 line-clamp-2 w-full">
            {description}
          </span>
        )}
      </div>
    </button>
  );
};