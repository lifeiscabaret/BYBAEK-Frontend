// 타겟 경로: src/components/PhotoSyncProgress.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '@/api/index';

interface SyncStatus {
  is_syncing: boolean;
  total_detected: number;
  processed_count: number;
  saved_count: number;
  filtered_count: number;
  is_first_sync?: boolean; // 🚨 백엔드에서 내려줄 최초 동기화 여부
}

export function PhotoSyncProgress() {
  const shopId = '3sesac18'; 
  const [status, setStatus] = useState<SyncStatus | null>(null);
  
  // 상태바 표시 여부
  const [isVisible, setIsVisible] = useState(false);
  
  // 🚨 [추가] 베스트 3장 선택 모달 관련 상태
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);
  
  // 동기화 이전 상태를 기억하여 '완료되는 순간'을 포착하기 위한 Ref
  const wasSyncingRef = useRef<boolean>(false);

  useEffect(() => {
    const checkSyncStatus = async () => {
      try {
        const response = await apiClient.get(`/photos/sync-status/${shopId}`);
        const data: SyncStatus = response.data;
        setStatus(data);

        // 1. 동기화가 진행 중일 때 상태바 띄우기
        if (data.is_syncing) {
          setIsVisible(true);
          wasSyncingRef.current = true;
        } 
        // 2. 방금 막 동기화가 끝났을 때 (true -> false 로 변하는 순간)
        else if (wasSyncingRef.current && !data.is_syncing) {
          wasSyncingRef.current = false;
          
          if (data.is_first_sync) {
            // 🚨 최초 동기화라면: 상태바를 숨기고 사진 선택 모달을 띄움
            setIsVisible(false);
            fetchPhotosForSelection(); // 전체 사진 불러오기
            setShowFavoriteModal(true);
          } else {
            // 일반 동기화라면: 5초 뒤에 상태바 조용히 숨기기
            setTimeout(() => setIsVisible(false), 5000);
          }
        }
      } catch (error) {
        // 에러 무시
      }
    };

    checkSyncStatus();
    const intervalId = setInterval(checkSyncStatus, 3000);
    return () => clearInterval(intervalId);
  }, []);

  // 🚨 [추가] 모달에 띄울 전체 사진 목록 불러오기
  const fetchPhotosForSelection = async () => {
    try {
      const response = await apiClient.get(`/photos/all/${shopId}`);
      setAllPhotos(response.data.photos || []);
    } catch (error) {
      console.error("사진 로딩 실패:", error);
    }
  };

  // 🚨 [추가] 사진 선택 토글 (최대 3장까지만 선택 가능)
  const toggleFavoriteSelect = (photoId: string) => {
    setSelectedFavorites((prev) => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId); // 해제
      } else {
        if (prev.length >= 3) {
          alert('베스트 사진은 최대 3장까지만 선택할 수 있습니다.');
          return prev;
        }
        return [...prev, photoId]; // 추가
      }
    });
  };

  // 🚨 [추가] 3장 선택 완료 후 DB에 저장하기
  const handleSaveFavorites = async () => {
    if (selectedFavorites.length < 3) {
      alert('AI가 샵의 스타일을 분석할 수 있도록 꼭 3장을 선택해주세요!');
      return;
    }

    try {
      await apiClient.post(`/onboarding/favorites/${shopId}`, {
        favorite_photos: selectedFavorites
      });
      alert('나만의 AI 마케터 설정이 모두 완료되었습니다!');
      setShowFavoriteModal(false); // 모달 닫기
    } catch (error) {
      console.error("즐겨찾기 저장 실패:", error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };


  // 퍼센트 계산
  const percent = status && status.total_detected > 0 
    ? Math.round((status.processed_count / status.total_detected) * 100) 
    : 0;

  return (
    <>
      {/* 1. 상단 중앙 동기화 프로그래스 바 */}
      {isVisible && status && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 z-[9000] animate-in slide-in-from-top-10 fade-in duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              {status.is_syncing ? (
                <div className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              ) : (
                <div className="w-3.5 h-3.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              )}
              <h3 className="text-[15px] font-bold text-gray-800">
                {status.is_syncing ? 'OneDrive 사진을 가져오는 중입니다' : '사진 동기화 완료!'}
              </h3>
            </div>
            {!status.is_syncing && !status.is_first_sync && (
              <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-700 text-lg">✕</button>
            )}
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full mb-3 overflow-hidden shadow-inner">
            <div className={`h-full transition-all duration-500 ease-out rounded-full ${status.is_syncing ? 'bg-blue-500' : 'bg-green-500'}`} style={{ width: `${percent}%` }} />
          </div>
          <div className="flex justify-between text-[13px] text-gray-500 mb-3 px-1">
            <span>처리 진행률</span>
            <span className="font-bold">{status.processed_count} / {status.total_detected} 장 ({percent}%)</span>
          </div>
        </div>
      )}

      {/* 2. 🚨 최초 동기화 완료 후: 베스트 사진 3장 선택 모달 */}
      {showFavoriteModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-[850px] h-[650px] flex flex-col p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            
            {/* 모달 헤더 */}
            <div className="flex justify-between items-start mb-6 shrink-0">
              <div>
                <h2 className="text-[26px] font-bold text-text-primary mb-2">
                  🎉 OneDrive 연동이 완료되었습니다!
                </h2>
                <p className="text-text-secondary text-[15px]">
                  AI 마케터가 사장님 샵의 시그니처 스타일을 완벽히 파악할 수 있도록,<br/>
                  성공적으로 업로드된 사진 중 <strong className="text-accent">가장 마음에 드는 베스트 사진 3장</strong>을 선택해 주세요.
                  ({selectedFavorites.length}/3)
                </p>
              </div>
              <button 
                onClick={handleSaveFavorites}
                disabled={selectedFavorites.length < 3}
                className={`px-8 py-3.5 rounded-xl font-bold text-[15px] transition-colors shadow-md ${
                  selectedFavorites.length === 3 
                    ? 'bg-accent text-white hover:bg-accent-dark' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                선택 완료
              </button>
            </div>

            {/* 사진 선택 그리드 */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide border-t border-gray-100 pt-6">
              {allPhotos.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  불러올 사진이 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4 pb-4">
                  {allPhotos.map((photo) => {
                    const isSelected = selectedFavorites.includes(photo.id);
                    return (
                      <button 
                        key={photo.id}
                        onClick={() => toggleFavoriteSelect(photo.id)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                          isSelected ? 'border-accent ring-4 ring-accent/20' : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img src={photo.blob_url} className="w-full h-full object-cover" alt="후보 사진" />
                        
                        {/* 체크박스 UI */}
                        <div className={`absolute top-3 left-3 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-accent border-accent shadow-lg' : 'bg-black/20 border-white/80'
                        }`}>
                          {isSelected && <span className="text-white text-sm font-bold">✓</span>}
                        </div>

                        {/* 선택된 순서 배지 (선택적 표시) */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs shadow-lg">
                            {selectedFavorites.indexOf(photo.id) + 1}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}