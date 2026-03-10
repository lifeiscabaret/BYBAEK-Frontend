// 타겟 경로: src/app/photos/page.tsx
"use client";

import React, { useState, useEffect } from 'react'; 
import { Sidebar } from '@/components/Sidebar';
import apiClient from '@/api/index'; 
// 🚨 [다국어 적용] 번역 훅 불러오기
import { useTranslation } from '@/hooks/useTranslation';

interface CustomAlertState {
  isOpen: boolean;
  message: string;
  type: 'ALERT' | 'CONFIRM';
  onConfirm?: () => void;
}

export default function AllPhotosScreen() {
  // 🚨 [다국어 적용] 번역 객체 t 장착
  const { t } = useTranslation();

  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  const [customAlert, setCustomAlert] = useState<CustomAlertState>({
    isOpen: false,
    message: '',
    type: 'ALERT'
  });

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [loading, setLoading] = useState(true); 

  const fetchPhotos = async () => {
    try {
      const shopId = "3sesac18"; 
      const response = await apiClient.get(`https://bybaek-backend-awehcre3f3fpb4fg.koreacentral-01.azurewebsites.net/api/photos/all/${shopId}`);
      setPhotos(response.data.photos); 
    } catch (error) {
      console.error("사진 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const toggleSelect = (index: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // 🚨 [핵심 수정] 톤앤매너에 맞게 window.alert, confirm을 모두 customAlert로 교체!
  const handleDelete = async () => {
    if (selectedIndexes.length === 0) {
      setCustomAlert({
        isOpen: true,
        message: t.photos.select_photo_first,
        type: 'ALERT'
      });
      return;
    }
    
    const confirmMessage = t.photos.confirm_delete_msg.replace('{count}', selectedIndexes.length.toString());

    setCustomAlert({
      isOpen: true,
      message: confirmMessage,
      type: 'CONFIRM',
      onConfirm: async () => {
        try {
          const shopId = "3sesac18";
          
          await Promise.all(
            selectedIndexes.map(async (idx) => {
              const photoId = photos[idx].id;
              return apiClient.delete(`/photos/${shopId}/${photoId}`);
            })
          );

          // 삭제 성공 알림창 띄우기
          setCustomAlert({
            isOpen: true,
            message: t.photos.delete_success_msg,
            type: 'ALERT'
          });
          
          fetchPhotos();
          setSelectedIndexes([]); 
        } catch (error) {
          console.error("사진 삭제 실패:", error);
          // 삭제 실패 알림창 띄우기
          setCustomAlert({
            isOpen: true,
            message: t.photos.delete_error_msg,
            type: 'ALERT'
          });
        }
      }
    });
  };

  const openViewer = (index: number) => {
    setCurrentViewIndex(index);
    setIsViewerOpen(true);
  };

  const handlePrevImage = () => {
    if (currentViewIndex > 0) {
      setCurrentViewIndex(currentViewIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (currentViewIndex < photos.length - 1) {
      setCurrentViewIndex(currentViewIndex + 1);
    }
  };

  const renderCustomAlert = () => {
    if (!customAlert.isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[99999]">
        <div className="bg-background rounded-xl shadow-lg p-8 w-[360px] flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            customAlert.type === 'CONFIRM' ? 'bg-[#FFE5E5]' : 'bg-red-50'
          }`}>
            <span className={`text-2xl font-bold leading-none ${
              customAlert.type === 'CONFIRM' ? 'text-[#E02424]' : 'text-accent'
            }`}>!</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            {/* 🚨 [다국어 적용] 타이틀 */}
            {customAlert.type === 'CONFIRM' ? t.photos.delete_photo_title : t.photos.alert_title}
          </h3>
          <p className="text-sm text-text-secondary text-center mb-6 whitespace-pre-wrap leading-relaxed">
            {customAlert.message}
          </p>
          <div className="flex flex-row w-full gap-3">
            {customAlert.type === 'CONFIRM' && (
              <button
                onClick={() => setCustomAlert({ ...customAlert, isOpen: false })}
                className="flex-1 py-3 bg-[#E0E0E0] text-text-primary rounded-lg font-bold hover:bg-gray-300 transition-colors focus:outline-none"
              >
                {/* 🚨 [다국어 적용] 취소 */}
                {t.common.cancel}
              </button>
            )}
            <button
              onClick={() => {
                // 🚨 onConfirm이 있으면 모달을 닫은 뒤 바로 실행하도록 최적화
                setCustomAlert({ ...customAlert, isOpen: false });
                if (customAlert.onConfirm) customAlert.onConfirm();
              }}
              className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors focus:outline-none ${
                customAlert.type === 'CONFIRM' ? 'bg-[#E02424] hover:bg-red-800' : 'bg-accent hover:bg-accent-dark'
              }`}
            >
              {/* 🚨 [다국어 적용] 확인 / 삭제하기 분기 */}
              {customAlert.type === 'CONFIRM' ? t.photos.btn_delete : t.common.confirm}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-row h-screen w-full bg-background overflow-hidden relative">
      <Sidebar />
      
      <div className="flex-1 p-large bg-[#FAFAFA] flex flex-col min-w-0 h-full">
        <div className="flex flex-row justify-between items-center mb-large pb-small border-b border-border shrink-0">
          {/* 🚨 [다국어 적용] 타이틀 */}
          <h1 className="text-h1 text-text-primary font-bold">{t.photos.title}</h1>
          <button 
            onClick={handleDelete}
            className="px-medium py-2 border border-accent rounded-md bg-white text-accent font-bold text-sm hover:bg-red-50 transition-colors focus:outline-none"
          >
            {/* 🚨 [다국어 적용] 선택된 사진 삭제 */}
            {t.photos.delete_selected}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-hide">
          <div className="flex flex-row flex-wrap gap-4 pb-large">
            
              {loading ? (
                <div className="flex justify-center items-center w-full h-40">
                  {/* 🚨 [다국어 적용] 로딩 텍스트 */}
                  <p className="text-text-secondary">{t.photos.loading_photos}</p>
                </div>
              ) : (
                photos.map((photo, index) => {
                  const isSelected = selectedIndexes.includes(index);
                  
                  return (
                    <div 
                      key={photo.id || `photo-${index}`}
                      className={`relative w-[180px] h-[180px] bg-[#EAEAEA] rounded-lg border overflow-hidden transition-all shrink-0 group ${
                        isSelected ? 'border-accent border-[3px]' : 'border-border hover:border-gray-400'
                      }`}
                    >
                      <button 
                        onClick={() => openViewer(index)}
                        className="w-full h-full focus:outline-none"
                      >
                        <img 
                          src={photo.blob_url} 
                          alt={photo.original_name} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                        />
                      </button>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(index);
                        }}
                        className="absolute top-[8px] left-[8px] p-1 z-10 focus:outline-none"
                      >
                        <div className={`w-[22px] h-[22px] rounded border-2 flex justify-center items-center transition-colors shadow-sm ${
                          isSelected ? 'bg-accent border-accent' : 'bg-white border-text-secondary hover:border-gray-500'
                        }`}>
                          {isSelected && <span className="text-white text-sm font-bold leading-none">✓</span>}
                        </div>
                      </button>
                    </div>
                  );
                })
              )}
            
          </div>
        </div>
      </div>

      {renderCustomAlert()}

      {/* 이미지 뷰어 */}
      {isViewerOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
          <div className="w-[800px] h-[650px] bg-background rounded-xl shadow-lg p-large flex flex-col justify-between">
            
            <div className="flex justify-between items-center mb-large shrink-0">
              {/* 🚨 [다국어 적용] 뷰어 타이틀 */}
              <h2 className="text-h2 font-bold text-text-primary">{t.photos.viewer_title}</h2>
              <button 
                onClick={() => setIsViewerOpen(false)} 
                className="text-[20px] text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 flex flex-row items-center justify-between min-h-0">
              <button 
                onClick={handlePrevImage}
                disabled={currentViewIndex === 0}
                className={`p-2 text-4xl font-light transition-colors focus:outline-none ${
                  currentViewIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-text-secondary hover:text-accent'
                }`}
              >
                ‹
              </button>

              <div className="flex-1 h-full mx-4 bg-[#F5F5F5] border border-border rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                {photos[currentViewIndex] && (
                  <img 
                    src={photos[currentViewIndex].blob_url} 
                    alt={photos[currentViewIndex].original_name}
                    className="max-w-full max-h-[500px] object-contain rounded-md shadow-sm"
                  />
                )}
                
                <div className="absolute bottom-4 bg-black/50 px-4 py-1.5 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                  {currentViewIndex + 1} / {photos.length}
                </div>
              </div>

              <button 
                onClick={handleNextImage}
                disabled={currentViewIndex === photos.length - 1}
                className={`p-2 text-4xl font-light transition-colors focus:outline-none ${
                  currentViewIndex === photos.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-text-secondary hover:text-accent'
                }`}
              >
                ›
              </button>
            </div>

            <div className="flex flex-row justify-center mt-large shrink-0">
              <button 
                onClick={() => setIsViewerOpen(false)} 
                className="w-full bg-[#E0E0E0] py-3 rounded-lg flex items-center justify-center text-text-primary font-bold hover:bg-gray-300 transition-colors focus:outline-none"
              >
                {/* 🚨 [다국어 적용] 공통 닫기 버튼 */}
                {t.common.close}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}