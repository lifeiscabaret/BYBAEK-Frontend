// 타겟 경로: src/app/album/page.tsx
"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { AlbumDetailModal } from '@/components/AlbumDetailModal'; // 모달 컴포넌트 경로 확인 필요
import { AlbumCard } from '@/components/AlbumCard';

interface AlbumData {
  id: string;
  isNew?: boolean;
  title?: string;
  description?: string;
  photoCount?: number;
}

const INITIAL_MOCK_ALBUMS: AlbumData[] = [
  { id: 'new', isNew: true },
  { id: '1', title: '2026 봄 시즌 트렌드', description: '가르마 펌, 리프컷 위주', photoCount: 24 },
  { id: '2', title: '클래식 페이드컷', description: '바버샵 시그니처 포트폴리오', photoCount: 56 },
  { id: '3', title: '애쉬 브라운 염색', description: '20대 타겟 컬러링', photoCount: 12 },
  { id: '4', title: '고객 리뷰(Before/After)', description: '인스타 피드 업로드용', photoCount: 89 },
  { id: '5', title: '매장 인테리어', description: '내외부 전경 및 장비', photoCount: 15 },
];

export default function MyAlbumScreen() {
  const [albums, setAlbums] = useState<AlbumData[]>(INITIAL_MOCK_ALBUMS);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  // 앨범 상세 모달용 상태
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumData | null>(null);

  // 사진 영역 클릭 시 (체크박스 토글)
  const toggleSelect = (index: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // 상세 뷰 열기
  const openAlbumDetail = (album: AlbumData) => {
    setSelectedAlbum(album);
    setIsDetailModalVisible(true);
  };

  // 모달/상세뷰에서 '저장' 버튼을 눌렀을 때 실행될 업데이트 로직
  const handleUpdateAlbum = (id: string, newTitle: string, newDesc: string) => {
    setAlbums(prev =>
      prev.map(a => (a.id === id ? { ...a, title: newTitle, description: newDesc } : a))
    );
    setIsDetailModalVisible(false);
    setSelectedAlbum(null);
  };

  // 선택된 앨범 삭제
  const handleDeleteAlbums = () => {
    if (selectedIndexes.length === 0) {
      window.alert('삭제할 앨범을 먼저 선택해주세요.');
      return;
    }

    if (window.confirm(`선택한 ${selectedIndexes.length}개의 앨범을 삭제하시겠습니까?`)) {
      setAlbums(albums.filter((_, idx) => !selectedIndexes.includes(idx)));
      setSelectedIndexes([]);
    }
  };

  return (
    // 메인 컨테이너
    <div className="flex flex-row min-h-screen bg-background relative">
      <Sidebar />

      {/* 우측 메인 콘텐츠 영역 */}
      <div className="flex-1 p-large flex flex-col min-w-0">
        
        {/* 상단 헤더 영역 */}
        <div className="flex flex-row justify-between items-center mb-large shrink-0">
          <h1 className="text-h1 font-bold text-text-primary">내 앨범</h1>
          <button 
            onClick={handleDeleteAlbums}
            className="px-medium py-2 border border-accent rounded-md bg-white text-accent font-bold text-sm hover:bg-red-50 transition-colors focus:outline-none"
          >
            선택된 앨범 삭제
          </button>
        </div>

        {/* 앨범 그리드 리스트 영역 (FlatList -> CSS Grid 변환) */}
        <div className="flex-1 overflow-y-auto pr-2 pb-large">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {albums.map((item, index) => {
              const isSelected = selectedIndexes.includes(index);
              return (
                <AlbumCard 
                  key={item.id}
                  item={item}
                  index={index}
                  isSelected={isSelected}
                  onToggleSelect={toggleSelect}
                  onOpenDetail={openAlbumDetail}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* [새로운 기능] 앨범 상세 정보 오버레이 (인라인 모달 형태) */}
      {isDetailModalVisible && selectedAlbum && (
        <div className="absolute inset-0 z-[9999] bg-white flex flex-row">
          <Sidebar /> {/* 덮어씌워져도 사이드바는 유지 */}
          
          <div className="flex-1 p-[40px] flex flex-col">
            
            {/* 오버레이 헤더 영역 */}
            <div className="flex flex-row justify-between items-start mb-[30px] shrink-0">
              
              {/* 왼쪽: 수정 가능한 앨범 이름과 설명 */}
              <div className="flex-1 pr-5 flex flex-col">
                <input 
                  type="text"
                  className="text-[32px] font-bold text-[#1A1A1A] mb-2 focus:outline-none bg-transparent"
                  placeholder="앨범 이름을 입력하세요"
                  defaultValue={selectedAlbum.title}
                />
                <input 
                  type="text"
                  className="text-base text-[#666666] focus:outline-none bg-transparent w-full"
                  placeholder="앨범에 대한 설명을 입력하세요"
                  defaultValue={selectedAlbum.description}
                />
              </div>

              {/* 오른쪽: 사진 추가/제거 버튼 및 닫기 */}
              <div className="flex flex-col items-end">
                <button 
                  onClick={() => setIsDetailModalVisible(false)} 
                  className="p-[10px] mb-[10px] text-[24px] text-[#888] leading-none hover:text-[#1A1A1A] transition-colors focus:outline-none"
                >
                  ✕
                </button>
                
                <div className="flex flex-row items-center gap-[10px]">
                  <button className="border border-[#1A1A1A] py-[10px] px-[20px] rounded-lg text-[14px] font-bold text-[#1A1A1A] hover:bg-gray-50 transition-colors focus:outline-none">
                    사진 제거
                  </button>
                  <button className="bg-accent py-[10px] px-[20px] rounded-lg text-[14px] font-bold text-white hover:bg-accent-dark transition-colors focus:outline-none">
                    사진 추가
                  </button>
                </div>
                
                <span className="mt-[12px] text-[15px] text-[#888] font-bold">
                  총 {selectedAlbum.photoCount}장의 사진
                </span>
              </div>
            </div>

            {/* 앨범 내부 사진 리스트 영역 (임시 플레이스홀더) */}
            <div className="flex-1 bg-[#F9F9F9] rounded-xl flex justify-center items-center border border-[#E0E0E0]">
              <span className="text-[18px] text-[#A0A0A0]">이 앨범에 저장된 사진들이 표시될 영역입니다.</span>
            </div>
            
          </div>
        </div>
      )}

      {/* 분리된 모달 컴포넌트 호출 (원본 코드 유지) */}
      {/* 개발자 노트: 위 오버레이와 아래 모달이 중복 렌더링 될 수 있으니 구조 검토를 권장함 */}
      <AlbumDetailModal 
        isVisible={isDetailModalVisible}
        album={selectedAlbum}
        onClose={() => setIsDetailModalVisible(false)}
        onSave={handleUpdateAlbum} 
      />

    </div>
  );
}