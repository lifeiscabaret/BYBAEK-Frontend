// 타겟 경로: src/components/AlbumDetailModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';

interface AlbumData {
  id: string;
  isNew?: boolean;
  title?: string;
  description?: string;
  photoCount?: number;
}

interface AlbumDetailModalProps {
  isVisible: boolean;
  album: AlbumData | null;
  onClose: () => void;
  onSave: (id: string, newTitle: string, newDesc: string) => void;
}

// 임시 목업 데이터
const MOCK_PHOTOS = Array.from({ length: 10 }, (_, i) => ({ id: `photo_${i}`, title: `사진 ${i + 1}` }));
const MOCK_ALL_PHOTOS = Array.from({ length: 20 }, (_, i) => ({ id: `all_photo_${i}`, title: `전체 사진 ${i + 1}` }));

export const AlbumDetailModal: React.FC<AlbumDetailModalProps> = ({ isVisible, album, onClose, onSave }) => {
  const [tempTitle, setTempTitle] = useState('');
  const [tempDesc, setTempDesc] = useState('');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  
  // 중첩 모달 상태
  const [isAddPhotoModalVisible, setIsAddPhotoModalVisible] = useState(false);
  const [selectedAllPhotoIds, setSelectedAllPhotoIds] = useState<string[]>([]);

  // 모달이 열릴 때 초기 데이터 세팅
  useEffect(() => {
    if (isVisible && album) {
      setTempTitle(album.title || '');
      setTempDesc(album.description || '');
      setSelectedPhotoIds([]); 
      setIsAddPhotoModalVisible(false); 
      setSelectedAllPhotoIds([]); 
    }
  }, [isVisible, album]);

  // 보이지 않거나 데이터가 없으면 렌더링 차단
  if (!isVisible || !album) return null;

  const handleSave = () => {
    if (!album) return;
    onSave(album.id, tempTitle, tempDesc);
  };

  const togglePhotoSelect = (id: string) => 
    setSelectedPhotoIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  
  const toggleAllPhotoSelect = (id: string) => 
    setSelectedAllPhotoIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  return (
    // 1. 메인 오버레이 (사이드바 포함 전체 화면)
    <div className="fixed inset-0 z-[9999] bg-background flex flex-row">
      <Sidebar />
      
      <div className="flex-1 p-[40px] flex flex-col min-w-0">
        
        {/* 상단 헤더 */}
        <div className="flex flex-row justify-between items-start mb-[24px] shrink-0">
          
          {/* 타이틀 및 설명 입력 영역 */}
          <div className="flex-1 pr-5 flex flex-col">
            <input 
              type="text"
              className="text-[32px] font-bold text-text-primary mb-2 focus:outline-none bg-transparent w-full"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              placeholder="앨범 이름을 입력하세요"
            />
            <input 
              type="text"
              className="text-base text-text-secondary mb-3 focus:outline-none bg-transparent w-full"
              value={tempDesc}
              onChange={(e) => setTempDesc(e.target.value)}
              placeholder="앨범에 대한 설명을 입력하세요"
            />
            <span className="text-[14px] text-[#888] font-bold">총 {album.photoCount || 0}장의 사진</span>
          </div>

          {/* 우측 액션 버튼 영역 */}
          <div className="flex flex-col items-end shrink-0">
            
            <div className="flex flex-row items-center mb-4">
              <button 
                onClick={handleSave} 
                className="bg-text-primary text-white py-2 px-4 rounded-lg font-bold mr-3 hover:bg-gray-800 transition-colors focus:outline-none"
              >
                저장
              </button>
              <button 
                onClick={onClose} 
                className="bg-accent w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg hover:bg-accent-dark transition-colors focus:outline-none"
              >
                ✕
              </button>
            </div>
            
            <div className="flex flex-row items-center">
              <button className="border border-text-primary py-2.5 px-5 rounded-lg text-text-primary font-bold mr-2.5 hover:bg-gray-50 transition-colors focus:outline-none">
                사진 제거
              </button>
              <button 
                onClick={() => setIsAddPhotoModalVisible(true)}
                className="bg-accent py-2.5 px-5 rounded-lg text-white font-bold hover:bg-accent-dark transition-colors focus:outline-none"
              >
                사진 추가
              </button>
            </div>
          </div>
        </div>

        {/* 앨범 내 사진 그리드 (스크롤 영역) */}
        <div className="flex-1 bg-[#F9F9F9] rounded-xl p-5 border border-border overflow-y-auto min-h-0">
          <div className="flex flex-row flex-wrap gap-4 pb-4">
            {MOCK_PHOTOS.map((photo) => {
              const isSelected = selectedPhotoIds.includes(photo.id);
              
              return (
                <button 
                  key={photo.id} 
                  onClick={() => togglePhotoSelect(photo.id)}
                  className={`relative w-[160px] h-[160px] bg-[#EAEAEA] rounded-lg flex justify-center items-center border hover:border-gray-400 transition-colors focus:outline-none ${
                    isSelected ? 'border-accent' : 'border-[#D0D0D0]'
                  }`}
                >
                  <div className={`absolute top-2 left-2 w-6 h-6 rounded border flex items-center justify-center z-10 ${
                    isSelected ? 'bg-accent border-accent' : 'bg-white border-[#C0C0C0]'
                  }`}>
                    {isSelected && <span className="text-white font-bold text-sm leading-none">✓</span>}
                  </div>
                  <span className="text-[#888888] font-bold">{photo.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. 중첩 모달: 전체 사진 추가 팝업 */}
      {isAddPhotoModalVisible && (
        <div className="fixed inset-0 bg-black/60 z-[10000] flex justify-center items-center">
          <div className="w-[85%] h-[85%] bg-white rounded-[16px] p-[30px] flex flex-col shadow-2xl">
            
            <div className="flex flex-row justify-between items-center mb-[20px] shrink-0">
              <h2 className="text-[24px] font-bold text-text-primary">전체 사진</h2>
              
              <div className="flex flex-row items-center">
                <button 
                  onClick={() => {
                    window.alert(`선택된 ${selectedAllPhotoIds.length}장의 사진을 앨범에 추가했습니다!`);
                    setIsAddPhotoModalVisible(false);
                    setSelectedAllPhotoIds([]);
                  }}
                  className="bg-accent py-2.5 px-5 rounded-lg mr-4 text-white font-bold text-sm hover:bg-accent-dark transition-colors focus:outline-none"
                >
                  선택된 사진 추가
                </button>
                <button 
                  onClick={() => setIsAddPhotoModalVisible(false)} 
                  className="bg-[#E0E0E0] w-9 h-9 rounded-full flex items-center justify-center text-text-primary font-bold text-lg hover:bg-gray-300 transition-colors focus:outline-none"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-2">
              <div className="flex flex-row flex-wrap gap-4">
                {MOCK_ALL_PHOTOS.map((photo) => {
                  const isSelected = selectedAllPhotoIds.includes(photo.id);
                  return (
                    <button 
                      key={photo.id} 
                      onClick={() => toggleAllPhotoSelect(photo.id)}
                      className={`relative w-[140px] h-[140px] bg-[#F0F0F0] rounded-lg flex justify-center items-center border hover:border-gray-400 transition-colors focus:outline-none ${
                        isSelected ? 'border-accent' : 'border-[#D0D0D0]'
                      }`}
                    >
                      <div className={`absolute top-2 left-2 w-6 h-6 rounded border flex items-center justify-center z-10 ${
                        isSelected ? 'bg-accent border-accent' : 'bg-white border-[#C0C0C0]'
                      }`}>
                        {isSelected && <span className="text-white font-bold text-sm leading-none">✓</span>}
                      </div>
                      <span className="text-[#888888] font-bold">{photo.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
};