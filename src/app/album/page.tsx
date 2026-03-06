// 타겟 경로: src/app/album/page.tsx
"use client";

import React, { useState, useEffect } from 'react'; //DB 연동
import { Sidebar } from '@/components/Sidebar';
import { AlbumCard } from '@/components/AlbumCard';
import apiClient from '@/api/index'; //DB 연동

interface AlbumData {
  id: string;
  isNew?: boolean;
  title?: string;
  description?: string;
  photoCount?: number;
  thumbnailUrl?: string;
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
  // const [albums, setAlbums] = useState<AlbumData[]>(INITIAL_MOCK_ALBUMS); //DB 연동
  const [albums, setAlbums] = useState<AlbumData[]>([]); //DB 연동
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumData | null>(null);

  // 🚨 오버레이 내에서 입력하는 제목과 설명을 관리할 State 추가
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  //******************* DB 연동 START ********************* */
  const fetchAlbums = async () => {
    try {
      const shopId = "3sesac18"; // 실제 연동 시에는 로그인 유저 ID 사용
      const response = await apiClient.get(`/photos/albums/${shopId}`);
      
      // 백엔드 데이터 포맷을 프론트엔드 UI 포맷으로 변환
      const dbAlbums = response.data.albums.map((album: any) => ({
        id: album.id,
        title: album.album_name,
        photoCount: album.photo_count,
        description: album.description || "설명이 없습니다.",
        thumbnailUrl: album.thumbnail_url
      }));

      // 맨 앞에 "새 앨범 만들기" 카드를 붙여서 상태 업데이트
      setAlbums([{ id: 'new', isNew: true }, ...dbAlbums]);
    } catch (error) {
      console.error("앨범 로딩 실패:", error);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  //******************* DB 연동 END ********************* */

  const toggleSelect = (index: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // 앨범 카드(또는 새 앨범 만들기) 클릭 시 실행
  const openAlbumDetail = (album: AlbumData) => {
    setSelectedAlbum(album);
    // 새 앨범이면 빈칸, 기존 앨범이면 원래 정보로 초기화
    setEditTitle(album.id === 'new' ? '' : (album.title || ''));
    setEditDesc(album.id === 'new' ? '' : (album.description || ''));
    setIsDetailModalVisible(true);
  };

  // 모달에서 '저장' 버튼을 눌렀을 때 실행되는 핵심 로직
  const handleSaveOverlay = () => {
    if (!selectedAlbum) return;

    if (selectedAlbum.id === 'new') {
      // 1. 새 앨범 생성 로직
      const newAlbum: AlbumData = {
        id: Date.now().toString(), // 고유 ID 임시 생성
        title: editTitle || '제목 없는 앨범', // 미입력 시 기본값
        description: editDesc,
        photoCount: 0, // 새 앨범은 사진 0장
      };
      
      // '새 앨범 만들기' 카드(index 0) 바로 뒤에 새 앨범 추가
      setAlbums(prev => {
        const newAlbums = [...prev];
        newAlbums.splice(1, 0, newAlbum);
        return newAlbums;
      });
    } else {
      // 2. 기존 앨범 수정 로직
      setAlbums(prev =>
        prev.map(a => (a.id === selectedAlbum.id ? { ...a, title: editTitle, description: editDesc } : a))
      );
    }
    
    // 저장 후 모달 닫기
    setIsDetailModalVisible(false);
    setSelectedAlbum(null);
  };

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
    <div className="flex flex-row h-screen w-full bg-background relative overflow-hidden">
      <Sidebar />

      <div className="flex-1 p-large flex flex-col min-w-0 h-full">
        <div className="flex flex-row justify-between items-center mb-large shrink-0">
          <h1 className="text-h1 font-bold text-text-primary">내 앨범</h1>
          <button 
            onClick={handleDeleteAlbums}
            className="px-medium py-2 border border-accent rounded-md bg-white text-accent font-bold text-sm hover:bg-red-50 transition-colors focus:outline-none"
          >
            선택된 앨범 삭제
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-large scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {albums.map((item, index) => {
              // 새 앨범 만들기 (클릭 무시 버그 해결을 위해 직접 버튼으로 렌더링)
              if (item.isNew) {
                return (
                  <button 
                    key={item.id}
                    onClick={() => openAlbumDetail(item)}
                    className="w-full h-full min-h-[260px] bg-white rounded-xl border-2 border-dashed border-[#D0D0D0] flex flex-col justify-center items-center hover:bg-gray-50 transition-colors focus:outline-none group"
                  >
                    <span className="text-[40px] font-light text-[#A0A0A0] mb-2 transition-transform group-hover:scale-110">
                      +
                    </span>
                    <span className="text-[16px] font-bold text-[#1A1A1A]">
                      새 앨범 만들기
                    </span>
                  </button>
                );
              }

              // 일반 앨범 카드 (기존 로직 유지)
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

      {/* 🚨 업그레이드된 앨범 상세 정보 오버레이 (사진 디자인 완벽 반영) */}
      {isDetailModalVisible && selectedAlbum && (
        <div className="absolute inset-0 z-[9999] bg-white flex flex-row">
          <Sidebar /> 
          
          <div className="flex-1 p-[40px] flex flex-col h-screen overflow-hidden">
            
            {/* 오버레이 헤더 영역 */}
            <div className="flex flex-row justify-between items-start mb-[30px] shrink-0">
              
              {/* 왼쪽: 수정 가능한 앨범 이름, 설명, 사진 수 */}
              <div className="flex-1 pr-5 flex flex-col">
                <input 
                  type="text"
                  className="text-[32px] font-bold text-[#1A1A1A] mb-2 focus:outline-none bg-transparent placeholder-[#D0D0D0]"
                  placeholder={selectedAlbum.id === 'new' ? "새 앨범 이름" : "앨범 이름을 입력하세요"}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input 
                  type="text"
                  className="text-base text-[#666666] mb-4 focus:outline-none bg-transparent w-full placeholder-[#D0D0D0]"
                  placeholder="앨범에 대한 설명을 입력하세요"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
                <span className="text-[15px] text-[#888] font-bold">
                  총 {selectedAlbum.photoCount || 0}장의 사진
                </span>
              </div>

              {/* 오른쪽: 버튼 그룹 */}
              <div className="flex flex-col items-end gap-4">
                
                {/* 상단: 저장(검정), 닫기(빨간 원) 버튼 */}
                <div className="flex flex-row items-center gap-3">
                  <button 
                    onClick={handleSaveOverlay}
                    className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-colors focus:outline-none"
                  >
                    저장
                  </button>
                  <button 
                    onClick={() => setIsDetailModalVisible(false)} 
                    className="bg-[#8A0020] text-white w-10 h-10 rounded-full flex justify-center items-center text-[20px] font-bold hover:bg-red-900 transition-colors focus:outline-none"
                  >
                    ✕
                  </button>
                </div>
                
                {/* 하단: 사진 제거(하양), 사진 추가(빨강) 버튼 */}
                <div className="flex flex-row items-center gap-3">
                  <button className="border border-[#D0D0D0] bg-white text-[#1A1A1A] px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors focus:outline-none">
                    사진 제거
                  </button>
                  <button className="bg-[#8A0020] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-red-900 transition-colors focus:outline-none">
                    사진 추가
                  </button>
                </div>

              </div>
            </div>

            {/* 앨범 내부 사진 리스트 영역 */}
            <div className="flex-1 bg-[#F9F9F9] rounded-xl flex justify-center items-center border border-[#E0E0E0] min-h-0 overflow-y-auto">
              {selectedAlbum.id === 'new' ? (
                <span className="text-[18px] text-[#A0A0A0]">우측 상단의 '사진 추가' 버튼을 눌러 사진을 채워보세요.</span>
              ) : (
                <span className="text-[18px] text-[#A0A0A0]">이 앨범에 저장된 사진들이 표시될 영역입니다.</span>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* 중복 렌더링되던 기존 AlbumDetailModal은 제거하여 깔끔하게 정리했습니다. */}
    </div>
  </div>
  );
}