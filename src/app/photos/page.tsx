// 타겟 경로: src/app/photos/page.tsx
"use client";

import React, { useState, useEffect } from 'react'; //DB 연동
import { Sidebar } from '@/components/Sidebar';
import apiClient from '@/api/index'; //DB 연동

interface CustomAlertState {
  isOpen: boolean;
  message: string;
  type: 'ALERT' | 'CONFIRM';
  onConfirm?: () => void;
}

export default function AllPhotosScreen() {
  //const [photos, setPhotos] = useState(Array.from({ length: 20 }, (_, i) => `사진 ${i + 1}`)); //DB 연동
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  // 커스텀 알림/확인창 상태
  const [customAlert, setCustomAlert] = useState<CustomAlertState>({
    isOpen: false,
    message: '',
    type: 'ALERT'
  });

  // 고화질 이미지 뷰어 모달 상태
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [loading, setLoading] = useState(true); //DB 연동

  //************ DB 연동 START ************//
  // 1. 데이터 불러오기 함수 (API 호출)
  const fetchPhotos = async () => {
    try {
      const shopId = "3sesac18"; // 실제로는 로그인된 정보를 사용합니다.
      const response = await apiClient.get(`http://localhost:8000/api/photos/all/${shopId}`);
      setPhotos(response.data.photos); // {"photos": [...]} 구조에 맞춤
    } catch (error) {
      console.error("사진 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. 컴포넌트가 켜질 때 실행
  useEffect(() => {
    fetchPhotos();
  }, []);
  
  //************ DB 연동 END ************//

  const toggleSelect = (index: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleDelete = async () => {
    if (selectedIndexes.length === 0) {
      setCustomAlert({
        isOpen: true,
        message: '삭제할 사진을 먼저 선택해주세요.',
        type: 'ALERT'
      });
      return;
    }
    
    if (window.confirm(`선택한 ${selectedIndexes.length}개의 사진을 영구 삭제하시겠습니까?\n(앨범에서도 모두 삭제됩니다)`)) {
      try {
        const shopId = "3sesac18";
        
        // 🚨 백엔드 사진 삭제 API 호출
        // Promise.all로 선택된 모든 사진을 병렬로 삭제 처리
        await Promise.all(
          selectedIndexes.map(async (idx) => {
            const photoId = photos[idx].id;
            return apiClient.delete(`/photos/${shopId}/${photoId}`);
          })
        );

        window.alert('선택한 사진이 모두 삭제되었습니다.');
        
        // 🔄 삭제 후 서버에서 다시 목록 불러오기
        fetchPhotos();
        setSelectedIndexes([]); 
      } catch (error) {
        console.error("사진 삭제 실패:", error);
        window.alert('사진 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const openOneDrive = () => {
    const oneDriveUrl = 'https://onedrive.live.com'; 
    try {
      window.open(oneDriveUrl, '_blank');
    } catch (error) {
      window.alert('오류: 원드라이브를 열 수 없습니다.');
    }
  };

    // 이미지 뷰어 제어 핸들러
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
            {customAlert.type === 'CONFIRM' ? '사진 삭제' : '알림'}
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
                취소
              </button>
            )}
            <button
              onClick={() => {
                if (customAlert.onConfirm) customAlert.onConfirm();
                setCustomAlert({ ...customAlert, isOpen: false });
              }}
              className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors focus:outline-none ${
                customAlert.type === 'CONFIRM' ? 'bg-[#E02424] hover:bg-red-800' : 'bg-accent hover:bg-accent-dark'
              }`}
            >
              {customAlert.type === 'CONFIRM' ? '삭제하기' : '확인'}
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
          <h1 className="text-h1 text-text-primary font-bold">전체 사진</h1>
          <button 
            onClick={handleDelete}
            className="px-medium py-2 border border-accent rounded-md bg-white text-accent font-bold text-sm hover:bg-red-50 transition-colors focus:outline-none"
          >
            선택된 사진 삭제
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-hide">
          <div className="flex flex-row flex-wrap gap-4 pb-large">
            
            <button 
              onClick={openOneDrive} 
              className="w-[180px] h-[180px] bg-white rounded-lg border-2 border-dashed border-border flex flex-col justify-center items-center hover:bg-gray-50 transition-colors focus:outline-none group shrink-0"
            >
              <span className="text-[40px] font-light text-accent mb-2 transition-transform group-hover:scale-110">
                +
              </span>
              <span className="text-body font-bold text-text-secondary group-hover:text-text-primary transition-colors">
                새 사진 업로드
              </span>
            </button>
              {/* DB 연동 */}
              {loading ? (
                <div className="flex justify-center items-center w-full h-40">
                  <p className="text-text-secondary">사진을 불러오는 중입니다...</p>
                </div>
              ) : (
                photos.map((photo, index) => { // 1. photoName 대신 진짜 photo 객체 사용
                  const isSelected = selectedIndexes.includes(index);
                  
                  return (
                    <button 
                      key={photo.id || `photo-${index}`} // 2.DB의 진짜 ID 사용
                      onClick={() => toggleSelect(index)}
                      className={`relative w-[180px] h-[180px] bg-[#EAEAEA] rounded-lg border flex justify-center items-center overflow-hidden transition-all focus:outline-none shrink-0 ${
                        isSelected ? 'border-accent border-2' : 'border-border hover:border-gray-400'
                      }`}
                    >
                      {/* 체크박스 디자인 유지 */}
                      <div className={`absolute top-[10px] left-[10px] w-[22px] h-[22px] rounded border-2 z-10 flex justify-center items-center transition-colors ${
                        isSelected ? 'bg-accent border-accent' : 'bg-white border-text-secondary'
                      }`}>
                        {isSelected && <span className="text-white text-sm font-bold leading-none">✓</span>}
                      </div>
                      
                      {/* 3. 텍스트 대신 진짜 이미지를 꽉 차게 보여주기 */}
                      <img 
                        src={photo.blob_url} //DB의 blob_url
                        alt={photo.original_name} //DB의 파일 이름
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  );
                })
              )}
            
          </div>
        </div>
      </div>

      {renderCustomAlert()}

      {/* 🚨 기존 서비스 테마(표준 모달창)를 완벽하게 적용한 사진 뷰어 */}
      {isViewerOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
          {/* 가로로 넓게 설정 (w-[800px]) */}
          <div className="w-[800px] h-[650px] bg-background rounded-xl shadow-lg p-large flex flex-col justify-between">
            
            {/* 1. 상단 헤더 (타이틀 & 닫기버튼) */}
            <div className="flex justify-between items-center mb-large shrink-0">
              <h2 className="text-h2 font-bold text-text-primary">원본 사진 보기</h2>
              <button 
                onClick={() => setIsViewerOpen(false)} 
                className="text-[20px] text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
              >
                ✕
              </button>
            </div>

            {/* 2. 메인 콘텐츠 (좌우 화살표 + 사진 영역) */}
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
                <span className="text-[24px] font-bold text-text-primary">
                  {photos[currentViewIndex]} <span className="text-accent text-lg ml-2">원본 고화질</span>
                </span>
                
                <div className="absolute bottom-4 bg-black/40 px-4 py-1.5 rounded-full text-white text-sm">
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

            {/* 3. 하단 버튼 영역 (통일감을 위한 닫기 버튼) */}
            <div className="flex flex-row justify-center mt-large shrink-0">
              <button 
                onClick={() => setIsViewerOpen(false)} 
                className="w-full bg-[#E0E0E0] py-3 rounded-lg flex items-center justify-center text-text-primary font-bold hover:bg-gray-300 transition-colors focus:outline-none"
              >
                닫기
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}