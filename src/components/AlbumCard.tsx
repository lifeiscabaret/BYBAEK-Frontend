// /src/components/AlbumCard.tsx
"use client";

import React, { useState } from 'react';

// 원본 인터페이스 유지
interface AlbumData {
  id: string;
  isNew?: boolean;
  title?: string;
  description?: string;
  photoCount?: number;
  thumbnailUrl?: string;
}

interface AlbumCardProps {
  item: AlbumData;
  index: number;
  isSelected: boolean;
  onToggleSelect: (index: number) => void;
  onOpenDetail: (album: AlbumData) => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ 
  item, 
  index, 
  isSelected, 
  onToggleSelect, 
  onOpenDetail 
}) => {
  // 웹에서도 호버 상태 관리를 위해 기존 상태 변수 유지
  const [isInfoHovered, setIsInfoHovered] = useState(false);

  // 1. 새 앨범 만들기 카드
  if (item.isNew) {
    return (
      <button 
        onClick={() => console.log('새 앨범 만들기 모달 오픈')}
        className="flex flex-col items-center justify-center w-full h-[280px] border-2 border-dashed border-gray-300 rounded-lg bg-[#FFFFFF] hover:bg-gray-50 transition-colors focus:outline-none"
      >
        <span className="text-4xl text-gray-400 mb-2">+</span>
        <span className="text-lg font-bold text-[#1A1A1A]">새 앨범 만들기</span>
      </button>
    );
  }

  // 2. 일반 앨범 카드
  return (
    <div className={`relative flex flex-col p-3 rounded-lg border ${
      isSelected ? 'border-[#800020] bg-red-50' : 'border-gray-200 bg-[#FFFFFF]'
    }`}>
      
      {/* 체크박스 영역 */}
      <div className={`absolute top-4 left-4 z-10 w-6 h-6 rounded flex items-center justify-center border ${
        isSelected ? 'bg-[#800020] border-[#800020]' : 'bg-white border-gray-300'
      }`}>
        {isSelected ? <span className="text-white text-sm font-bold">✓</span> : null}
      </div>

      {/* 썸네일 영역 (버튼으로 치환) */}
      <button 
        onClick={() => onToggleSelect(index)}
        className="w-full h-40 bg-gray-100 rounded-md flex items-center justify-center hover:bg-gray-200 transition-colors focus:outline-none mb-3"
      >
        {item.thumbnailUrl ? (
          <img 
            src={item.thumbnailUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105" 
          />
        ) : (
          <span className="text-gray-400 font-medium text-sm text-center px-2">
            사진이 없습니다
          </span>
        )}
      </button>

      {/* 앨범 정보 영역 */}
      <div 
        className="w-full"
        onMouseEnter={() => setIsInfoHovered(true)}
        onMouseLeave={() => setIsInfoHovered(false)}
      >
        <button 
          onClick={() => onOpenDetail(item)}
          className={`w-full text-left p-2 rounded-md transition-all focus:outline-none border-[1.5px] ${
            isInfoHovered 
              ? 'bg-[#FAFAFA] border-[#800020]' 
              : 'border-transparent'
          }`}
        >
          <p className="text-base font-bold text-[#1A1A1A] truncate">
            {item.title || '제목 없음'}
          </p>
          <p className="text-sm text-gray-600 truncate mt-1">
            {item.description || '설명 없음'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            사진 {item.photoCount || 0}장
          </p>
        </button>
      </div>

    </div>
  );
};