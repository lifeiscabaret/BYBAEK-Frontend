// 타겟 경로: src/app/photos/page.tsx
"use client";

import React, { useState, useEffect } from 'react'; //DB 연동
import { Sidebar } from '@/components/Sidebar';
import apiClient from '@/api/index'; //DB 연동

export default function AllPhotosScreen() {
  //const [photos, setPhotos] = useState(Array.from({ length: 20 }, (_, i) => `사진 ${i + 1}`)); //DB 연동
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
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

  const handleDelete = () => {
    if (selectedIndexes.length === 0) {
      window.alert('삭제할 사진을 먼저 선택해주세요.');
      return;
    }
    
    if (window.confirm(`선택한 ${selectedIndexes.length}개의 사진을 삭제하시겠습니까?`)) {
      setPhotos(photos.filter((_, idx) => !selectedIndexes.includes(idx)));
      setSelectedIndexes([]); 
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

  return (
    // 🚨 1. 전체 높이 고정 및 스크롤 숨김
    <div className="flex flex-row h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      
      {/* 🚨 2. 메인 콘텐츠 영역 높이 100% (h-full) */}
      <div className="flex-1 p-large bg-[#FAFAFA] flex flex-col min-w-0 h-full">
        
        {/* 상단 헤더 영역 (shrink-0 유지) */}
        <div className="flex flex-row justify-between items-center mb-large pb-small border-b border-border shrink-0">
          <h1 className="text-h1 text-text-primary font-bold">전체 사진</h1>
          <button 
            onClick={handleDelete}
            className="px-medium py-2 border border-accent rounded-md bg-white text-accent font-bold text-sm hover:bg-red-50 transition-colors focus:outline-none"
          >
            선택된 사진 삭제
          </button>
        </div>

        {/* 🚨 3. 사진 리스트 영역에 독립 스크롤 (min-h-0) 추가 */}
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
    </div>
  );
}