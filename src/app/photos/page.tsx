// 타겟 경로: src/app/photos/page.tsx
"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';

export default function AllPhotosScreen() {
  // 실제 삭제 기능을 테스트하기 위해 State로 관리
  const [photos, setPhotos] = useState(Array.from({ length: 20 }, (_, i) => `사진 ${i + 1}`));
  // 선택된 사진들의 '인덱스'를 저장하는 배열
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  // 체크박스 클릭 시 선택/해제 토글
  const toggleSelect = (index: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // 선택된 사진 삭제 로직 (window.confirm 사용)
  const handleDelete = () => {
    if (selectedIndexes.length === 0) {
      window.alert('삭제할 사진을 먼저 선택해주세요.');
      return;
    }
    
    // 브라우저 네이티브 컨펌 창 띄우기
    if (window.confirm(`선택한 ${selectedIndexes.length}개의 사진을 삭제하시겠습니까?`)) {
      // 선택되지 않은 사진만 남겨서 목록 갱신
      setPhotos(photos.filter((_, idx) => !selectedIndexes.includes(idx)));
      setSelectedIndexes([]); // 삭제 완료 후 선택 목록 초기화
    }
  };

  // OneDrive 앱 또는 웹 열기 (window.open 사용)
  const openOneDrive = () => {
    const oneDriveUrl = 'https://onedrive.live.com'; 
    try {
      window.open(oneDriveUrl, '_blank');
    } catch (error) {
      window.alert('오류: 원드라이브를 열 수 없습니다.');
    }
  };

  return (
    // 메인 컨테이너 (사이드바 + 콘텐츠 가로 배치)
    <div className="flex flex-row min-h-screen bg-background">
      <Sidebar />
      
      {/* 우측 메인 콘텐츠 영역 */}
      <div className="flex-1 p-large bg-[#FAFAFA] flex flex-col min-w-0">
        
        {/* 상단 헤더 영역 */}
        <div className="flex flex-row justify-between items-center mb-large pb-small border-b border-border shrink-0">
          <h1 className="text-h1 text-text-primary font-bold">전체 사진</h1>
          
          {/* 우측 상단 삭제 버튼 */}
          <button 
            onClick={handleDelete}
            className="px-medium py-2 border border-accent rounded-md bg-white text-accent font-bold text-sm hover:bg-red-50 transition-colors focus:outline-none"
          >
            선택된 사진 삭제
          </button>
        </div>

        {/* 갤러리 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto pr-2">
          
          {/* 반응형 그리드 컨테이너 (flex-wrap 사용) */}
          <div className="flex flex-row flex-wrap gap-4 pb-large">
            
            {/* 🚨 1. 고정된 첫 번째 칸: 원드라이브 업로드 카드 */}
            <button 
              onClick={openOneDrive} 
              className="w-[180px] h-[180px] bg-white rounded-lg border-2 border-dashed border-border flex flex-col justify-center items-center hover:bg-gray-50 transition-colors focus:outline-none group"
            >
              <span className="text-[40px] font-light text-accent mb-2 transition-transform group-hover:scale-110">
                +
              </span>
              <span className="text-body font-bold text-text-secondary group-hover:text-text-primary transition-colors">
                새 사진 업로드
              </span>
            </button>

            {/* 🚨 2. 나머지 사진 목록 렌더링 */}
            {photos.map((photoName, index) => {
              const isSelected = selectedIndexes.includes(index);
              
              return (
                <button 
                  key={`photo-${index}`} 
                  onClick={() => toggleSelect(index)}
                  className={`relative w-[180px] h-[180px] bg-[#EAEAEA] rounded-lg border flex justify-center items-center overflow-hidden transition-all focus:outline-none ${
                    isSelected ? 'border-accent border-2' : 'border-border hover:border-gray-400'
                  }`}
                >
                  {/* 좌측 상단 체크박스 */}
                  <div className={`absolute top-[10px] left-[10px] w-[22px] h-[22px] rounded border-2 z-10 flex justify-center items-center transition-colors ${
                    isSelected ? 'bg-accent border-accent' : 'bg-white border-text-secondary'
                  }`}>
                    {isSelected && <span className="text-white text-sm font-bold leading-none">✓</span>}
                  </div>
                  
                  {/* 임시 텍스트 (추후 next/image로 교체될 자리) */}
                  <span className="text-body text-text-secondary font-medium">
                    {photoName}
                  </span>
                </button>
              );
            })}
            
          </div>
        </div>
      </div>
    </div>
  );
}