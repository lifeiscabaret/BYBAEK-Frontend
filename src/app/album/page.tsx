// 타겟 경로: src/app/album/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { AlbumCard } from '@/components/AlbumCard';
import apiClient from '@/api/index';
import { useTranslation } from '@/hooks/useTranslation';

interface AlbumData {
  id: string;
  isNew?: boolean;
  title?: string;
  description?: string;
  photoCount?: number;
  thumbnailUrl?: string;
}

export default function MyAlbumScreen() {
  const [shopId, setShopId] = useState<string | null>(null);
  // const shopId = "3sesac18"; // 실제 연동 시에는 로그인 유저 ID 사용

  useEffect(() => {
    const storedShopId = localStorage.getItem('shop_id');
    setShopId(storedShopId || '3sesac18'); // 실서버에서는 'guest_shop' 등으로 처리
  }, []);

  const { t } = useTranslation();

  const [albums, setAlbums] = useState<AlbumData[]>([{ id: 'new', isNew: true }]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumData | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [albumPhotos, setAlbumPhotos] = useState<any[]>([]);

  // 🚨 [추가] 사진 선택 팝업을 위한 상태들
  const [isPhotoSelectModalVisible, setIsPhotoSelectModalVisible] = useState(false);
  const [allPhotos, setAllPhotos] = useState<any[]>([]); // 전체 사진 목록
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]); // 팝업 내 임시 선택

  useEffect(() => {
    if (!shopId) return;
    fetchAlbums();
    fetchAllPhotos();
  }, [shopId]);
  
  // 1. 앨범 목록 조회
  const fetchAlbums = async () => {
    try {
      const response = await apiClient.get(`/photos/albums/${shopId}`);
      const dbAlbums = response.data.albums.map((album: any) => ({
        id: album.id,
        title: album.album_name,
        photoCount: album.photo_count,
        description: album.description || t.album.no_desc,
        thumbnailUrl: album.thumbnail_url
      }));
      setAlbums([{ id: 'new', isNew: true }, ...dbAlbums]);
    } catch (error) {
      console.error("앨범 로딩 실패:", error);
      setAlbums([{ id: 'new', isNew: true }]);
    }
  };

  // 2. 전체 사진 목록 조회 (추가 팝업용)
  const fetchAllPhotos = async () => {
    try {
      const response = await apiClient.get(`/photos/all/${shopId}`);
      setAllPhotos(response.data.photos || []);
    } catch (error) {
      console.error("전체 사진 로딩 실패:", error);
    }
  };

  useEffect(() => {
    fetchAlbums();
    fetchAllPhotos();
  }, []);

  // 앨범 내 사진 제거 (개별 ✕ 버튼)
  const handleRemovePhotoFromAlbum = async (photoId: string) => {
    if (!selectedAlbum) return;
    if (!window.confirm(t.album.confirm_remove)) return;

    const updatedPhotos = albumPhotos.filter(p => p.id !== photoId);
    const updatedPhotoIds = updatedPhotos.map(p => p.id);

    try {
      await apiClient.post("/photos/albums", {
        shop_id: shopId,
        album_id: selectedAlbum.id,
        album_name: editTitle,
        description: editDesc,
        photo_ids: updatedPhotoIds
      });
      setAlbumPhotos(updatedPhotos);
      setSelectedAlbum({ ...selectedAlbum, photoCount: updatedPhotos.length });
      fetchAlbums();
    } catch (error) {
      console.error("앨범 수정 실패:", error);
    }
  };

  // 🚨 [수정] 앨범에 사진 추가 확정 (저장 버튼 클릭 시)
  const handleSaveSelectedPhotos = async () => {
    if (!selectedAlbum || tempSelectedIds.length === 0) return;

    const currentIds = albumPhotos.map(p => p.id);
    const combinedIds = Array.from(new Set([...currentIds, ...tempSelectedIds]));

    try {
      await apiClient.post("/photos/albums", {
        shop_id: shopId,
        album_id: selectedAlbum.id,
        album_name: editTitle,
        description: editDesc,
        photo_ids: combinedIds
      });

      const response = await apiClient.get(`/photos/albums/${shopId}/${selectedAlbum.id}`);
      setAlbumPhotos(response.data.photos);
      setSelectedAlbum({ ...selectedAlbum, photoCount: response.data.photos.length });
      
      fetchAlbums();
      setIsPhotoSelectModalVisible(false); // 팝업 닫기
      setTempSelectedIds([]); // 선택 초기화
    } catch (error) {
      console.error("사진 추가 실패:", error);
    }
  };

  const toggleSelect = (index: number) => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const openAlbumDetail = async (album: AlbumData) => {
    setSelectedAlbum(album);
    setEditTitle(album.id === 'new' ? '' : (album.title || ''));
    setEditDesc(album.id === 'new' ? '' : (album.description || ''));

    if (album.id !== 'new') {
      try {
        const response = await apiClient.get(`/photos/albums/${shopId}/${album.id}`);
        setAlbumPhotos(response.data.photos);
      } catch (error) {
        setAlbumPhotos([]);
      }
    } else {
      setAlbumPhotos([]);
    }
    setIsDetailModalVisible(true);
  };

  const handleSaveOverlay = async () => {
    if (!selectedAlbum) return;
    try {
      const photoIds = albumPhotos.map(p => p.id);
      await apiClient.post("/photos/albums", {
        shop_id: shopId,
        album_id: selectedAlbum.id === 'new' ? null : selectedAlbum.id,
        album_name: editTitle || t.album.default_new_name,
        description: editDesc,
        photo_ids: photoIds
      });
      fetchAlbums();
      setIsDetailModalVisible(false);
    } catch (error) {
      console.error("저장 실패:", error);
    }
  };

  const handleDeleteAlbums = async () => {
    if (selectedIndexes.length === 0) return;
    // 🚨 [다국어 적용] {count} 부분을 실제 숫자로 교체해서 텍스트 생성
    const confirmMessage = t.album.confirm_delete.replace('{count}', selectedIndexes.length.toString());
    
    if (window.confirm(confirmMessage)) {
      try {
        await Promise.all(
          selectedIndexes.map(async (idx) => {
            const albumId = albums[idx].id;
            if (albumId !== 'new') return apiClient.delete(`/photos/albums/${shopId}/${albumId}`);
          })
        );
        fetchAlbums();
        setSelectedIndexes([]);
      } catch (error) {
        console.error("앨범 삭제 실패:", error);
      }
    }
  };

  return (
    <div className="flex flex-row h-screen w-full bg-background relative overflow-hidden">
      <Sidebar />

      <div className="flex-1 p-large flex flex-col min-w-0 h-full">
        <div className="flex flex-row justify-between items-center mb-large shrink-0">
          {/* 🚨 [다국어 적용] 타이틀 */}
          <h1 className="text-h1 font-bold text-text-primary">{t.album.title}</h1>
          <button onClick={handleDeleteAlbums} className="px-medium py-2 border border-accent rounded-md bg-white text-accent font-bold text-sm hover:bg-red-50 transition-colors">
            {/* 🚨 [다국어 적용] 선택된 앨범 삭제 */}
            {t.album.delete_selected}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-large scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {albums.map((item, index) => {
              if (item.isNew) {
                return (
                  <button key={item.id} onClick={() => openAlbumDetail(item)} className="w-full h-full min-h-[260px] bg-white rounded-xl border-2 border-dashed border-[#D0D0D0] flex flex-col justify-center items-center hover:bg-gray-50 group">
                    <span className="text-[40px] font-light text-[#A0A0A0] mb-2 group-hover:scale-110 transition-transform">+</span>
                    {/* 🚨 [다국어 적용] 새 앨범 만들기 */}
                    <span className="text-[16px] font-bold text-[#1A1A1A]">{t.album.create_new}</span>
                  </button>
                );
              }
              return (
                <AlbumCard key={item.id} item={item} index={index} isSelected={selectedIndexes.includes(index)} onToggleSelect={toggleSelect} onOpenDetail={openAlbumDetail} />
              );
            })}
          </div>
        </div>

      {/* 앨범 상세 오버레이 */}
      {isDetailModalVisible && selectedAlbum && (
        <div className="absolute inset-0 z-[9999] bg-white flex flex-row">
          <Sidebar /> 
          <div className="flex-1 p-[40px] flex flex-col h-screen overflow-hidden">
            <div className="flex flex-row justify-between items-start mb-[30px] shrink-0">
              <div className="flex-1 pr-5 flex flex-col">
                {/* 🚨 [다국어 적용] 앨범 제목 Placeholder */}
                <input type="text" className="text-[32px] font-bold text-[#1A1A1A] mb-2 focus:outline-none bg-transparent" placeholder={t.album.placeholder_title} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                {/* 🚨 [다국어 적용] 설명 입력 Placeholder */}
                <input type="text" className="text-base text-[#666666] mb-4 focus:outline-none bg-transparent w-full" placeholder={t.album.placeholder_desc} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                {/* 🚨 [다국어 적용] 총 N장의 사진 */}
                <span className="text-[15px] text-[#888] font-bold">
                  {t.album.total_photos.replace('{count}', (selectedAlbum.photoCount || 0).toString())}
                </span>
              </div>
              <div className="flex flex-col items-end gap-4">
                <div className="flex flex-row items-center gap-3">
                  {/* 🚨 [다국어 적용] 공통 저장 버튼 */}
                  <button onClick={handleSaveOverlay} className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-lg font-bold text-sm">{t.common.save}</button>
                  <button onClick={() => setIsDetailModalVisible(false)} className="bg-[#8A0020] text-white w-10 h-10 rounded-full flex justify-center items-center text-[20px] font-bold">✕</button>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <button 
                    onClick={() => {
                      setTempSelectedIds([]); 
                      setIsPhotoSelectModalVisible(true);
                    }}
                    className="bg-[#8A0020] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-red-900 transition-colors"
                  >
                    {/* 🚨 [다국어 적용] 사진 추가 */}
                    {t.album.add_photo}
                  </button>
                </div>
              </div>
            </div>

            <div className={`flex-1 bg-[#F9F9F9] rounded-xl border border-[#E0E0E0] min-h-0 overflow-y-auto ${albumPhotos.length > 0 ? 'p-[30px] block' : 'flex justify-center items-center'}`}>
              {albumPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {albumPhotos.map((photo: any) => (
                    <div key={photo.id} className="relative aspect-square bg-white rounded-lg overflow-hidden border border-[#EEE] group">
                      <img src={photo.blob_url} alt={photo.original_name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
                      {/* 개별 사진 삭제 버튼 */}
                      <button onClick={(e) => { e.stopPropagation(); handleRemovePhotoFromAlbum(photo.id); }} className="absolute top-2 right-2 bg-white/80 text-red-600 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">✕</button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[18px] text-[#A0A0A0]">{t.album.empty_album}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 사진 선택 모달 */}
      {isPhotoSelectModalVisible && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-[800px] h-[600px] flex flex-col p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6 shrink-0">
              {/* 🚨 [다국어 적용] 모달 타이틀 */}
              <h2 className="text-2xl font-bold text-text-primary">{t.album.modal_photo_title}</h2>
              <div className="flex gap-3">
                <button 
                  onClick={handleSaveSelectedPhotos}
                  className="bg-accent text-white px-6 py-2 rounded-lg font-bold hover:bg-accent-dark transition-colors"
                >
                  {/* 🚨 [다국어 적용] 공통 저장 버튼 */}
                  {t.common.save}
                </button>
                <button 
                  onClick={() => setIsPhotoSelectModalVisible(false)}
                  className="text-text-secondary hover:text-text-primary text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
              <div className="grid grid-cols-4 gap-4 pb-4">
                {allPhotos.map((photo) => {
                  const isTempSelected = tempSelectedIds.includes(photo.id);
                  return (
                    <button 
                      key={photo.id}
                      onClick={() => {
                        setTempSelectedIds(prev => 
                          isTempSelected ? prev.filter(id => id !== photo.id) : [...prev, photo.id]
                        );
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        isTempSelected ? 'border-accent ring-2 ring-accent' : 'border-transparent'
                      }`}
                    >
                      <img src={photo.blob_url} className="w-full h-full object-cover" />
                      <div className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isTempSelected ? 'bg-accent border-accent' : 'bg-white/80 border-gray-400'
                      }`}>
                        {isTempSelected && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}