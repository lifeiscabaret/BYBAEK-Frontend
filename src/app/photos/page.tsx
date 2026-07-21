// 타겟 경로: src/app/photos/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Camera, Trash2, FolderPlus, Share2, ChevronDown, FolderOpen, X } from 'lucide-react';
import apiClient from '@/api/index';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from 'next/navigation';
import type { Photo } from '@/types';

const MOCK_PHOTOS = [
  '/demo/pass_01.jpg', '/demo/pass_02.jpg', '/demo/pass_03.jpg', '/demo/pass_04.jpg',
  'https://picsum.photos/seed/bp1/300/300', 'https://picsum.photos/seed/bp2/300/300',
  'https://picsum.photos/seed/bp3/300/300', 'https://picsum.photos/seed/bp4/300/300',
  'https://picsum.photos/seed/bp5/300/300', 'https://picsum.photos/seed/bp6/300/300',
  'https://picsum.photos/seed/bp7/300/300', 'https://picsum.photos/seed/bp8/300/300',
  'https://picsum.photos/seed/bp9/300/300', 'https://picsum.photos/seed/bp10/300/300',
  'https://picsum.photos/seed/bp11/300/300', 'https://picsum.photos/seed/bp12/300/300',
];

const DEFAULT_ALBUMS = [
  { name: '페이드컷', thumb: '/demo/pass_01.jpg', photoIndexes: [0, 4, 8] },
  { name: '사이드파트', thumb: '/demo/pass_02.jpg', photoIndexes: [1, 5, 9] },
  { name: '아이비리그', thumb: '/demo/pass_03.jpg', photoIndexes: [2, 6, 10] },
  { name: '포마드', thumb: '/demo/pass_04.jpg', photoIndexes: [3, 7, 11] },
];

const font = { fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" };
const tutorialFont = { fontFamily: "'S-Core Dream', sans-serif" };

interface Album {
  name: string;
  thumb: string;
  photoIndexes: number[];
}

interface CustomAlertState {
  isOpen: boolean;
  message: string;
  type: 'ALERT' | 'CONFIRM';
  onConfirm?: () => void;
}

function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <svg width="120" height="210" viewBox="0 0 120 210" fill="none">
      <rect x="1" y="1" width="118" height="208" rx="18" stroke="#1A1A1A" strokeWidth="2" fill="#FAFAFA" />
      <rect x="40" y="6" width="40" height="4" rx="2" fill="#1A1A1A" opacity="0.3" />
      <foreignObject x="8" y="16" width="104" height="180">
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {children}
        </div>
      </foreignObject>
    </svg>
  );
}

function OneDriveTutorialModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [animKey, setAnimKey] = useState(0);
  const [toggleOn, setToggleOn] = useState(false);
  const [appChecked, setAppChecked] = useState<'apple' | 'google' | null>(null);

  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => setToggleOn(true), 1000);
      return () => clearTimeout(timer);
    }
    setToggleOn(false);
  }, [step]);

  const goTo = (next: number) => {
    setDirection(next > step ? 'next' : 'prev');
    setStep(next);
    setAnimKey(k => k + 1);
  };

  const handleComplete = () => {
    localStorage.setItem('onedrive_connected', 'true');
    onClose();
    window.location.reload();
  };

  const slideStyle: React.CSSProperties = {
    animation: `${direction === 'next' ? 'slideInRight' : 'slideInLeft'} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[99999]" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInLeft { from { transform: translateX(-60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes floatUp { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-30px); opacity: 0; } }
        @keyframes slidePhoto { 0% { transform: translateX(0); } 100% { transform: translateX(140px); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <div
        className="relative bg-white flex flex-col items-center overflow-hidden"
        style={{ borderRadius: 20, padding: '36px 32px', maxWidth: 440, width: '90%' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer z-10"
        >
          <X size={18} className="text-gray-500" />
        </button>

        {/* 타이틀 */}
        <h2 className="text-[1.1rem] text-[#1A1A1A] font-bold mb-4" style={tutorialFont}>
          {t.photos_page.tutorial_title}
        </h2>

        {/* 진행 도트 */}
        <div className="flex items-center gap-2 mb-6">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i <= step ? '#8B0000' : '#E0E0E0',
              }}
            />
          ))}
        </div>

        {/* Step Content */}
        <div key={animKey} style={slideStyle} className="w-full flex flex-col items-center">

          {/* Step 1 */}
          {step === 0 && (
            <div className="flex flex-col items-center text-center w-full">
              <div className="h-[200px] flex items-center justify-center relative">
                <PhoneMockup>
                  {/* OneDrive 구름 아이콘 */}
                  <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
                    <path d="M48 32H14c-5.5 0-10-4.5-10-10 0-4.8 3.4-8.8 8-9.7C13.2 6.3 18.8 2 25.5 2c7.2 0 13.2 5 14.6 11.7C45.5 14.5 50 19.5 50 25.5 50 29.1 49.3 32 48 32z" fill="#0078D4"/>
                    <path d="M40 34H10c-4.4 0-8-3.6-8-8 0-3.8 2.7-7 6.3-7.8C9.3 12.5 14 8.5 19.8 8.5c6 0 11 4.2 12.2 9.8C36 19 39.5 22.8 39.5 27.5c0 3.6-.7 6.5-2 6.5" fill="#0078D4" opacity="0.7"/>
                  </svg>
                </PhoneMockup>
                {/* 앱스토어 아이콘들 - fadeInUp */}
                <div className="absolute bottom-2 flex gap-4" style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
                  <button
                    onClick={() => setAppChecked('apple')}
                    className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
                  >
                    {appChecked === 'apple' ? (
                      <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                        <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1 6l5 5L15 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                        <svg width="16" height="20" viewBox="0 0 16 20" fill="none"><path d="M13.2 10.5c0-2.7 2.2-4 2.3-4.1-1.3-1.8-3.2-2.1-3.9-2.1-1.7-.2-3.2 1-4 1s-2.1-1-3.5-1C2.2 4.4.3 6 .3 10.3c0 2.5 1 5.2 2.2 6.9 1 1.4 2.1 3 3.6 2.9 1.4-.1 2-.9 3.6-.9s2.2.9 3.6.9c1.5 0 2.5-1.5 3.4-2.9.8-1.2 1.1-2.3 1.1-2.3-1.4-.6-2.6-2.3-2.6-4.4zM10.8 3c.8-1 1.4-2.3 1.2-3.7-1.2.1-2.6.8-3.4 1.8-.7.9-1.4 2.2-1.2 3.5 1.3.1 2.7-.7 3.4-1.6z" fill="white"/></svg>
                      </div>
                    )}
                    <span className="text-[0.65rem] text-gray-500 mt-1">App Store</span>
                  </button>
                  <button
                    onClick={() => setAppChecked('google')}
                    className="flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
                  >
                    {appChecked === 'google' ? (
                      <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                        <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1 6l5 5L15 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                        <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                          <path d="M1 1.8L10.5 10 1 18.2V1.8z" fill="#4285F4"/>
                          <path d="M1 1.8l6.4 5.5L10 5l7-4H3.5L1 1.8z" fill="#EA4335"/>
                          <path d="M1 18.2l6.4-5.5L10 15l7 4H3.5L1 18.2z" fill="#34A853"/>
                          <path d="M17 5l-4.5 3.2V10l-2 1.8L17 15V5z" fill="#FBBC05"/>
                        </svg>
                      </div>
                    )}
                    <span className="text-[0.65rem] text-gray-500 mt-1">Google Play</span>
                  </button>
                </div>
              </div>
              <h3 className="text-[1rem] text-[#1A1A1A] font-bold mb-2 mt-2" style={tutorialFont}>
                {t.photos_page.tutorial_step1}
              </h3>
              <p className="text-[0.85rem] text-[#999] mb-6" style={tutorialFont}>
                {t.photos_page.tutorial_step1_sub}
              </p>
              <button
                onClick={() => goTo(1)}
                className="px-8 py-3 rounded-[12px] text-white text-[0.9rem] font-bold cursor-pointer hover:opacity-90 transition-opacity"
                style={{ ...tutorialFont, backgroundColor: '#8B0000' }}
              >
                다음 →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <div className="flex flex-col items-center text-center w-full">
              <div className="h-[200px] flex items-center justify-center relative">
                <PhoneMockup>
                  {/* 설정 UI 목업 */}
                  <div style={{ width: '90%', padding: '8px' }}>
                    <div style={{ fontSize: 7, color: '#666', marginBottom: 8, textAlign: 'left' }}>설정</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 4px', borderRadius: 6, backgroundColor: '#F5F5F5' }}>
                      <span style={{ fontSize: 7, color: '#1A1A1A', fontWeight: 600 }}>카메라 업로드</span>
                      {/* 토글 스위치 */}
                      <div
                        style={{
                          width: 28,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: toggleOn ? '#0078D4' : '#CCC',
                          transition: 'background-color 0.4s ease',
                          position: 'relative',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            position: 'absolute',
                            top: 2,
                            left: toggleOn ? 14 : 2,
                            transition: 'left 0.4s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </PhoneMockup>
                {/* 사진 아이콘들 떠오르기 */}
                {toggleOn && (
                  <>
                    <span style={{ position: 'absolute', top: 40, right: 60, animation: 'floatUp 1.5s ease forwards', animationDelay: '0s', fontSize: 16 }}>📷</span>
                    <span style={{ position: 'absolute', top: 50, right: 80, animation: 'floatUp 1.5s ease forwards', animationDelay: '0.3s', fontSize: 14 }}>📷</span>
                    <span style={{ position: 'absolute', top: 30, right: 50, animation: 'floatUp 1.5s ease forwards', animationDelay: '0.6s', fontSize: 12 }}>☁️</span>
                  </>
                )}
              </div>
              <h3 className="text-[1rem] text-[#1A1A1A] font-bold mb-2 mt-2" style={tutorialFont}>
                {t.photos_page.tutorial_step2}
              </h3>
              <p className="text-[0.85rem] text-[#999] mb-6" style={tutorialFont}>
                {t.photos_page.tutorial_step2_sub}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => goTo(0)}
                  className="px-6 py-2.5 rounded-[10px] bg-gray-100 text-[#1A1A1A] text-[0.9rem] font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                  style={tutorialFont}
                >
                  이전
                </button>
                <button
                  onClick={() => goTo(2)}
                  className="px-6 py-3 rounded-[12px] text-white text-[0.9rem] font-bold cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ ...tutorialFont, backgroundColor: '#8B0000' }}
                >
                  다음 →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <div className="flex flex-col items-center text-center w-full">
              <div className="h-[200px] flex items-center justify-center relative" style={{ animation: 'fadeIn 0.5s ease' }}>
                {/* 플로우 다이어그램 */}
                <div className="flex items-center gap-1">
                  {/* 폰 */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">📱</div>
                    <span className="text-[0.55rem] text-gray-500 mt-1">내 폰</span>
                  </div>
                  {/* 점선 화살표 + 슬라이딩 사진 */}
                  <div className="relative w-[60px] h-[20px]">
                    <svg width="60" height="20" viewBox="0 0 60 20">
                      <line x1="0" y1="10" x2="50" y2="10" stroke="#CCC" strokeWidth="1.5" strokeDasharray="4 3" />
                      <path d="M48 6l6 4-6 4" fill="none" stroke="#CCC" strokeWidth="1.5" />
                    </svg>
                    <span style={{ position: 'absolute', top: -2, left: 0, fontSize: 10, animation: 'slidePhoto 2s ease-in-out infinite' }}>🖼️</span>
                  </div>
                  {/* OneDrive */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg">☁️</div>
                    <span className="text-[0.55rem] text-gray-500 mt-1">OneDrive</span>
                  </div>
                  {/* 점선 화살표 */}
                  <div className="relative w-[60px] h-[20px]">
                    <svg width="60" height="20" viewBox="0 0 60 20">
                      <line x1="0" y1="10" x2="50" y2="10" stroke="#CCC" strokeWidth="1.5" strokeDasharray="4 3" />
                      <path d="M48 6l6 4-6 4" fill="none" stroke="#CCC" strokeWidth="1.5" />
                    </svg>
                    <span style={{ position: 'absolute', top: -2, left: 0, fontSize: 10, animation: 'slidePhoto 2s ease-in-out infinite', animationDelay: '1s' }}>🖼️</span>
                  </div>
                  {/* BYBAEK */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8B0000' }}>
                      <span className="text-white text-[0.5rem] font-bold tracking-wider">BY</span>
                    </div>
                    <span className="text-[0.55rem] text-gray-500 mt-1">BYBAEK</span>
                  </div>
                </div>
                {/* 초록 체크 + 완료 텍스트 */}
                <div className="absolute bottom-4 flex items-center gap-2" style={{ animation: 'pulse 2s ease infinite' }}>
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span className="text-[0.8rem] text-green-600 font-bold">연동 완료!</span>
                </div>
              </div>
              <h3 className="text-[1rem] text-[#1A1A1A] font-bold mb-2 mt-2" style={tutorialFont}>
                {t.photos_page.tutorial_step3}
              </h3>
              <p className="text-[0.85rem] text-[#999] mb-6" style={tutorialFont}>
                {t.photos_page.tutorial_step3_sub}
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => goTo(1)}
                  className="px-5 py-2.5 rounded-[10px] bg-gray-100 text-[#1A1A1A] text-[0.9rem] font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                  style={tutorialFont}
                >
                  이전
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 py-3.5 rounded-[12px] text-white text-[0.95rem] font-bold cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ ...tutorialFont, backgroundColor: '#8B0000' }}
                >
                  {t.photos_page.tutorial_startBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AllPhotosScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopId, setShopId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOnedriveConnected, setIsOnedriveConnected] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const [showAlbumSidebar, setShowAlbumSidebar] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [albumNameInput, setAlbumNameInput] = useState('');
  const [albums, setAlbums] = useState<Album[]>(DEFAULT_ALBUMS);
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  const [customAlert, setCustomAlert] = useState<CustomAlertState>({
    isOpen: false, message: '', type: 'ALERT'
  });

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedShopId = localStorage.getItem('shop_id');
      setShopId(storedShopId);
      // localStorage는 초기 페인트용 캐시로만 사용. 진실의 소스는 아래 /auth/status.
      setIsOnedriveConnected(localStorage.getItem('onedrive_connected') === 'true');
    } catch {}
  }, []);

  // OneDrive 연결 여부는 백엔드(/auth/status)를 진실의 소스로 확인. 응답으로 상태·캐시를 덮어씀.
  // (튜토리얼이 localStorage 플래그만 조작하던 가짜 "연결됨"도 여기서 실제값으로 교정됨)
  useEffect(() => {
    if (!shopId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get(`/auth/status/${shopId}`);
        if (cancelled) return;
        const connected = !!res.data?.is_onedrive_connected;
        setIsOnedriveConnected(connected);
        localStorage.setItem('onedrive_connected', connected ? 'true' : 'false'); // 캐시 갱신
      } catch {
        // 조회 실패 시엔 캐시된 값 유지 (진실의 소스 아님, 최선의 캐시)
      }
    })();
    return () => { cancelled = true; };
  }, [shopId]);

  const fetchPhotos = async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/photos/all/${shopId}`);
      setPhotos(response.data.photos || []);
    } catch (error) {
      console.error("사진 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOnedriveConnected) {
      fetchPhotos();
    } else {
      setLoading(false);
    }
  }, [shopId, isOnedriveConnected]);

  const hasPhotos = photos.length > 0;
  const useMockGrid = isOnedriveConnected && !hasPhotos && !loading;
  const totalItems = hasPhotos ? photos.length : (useMockGrid ? MOCK_PHOTOS.length : 0);

  const getVisibleIndexes = (): number[] => {
    if (!activeAlbum) return Array.from({ length: totalItems }, (_, i) => i);
    const album = albums.find(a => a.name === activeAlbum);
    return album ? album.photoIndexes.filter(i => i < totalItems) : [];
  };

  const visibleIndexes = getVisibleIndexes();

  const toggleSelect = (index: number) => {
    setSelectedIndexes(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIndexes.length === visibleIndexes.length) {
      setSelectedIndexes([]);
    } else {
      setSelectedIndexes([...visibleIndexes]);
    }
  };

  const handleDelete = async () => {
    if (selectedIndexes.length === 0) return;
    setCustomAlert({
      isOpen: true,
      message: `${selectedIndexes.length}장의 사진을 삭제하시겠습니까?`,
      type: 'CONFIRM',
      onConfirm: async () => {
        try {
          if (hasPhotos) {
            await Promise.all(
              selectedIndexes
                .filter(idx => idx >= 0 && idx < photos.length)
                .map(idx => apiClient.delete(`/photos/${shopId}/${photos[idx].id}`))
            );
            fetchPhotos();
          }
          setSelectedIndexes([]);
        } catch (error) {
          console.error("사진 삭제 실패:", error);
        }
      }
    });
  };

  const handleCreateAlbum = () => {
    if (!albumNameInput.trim() || selectedIndexes.length === 0) return;
    const firstIdx = selectedIndexes[0];
    let thumb = '/demo/pass_01.jpg';
    if (hasPhotos && photos[firstIdx]) {
      thumb = photos[firstIdx].blob_url;
    } else if (useMockGrid && MOCK_PHOTOS[firstIdx]) {
      thumb = MOCK_PHOTOS[firstIdx];
    }
    const newAlbum: Album = {
      name: albumNameInput.trim(),
      thumb,
      photoIndexes: [...selectedIndexes],
    };
    setAlbums([...albums, newAlbum]);
    setShowAlbumModal(false);
    setAlbumNameInput('');
    setSelectedIndexes([]);
    setShowAlbumSidebar(true);
  };

  const openViewer = (index: number) => {
    setCurrentViewIndex(index);
    setIsViewerOpen(true);
  };

  const getPhotoSrc = (index: number): string => {
    if (hasPhotos) return photos[index]?.blob_url || '';
    return MOCK_PHOTOS[index] || '';
  };

  const handleStartConnect = () => {
    setShowTutorial(true);
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-row h-screen w-full bg-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Empty state - OneDrive 미연결 */}
        {!loading && !isOnedriveConnected && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center max-w-[380px]">
              <Camera size={80} className="text-[#8B0000] mb-6" strokeWidth={1.2} />
              <p className="text-[1.1rem] text-[#1A1A1A] text-center mb-8" style={{ ...font, fontWeight: 400 }}>
                {t.photos_page.empty}
              </p>
              <div className="space-y-3 w-full mb-8">
                <p className="text-[0.9rem] text-[#5a2a2a] flex items-center gap-2.5" style={{ ...font, fontWeight: 300 }}>
                  <span className="text-[#8B0000] font-bold">✓</span> {t.photos_page.benefit1}
                </p>
                <p className="text-[0.9rem] text-[#5a2a2a] flex items-center gap-2.5" style={{ ...font, fontWeight: 300 }}>
                  <span className="text-[#8B0000] font-bold">✓</span> {t.photos_page.benefit2}
                </p>
                <p className="text-[0.9rem] text-[#5a2a2a] flex items-center gap-2.5" style={{ ...font, fontWeight: 300 }}>
                  <span className="text-[#8B0000] font-bold">✓</span> {t.photos_page.benefit3}
                </p>
              </div>
              <button
                onClick={handleStartConnect}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-[12px] bg-white border border-[#e0e0e0] hover:shadow-md transition-shadow cursor-pointer"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12.5 3L6.5 11h4v7h4v-7h4L12.5 3z" fill="#0078D4"/>
                  <path d="M4 14c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2H4z" fill="#0078D4" opacity="0.6"/>
                </svg>
                <span className="text-[0.95rem] text-[#1A1A1A] font-medium" style={font}>{t.photos_page.connectBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-[#8B0000] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Grid state - OneDrive 연결됨 */}
        {!loading && isOnedriveConnected && (hasPhotos || useMockGrid) && (
          <div className="flex-1 flex flex-col h-full">
            {/* 상단 툴바 */}
            <div className="shrink-0 h-[66px] bg-[#FBFBFB] border-b border-gray-100 flex items-center justify-between px-6">
              <div className="flex items-center gap-5">
                {/* 전체선택 체크박스 */}
                <button className="flex items-center gap-2 cursor-pointer" onClick={toggleSelectAll}>
                  <div className={`w-[22px] h-[22px] rounded border-[1.5px] flex items-center justify-center transition-colors ${selectedIndexes.length === visibleIndexes.length && visibleIndexes.length > 0 ? 'bg-[#780000] border-[#780000]' : 'border-[#6B0F1A] bg-white'}`}>
                    {selectedIndexes.length === visibleIndexes.length && visibleIndexes.length > 0 && (
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </div>
                  <span className="text-[14px] font-bold text-[#000]" style={font}>{t.photos_page.all}</span>
                </button>

                {/* 선택 N개 */}
                {selectedIndexes.length > 0 && (
                  <>
                    <span className="text-[14px] font-bold text-[#000]" style={font}>{t.photos_page.selected}</span>
                    <span className="text-[14px] text-[#6B0F1A]" style={{ ...font, fontWeight: 400 }}>{selectedIndexes.length}개</span>
                  </>
                )}

                {/* 액션 버튼 (항상 표시) */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => selectedIndexes.length > 0 && setShowAlbumModal(true)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-[8px] border text-[13px] font-bold transition-all ${selectedIndexes.length > 0 ? 'border-[#e0e0e0] text-[#6B0F1A] opacity-100 cursor-pointer hover:border-[#8B0000]' : 'border-[#e0e0e0] text-[#6B0F1A] opacity-50 cursor-not-allowed'}`}
                    style={{ ...font, background: 'white' }}
                  >
                    <FolderPlus size={16} /> {t.photos_page.album}
                  </button>
                  <button
                    onClick={() => selectedIndexes.length > 0 && handleDelete()}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-[8px] border text-[13px] font-bold transition-all ${selectedIndexes.length > 0 ? 'border-[#e0e0e0] text-[#6B0F1A] opacity-100 cursor-pointer hover:border-[#8B0000]' : 'border-[#e0e0e0] text-[#6B0F1A] opacity-50 cursor-not-allowed'}`}
                    style={{ ...font, background: 'white' }}
                  >
                    <Trash2 size={16} /> {t.photos_page.delete_btn}
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => selectedIndexes.length > 0 && setShowShareDropdown(!showShareDropdown)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-[8px] border text-[13px] font-bold transition-all ${selectedIndexes.length > 0 ? 'border-[#e0e0e0] text-[#6B0F1A] opacity-100 cursor-pointer hover:border-[#8B0000]' : 'border-[#e0e0e0] text-[#6B0F1A] opacity-50 cursor-not-allowed'}`}
                      style={{ ...font, background: 'white' }}
                    >
                      <Share2 size={16} /> {t.photos_page.share} <ChevronDown size={14} />
                    </button>
                    {showShareDropdown && (
                      <div className="absolute top-full left-0 mt-2 bg-white rounded-[9px] py-2 z-50 min-w-[160px]" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                        <button className="w-full px-4 py-2.5 text-left text-[13px] hover:bg-gray-50 cursor-pointer" style={font} onClick={() => setShowShareDropdown(false)}>{t.photos_page.kakao}</button>
                        <button className="w-full px-4 py-2.5 text-left text-[13px] hover:bg-gray-50 cursor-pointer" style={font} onClick={() => setShowShareDropdown(false)}>{t.photos_page.download}</button>
                        <button className="w-full px-4 py-2.5 text-left text-[13px] hover:bg-gray-50 cursor-pointer" style={font} onClick={() => setShowShareDropdown(false)}>{t.photos_page.facebook}</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 우측 앨범 사이드바 토글 */}
              <button
                onClick={() => setShowAlbumSidebar(!showAlbumSidebar)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <FolderOpen size={24} className="text-[#8B0000]" />
              </button>
            </div>

            {/* 탭 (전체 / 앨범명) */}
            {activeAlbum && (
              <div className="shrink-0 px-6 py-3 bg-[#FBFBFB] border-b border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => { setActiveAlbum(null); setSelectedIndexes([]); }}
                  className="text-[13px] text-gray-500 hover:text-[#1A1A1A] cursor-pointer transition-colors"
                  style={font}
                >
                  {t.photos_page.all}
                </button>
                <span className="text-gray-300">/</span>
                <span className="text-[13px] text-[#8B0000] font-medium" style={font}>{activeAlbum}</span>
              </div>
            )}

            {/* 메인 영역 */}
            <div className="flex-1 flex overflow-hidden">
              {/* 그리드 */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="grid grid-cols-4 gap-3">
                  {visibleIndexes.map(i => {
                    const isSelected = selectedIndexes.includes(i);
                    const src = getPhotoSrc(i);
                    return (
                      <div
                        key={i}
                        className={`relative aspect-square rounded-[16px] overflow-hidden cursor-pointer group border-2 transition-all ${isSelected ? 'border-[#780000]' : 'border-transparent hover:border-gray-200'}`}
                        onClick={() => openViewer(i)}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        {/* 체크박스 */}
                        <button
                          className={`absolute top-[10px] left-[10px] w-[22px] h-[22px] rounded border-[1.5px] flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'bg-[#780000] border-[#780000] opacity-100' : 'bg-white/90 border-[#6B0F1A] opacity-0 group-hover:opacity-100'}`}
                          onClick={(e) => { e.stopPropagation(); toggleSelect(i); }}
                        >
                          {isSelected && (
                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 우측 앨범 사이드바 */}
              {showAlbumSidebar && (
                <div className="w-[220px] shrink-0 bg-[#F4F1EC] border-l border-gray-100 overflow-y-auto py-6 px-4">
                  <p className="text-[18px] text-[#6B0F1A] mb-6 font-bold" style={font}>앨범</p>
                  <div className="space-y-5">
                    {albums.map(album => (
                      <button
                        key={album.name}
                        onClick={() => { setActiveAlbum(album.name === activeAlbum ? null : album.name); setSelectedIndexes([]); }}
                        className={`flex items-center gap-3 w-full text-left cursor-pointer hover:opacity-80 transition-opacity rounded-lg p-1 ${activeAlbum === album.name ? 'bg-white/60' : ''}`}
                      >
                        <div className="w-[60px] h-[60px] rounded-full overflow-hidden shrink-0" style={{ boxShadow: '0 4px 4px rgba(0,0,0,0.25)' }}>
                          <img src={album.thumb} alt={album.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[12px] text-[#6B0F1A] font-bold" style={font}>{album.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 튜토리얼 모달 */}
      {showTutorial && (
        <OneDriveTutorialModal onClose={() => setShowTutorial(false)} />
      )}

      {/* 앨범 생성 모달 */}
      {showAlbumModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[99999]" onClick={() => setShowAlbumModal(false)}>
          <div className="bg-white rounded-[16px] p-8 w-[360px] flex flex-col" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-[1.1rem] text-[#1A1A1A] font-bold mb-6" style={font}>{t.photos_page.albumNamePrompt}</h3>
            <input
              type="text"
              value={albumNameInput}
              onChange={e => setAlbumNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateAlbum()}
              placeholder="앨범 이름"
              autoFocus
              className="w-full border border-gray-200 rounded-[10px] px-4 py-3 text-[0.9rem] text-[#1A1A1A] mb-6 focus:outline-none focus:border-[#8B0000] transition-colors"
              style={font}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowAlbumModal(false); setAlbumNameInput(''); }}
                className="flex-1 py-3 bg-gray-100 text-[#1A1A1A] rounded-[10px] font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                style={font}
              >
                취소
              </button>
              <button
                onClick={handleCreateAlbum}
                disabled={!albumNameInput.trim()}
                className={`flex-1 py-3 rounded-[10px] font-medium transition-colors cursor-pointer ${albumNameInput.trim() ? 'bg-[#8B0000] text-white hover:bg-[#6b0000]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                style={font}
              >
                {t.photos_page.create}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 커스텀 알림창 */}
      {customAlert.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[99999]">
          <div className="bg-white rounded-[16px] p-8 w-[360px] flex flex-col items-center" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-red-50">
              <span className="text-[#8B0000] text-2xl font-bold">!</span>
            </div>
            <p className="text-[0.9rem] text-[#1A1A1A] text-center mb-6 whitespace-pre-wrap leading-relaxed" style={font}>
              {customAlert.message}
            </p>
            <div className="flex flex-row w-full gap-3">
              {customAlert.type === 'CONFIRM' && (
                <button
                  onClick={() => setCustomAlert({ ...customAlert, isOpen: false })}
                  className="flex-1 py-3 bg-gray-100 text-[#1A1A1A] rounded-[10px] font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                  style={font}
                >
                  취소
                </button>
              )}
              <button
                onClick={() => {
                  setCustomAlert({ ...customAlert, isOpen: false });
                  if (customAlert.onConfirm) customAlert.onConfirm();
                }}
                className="flex-1 py-3 rounded-[10px] font-medium text-white bg-[#8B0000] hover:bg-[#6b0000] transition-colors cursor-pointer"
                style={font}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 뷰어 */}
      {isViewerOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]" onClick={() => setIsViewerOpen(false)}>
          <div className="max-w-[80vw] max-h-[80vh] relative" onClick={e => e.stopPropagation()}>
            <img
              src={getPhotoSrc(currentViewIndex)}
              alt=""
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setIsViewerOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-1.5 rounded-full text-white text-sm backdrop-blur-sm">
              {currentViewIndex + 1} / {totalItems}
            </div>
            {currentViewIndex > 0 && (
              <button
                onClick={() => setCurrentViewIndex(currentViewIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-xl hover:bg-black/70 cursor-pointer"
              >
                ‹
              </button>
            )}
            {currentViewIndex < totalItems - 1 && (
              <button
                onClick={() => setCurrentViewIndex(currentViewIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-xl hover:bg-black/70 cursor-pointer"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
