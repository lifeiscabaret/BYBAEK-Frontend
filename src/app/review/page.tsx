"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import apiClient from '@/api/index';
import { useTranslation } from '@/hooks/useTranslation';
import type { Photo, Album } from '@/types';

function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const shopId = searchParams.get('shop_id');
  const postId = searchParams.get('post_id') || '';
  // 메일 알림 링크에 실려오는 검토 전용 토큰. 세션 토큰(sessionStorage)은 탭 단위라
  // 메일 앱에서 새로 열린 탭엔 없다 — 그 경우 이 토큰으로만 초안에 접근한다.
  const reviewToken = searchParams.get('t') || '';

  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);

  // 검토 토큰은 해당 post_id 하나에만 통하므로, 사진/앨범 목록 API는 401이 난다.
  // 그럴 땐 사진 교체 UI를 감춘다 (앱에 로그인하면 그대로 쓸 수 있다).
  const [canEditPhotos, setCanEditPhotos] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  // 화면에 처음 채워진 캡션. 제출 시 사장님이 실제로 고쳤는지(ok vs edit) 판별하는 기준.
  // (AI 원본 보존은 백엔드가 ai_caption 필드로 처리한다 — 여기서 볼 필요 없다.)
  const [loadedCaption, setLoadedCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [cta, setCta] = useState('');

  const [isClosedFallback, setIsClosedFallback] = useState(false);

  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

  const [images, setImages] = useState<Photo[]>([]);
  const [tempSelectedPhotos, setTempSelectedPhotos] = useState<Photo[]>([]);
  // 초안에 원래 담겨 있던 사진 순서. 제출 시 사진을 바꿨는지 비교하는 기준.
  const [originalPhotoIds, setOriginalPhotoIds] = useState<string[]>([]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);

  const [modalStep, setModalStep] = useState<'ALBUM_LIST' | 'PHOTO_LIST'>('ALBUM_LIST');
  const [currentAlbumPhotos, setCurrentAlbumPhotos] = useState<Photo[]>([]);
  const [currentAlbumTitle, setCurrentAlbumTitle] = useState('');

  const [generatedCaption, setGeneratedCaption] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [textRatio, setTextRatio] = useState(50);
  const [hasManuallyResized, setHasManuallyResized] = useState(false);

  useEffect(() => {
    if (hasManuallyResized) return;
    const el = textareaRef.current;
    if (!el) return;
    if (el.scrollHeight > el.clientHeight) {
      setTextRatio(66.6);
    }
  }, [generatedCaption, hasManuallyResized]);

  const handleTextWheel = (e: React.WheelEvent<HTMLTextAreaElement>) => {
    if (!hasManuallyResized) setHasManuallyResized(true);
    const el = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const isAtTop = scrollTop === 0;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) <= 1;
    if (e.deltaY < 0 && isAtTop) {
      setTextRatio(prev => Math.max(33.3, prev - 4));
    }
    else if (e.deltaY > 0 && isAtBottom) {
      setTextRatio(prev => Math.min(66.6, prev + 4));
    }
  };

  // 검토 토큰이 있으면 헤더로 실어 보낸다. apiClient 인터셉터가 붙이는
  // Authorization(sessionStorage)과 공존하며, 백엔드는 Authorization을 우선한다.
  const reviewHeaders = React.useMemo(
    () => (reviewToken ? { 'X-Review-Token': reviewToken } : undefined),
    [reviewToken]
  );

  useEffect(() => {
    if (!shopId) {
      setLoadFailed(true);
      setIsPageLoading(false);
      setAlertMessage(t.review.load_error);
      return;
    }

    const fetchInitialData = async () => {
      setIsPageLoading(true);

      // 1) 초안 본문. 이 페이지의 존재 이유 — 예전엔 post_id를 읽고도 쓰질 않아서
      //    캡션이 늘 빈 문자열로 시작했다. 실패하면 검토 자체가 불가능하므로 중단한다.
      if (postId) {
        try {
          const res = await apiClient.get(`/agent/post/detail/${postId}`, {
            params: { shop_id: shopId },
            headers: reviewHeaders,
          });
          const post = res.data || {};
          const caption: string = post.caption || '';
          const photos: Photo[] = (post.photo_details || [])
            .filter((p: { blob_url?: string }) => p?.blob_url)
            .map((p: { id: string; blob_url: string; original_name?: string }, i: number) => ({
              id: p.id,
              blob_url: p.blob_url,
              original_name: p.original_name || `photo_${i + 1}`,
            }));

          setGeneratedCaption(caption);
          setLoadedCaption(caption);
          setHashtags(post.hashtags || []);
          setCta(post.cta || '');
          setImages(photos);
          setOriginalPhotoIds(photos.map((p) => p.id));
        } catch (error) {
          const status = (error as { response?: { status?: number } })?.response?.status;
          console.error('초안 로딩 실패:', error);
          setLoadFailed(true);
          setAlertMessage(status === 401 ? t.review.link_expired : t.review.load_error);
          setIsPageLoading(false);
          return;
        }
      }

      // 2) 사진/앨범 목록은 '사진 교체' 부가 기능용이다. 이 두 API는 세션 토큰만 받으므로
      //    메일 링크(검토 토큰)로 들어온 경우 401이 난다. 페이지는 살리고 교체 UI만 감춘다.
      try {
        const [allRes, albumRes] = await Promise.all([
          apiClient.get(`/photos/all/${shopId}`),
          apiClient.get(`/album/${shopId}`),
        ]);
        setAllPhotos(allRes.data.photos || []);
        setAlbums(albumRes.data.albums || albumRes.data || []);
      } catch (error) {
        console.warn('사진/앨범 목록 로딩 실패 → 사진 교체 비활성화', error);
        setCanEditPhotos(false);
      }

      setIsPageLoading(false);
    };

    fetchInitialData();
  }, [shopId, postId, reviewHeaders]);

  const openPhotoModal = () => {
    setTempSelectedPhotos(images);
    setModalStep('ALBUM_LIST');
    setIsEditModalVisible(true);
  };
  const closePhotoModal = () => setIsEditModalVisible(false);

  const openOrderModal = () => {
    setTempSelectedPhotos(images);
    setIsOrderModalVisible(true);
  };
  const closeOrderModal = () => setIsOrderModalVisible(false);

  const toggleTempSelect = (photo: Photo) => {
    setTempSelectedPhotos((prev) =>
      prev.some((p) => p.id === photo.id) ? prev.filter((p) => p.id !== photo.id) : [...prev, photo]
    );
  };

  const handleSavePhotos = () => {
    setImages(tempSelectedPhotos);
    setCurrentImageIndex(0);
    setIsEditModalVisible(false);
  };

  const handleSavePhotoOrder = () => {
    setImages(tempSelectedPhotos);
    setIsOrderModalVisible(false);
  };

  const movePhotoUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...tempSelectedPhotos];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setTempSelectedPhotos(newOrder);
  };

  const movePhotoDown = (index: number) => {
    if (index === tempSelectedPhotos.length - 1) return;
    const newOrder = [...tempSelectedPhotos];
    [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    setTempSelectedPhotos(newOrder);
  };

  const handlePrevImage = () => setCurrentImageIndex((prev) => Math.max(0, prev - 1));
  const handleNextImage = () => setCurrentImageIndex((prev) => Math.min(images.length - 1, prev + 1));

  const handleRemoveCurrentImage = () => {
    if (images.length === 0) return;
    const updatedImages = [...images];
    updatedImages.splice(currentImageIndex, 1);
    setImages(updatedImages);
    if (currentImageIndex >= updatedImages.length && updatedImages.length > 0) {
      setCurrentImageIndex(updatedImages.length - 1);
    } else if (updatedImages.length === 0) {
      setCurrentImageIndex(0);
    }
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      setAlertMessage(t.preview.alert_no_photo);
      return;
    }
    if (!generatedCaption.trim()) {
      setAlertMessage(t.preview.alert_no_caption);
      return;
    }

    setIsLoading(true);
    setIsUploadSuccess(false);

    try {
      const photoIds = images.map((img) => img.id);
      let targetPostId = postId;
      let action: 'ok' | 'edit' = 'ok';
      const edits: Record<string, unknown> = {};

      if (targetPostId) {
        // 검토 대상 초안이 이미 있다. 예전엔 여기서도 /agent/save로 새 post_id를 발급해
        // 매번 별개의 게시물을 만들어버렸고, 그래서 edit 경로를 한 번도 타지 않았다.
        // 원래 초안을 그대로 승인하거나 수정한다.
        if (generatedCaption.trim() !== loadedCaption.trim()) {
          action = 'edit';
          edits.edited_caption = generatedCaption;
        }
        const photosChanged =
          photoIds.length !== originalPhotoIds.length ||
          photoIds.some((id, i) => id !== originalPhotoIds[i]);
        if (photosChanged) {
          edits.edited_photo_ids = photoIds;
        }
      } else {
        // post_id 없이 진입한 경우(직접 작성 흐름)에만 새 초안을 만든다.
        const saveRes = await apiClient.post('/agent/save', {
          shop_id: shopId,
          caption: generatedCaption,
          hashtags: [],
          photo_ids: photoIds,
          cta: "",
        });
        targetPostId = saveRes.data.post_id;
      }

      const reviewRes = await apiClient.post(
        '/agent/review',
        { shop_id: shopId, post_id: targetPostId, action, ...edits },
        { headers: reviewHeaders }
      );

      if (reviewRes.data.status === 'uploaded') {
        setAlertMessage(t.review.upload_success);
        setIsUploadSuccess(true);
      }
    } catch (error) {
      console.error('업로드 실패:', error);
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setAlertMessage(detail || t.review.upload_error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertConfirm = () => {
    setAlertMessage(null);
    if (isUploadSuccess) {
      window.close();
      setTimeout(() => {
        setIsClosedFallback(true);
      }, 100);
    }
  };

  if (isClosedFallback) {
    return (
      <div className="w-full max-w-md mx-auto h-screen bg-[#FAFAFA] flex flex-col items-center justify-center shadow-2xl p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-green-500 text-4xl font-bold">✓</span>
        </div>
        <h2 className="text-[22px] font-bold text-text-primary mb-3">{t.review.upload_complete_title}</h2>
        <p className="text-[15px] text-text-secondary leading-relaxed mb-8 whitespace-pre-wrap">
          {t.review.upload_complete_desc}
        </p>
        <p className="text-[13px] text-gray-400 bg-gray-100 px-4 py-2 rounded-full">
          {t.review.upload_complete_close}
        </p>
      </div>
    );
  }

  if (isPageLoading) {
    return (
      <div className="flex h-screen w-full max-w-md mx-auto items-center justify-center bg-[#FAFAFA] shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-text-secondary animate-pulse">{t.review.loading_data}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-[#FAFAFA] flex flex-col shadow-2xl relative">

      <div className="relative flex flex-row justify-center items-center p-4 bg-white border-b border-border shrink-0">
        <button
          onClick={() => router.push('/dashboard')}
          className="absolute left-4 flex items-center justify-center focus:outline-none hover:scale-110 transition-transform cursor-pointer"
          title="대시보드로 이동"
        >
          <div className="relative w-8 h-8">
            <Image
              src="/images/logo.png"
              alt="BYBAEK Logo"
              fill
              className="object-contain"
            />
          </div>
        </button>
        <h2 className="text-[18px] text-text-primary font-bold">
          {t.review.title}
        </h2>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-4">
        <div
          className="relative w-full bg-[#EAEAEA] rounded-lg mb-3 overflow-hidden flex items-center justify-center shrink-0 group/viewer transition-all duration-300 ease-out min-h-0"
          style={{ flex: 100 - textRatio }}
        >
          {images.length > 0 && currentImageIndex > 0 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-2 z-10 flex items-center justify-center text-white text-4xl drop-shadow-md cursor-pointer hover:scale-110 transition-transform focus:outline-none"
            >
              {'<'}
            </button>
          )}

          <div className="w-full h-full relative">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex].blob_url}
                  alt="preview"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={handleRemoveCurrentImage}
                  className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full border-2 border-text-primary bg-[#E0E0E0]/80 flex justify-center items-center hover:bg-gray-300 transition-colors shadow-sm focus:outline-none cursor-pointer"
                >
                  <svg className="w-6 h-6 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary">
                {t.preview.no_photo}
              </div>
            )}
          </div>

          {images.length > 0 && currentImageIndex < images.length - 1 ? (
            <button
              onClick={handleNextImage}
              className="absolute right-2 z-10 flex items-center justify-center text-white text-4xl drop-shadow-md cursor-pointer hover:scale-110 transition-transform focus:outline-none"
            >
              {'>'}
            </button>
          ) : canEditPhotos ? (
            /* 사진 추가는 앨범/전체사진 목록이 있어야 한다. 메일 링크(검토 토큰)로
               들어오면 그 목록 API가 401이므로 버튼을 감춘다. */
            <button
              onClick={openPhotoModal}
              className="absolute right-3 z-10 w-12 h-12 rounded-full border-2 border-text-primary bg-[#E0E0E0]/80 flex items-center justify-center hover:bg-gray-300 transition-colors shadow-sm cursor-pointer focus:outline-none hover:scale-105"
            >
              <svg className="w-7 h-7 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          ) : null}
        </div>

        <button
          onClick={openOrderModal}
          className="w-full py-3 mb-3 border border-border rounded-lg bg-white text-[14px] font-bold text-text-secondary hover:bg-gray-50 transition-colors shrink-0 cursor-pointer shadow-sm"
        >
          {t.preview.btn_reorder_photo}
        </button>

        <div
          className="bg-white border border-border rounded-lg p-4 flex flex-col shadow-sm mb-2 transition-all duration-300 ease-out min-h-0"
          style={{ flex: textRatio }}
        >
          <textarea
            ref={textareaRef}
            onWheel={handleTextWheel}
            className="flex-1 w-full h-full resize-none text-body bg-transparent focus:outline-none scrollbar-hide leading-relaxed"
            value={generatedCaption}
            onChange={(e) => setGeneratedCaption(e.target.value)}
            placeholder={t.review.placeholder_caption}
          />

          {/* 해시태그/CTA는 발행 시 백엔드가 캡션 뒤에 붙인다. 여기서 같이 편집하게 두면
              edited_caption에 섞여 들어가 중복 발행되므로, 보여주기만 한다. */}
          {(hashtags.length > 0 || cta) && (
            <div className="mt-3 pt-3 border-t border-border shrink-0 overflow-y-auto max-h-[35%] scrollbar-hide">
              <p className="text-[11px] font-bold text-text-secondary mb-1">
                {t.review.tags_readonly}
              </p>
              {hashtags.length > 0 && (
                <p className="text-[13px] text-accent leading-relaxed break-words">
                  {hashtags.join(' ')}
                </p>
              )}
              {cta && (
                <p className="text-[13px] text-text-secondary leading-relaxed break-words mt-1">
                  {cta}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-white border-t border-border shrink-0 pb-safe">
        <button
          onClick={handleUpload}
          // 초안을 못 불러온 상태에서 누르면 빈 캡션으로 발행될 수 있다.
          disabled={isLoading || loadFailed}
          className="w-full py-4 bg-accent rounded-lg text-white font-bold text-[16px] hover:bg-accent-dark transition-all transform active:scale-[0.98] shadow-md cursor-pointer flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            t.review.btn_upload
          )}
        </button>
      </div>

      {isEditModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999] p-4">
          <div className="w-full max-w-[400px] h-[75vh] bg-background rounded-xl shadow-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                {modalStep === 'PHOTO_LIST' && (
                  <button onClick={() => setModalStep('ALBUM_LIST')} className="text-text-secondary font-bold text-xl pb-1 px-2 cursor-pointer">
                    {'<'}
                  </button>
                )}
                <h2 className="text-[16px] font-bold text-text-primary">
                  {modalStep === 'ALBUM_LIST' ? t.preview.modal_album_select : currentAlbumTitle}
                </h2>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSavePhotos} className="px-4 py-1.5 bg-accent text-white rounded-md font-bold text-[13px] cursor-pointer">{t.common.save}</button>
                <button onClick={closePhotoModal} className="text-[18px] text-text-secondary px-2 cursor-pointer">✕</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
              {modalStep === 'ALBUM_LIST' ? (
                <div className="grid grid-cols-3 gap-3 content-start">
                  <button onClick={() => { setCurrentAlbumPhotos(allPhotos); setCurrentAlbumTitle(t.preview.all_photos); setModalStep('PHOTO_LIST'); }} className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="w-full aspect-square bg-[#EAEAEA] rounded-xl border border-border flex items-center justify-center overflow-hidden">
                      {allPhotos.length > 0 ? <img src={allPhotos[0].blob_url} className="w-full h-full object-cover" alt={t.preview.all_photos} /> : <span className="text-3xl">📁</span>}
                    </div>
                    <span className="font-bold text-[13px] mt-1">{t.preview.all_photos}</span>
                  </button>
                  {albums.map((album) => (
                    <button key={album.id} onClick={() => {
                      setCurrentAlbumPhotos(allPhotos.slice(1, 3));
                      setCurrentAlbumTitle(album.album_name);
                      setModalStep('PHOTO_LIST');
                    }} className="flex flex-col items-center gap-1 group cursor-pointer">
                      <div className="w-full aspect-square bg-[#EAEAEA] rounded-xl border border-border flex items-center justify-center"><span className="text-3xl">📁</span></div>
                      <span className="font-bold text-[13px] mt-1 truncate w-full text-center">{album.album_name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 content-start">
                  {currentAlbumPhotos.map((photo) => {
                    const isSelected = tempSelectedPhotos.some((p) => p.id === photo.id);
                    return (
                      <button key={photo.id} onClick={() => toggleTempSelect(photo)} className={`relative aspect-square rounded-lg border overflow-hidden cursor-pointer ${isSelected ? 'border-accent border-[3px]' : 'border-border'}`}>
                        <div className={`absolute top-1 left-1 w-[20px] h-[20px] rounded border flex justify-center items-center ${isSelected ? 'bg-accent border-accent' : 'bg-white/80 border-gray-300'}`}>
                          {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                        <img src={photo.blob_url} className="w-full h-full object-cover" alt="img" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isOrderModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999] p-4">
          <div className="w-full max-w-[400px] max-h-[75vh] bg-background rounded-xl shadow-2xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-[16px] font-bold text-text-primary">{t.preview.modal_photo_reorder}</h2>
              <div className="flex gap-2">
                <button onClick={handleSavePhotoOrder} className="px-4 py-1.5 bg-accent text-white rounded-md font-bold text-[13px] cursor-pointer">{t.common.save}</button>
                <button onClick={closeOrderModal} className="text-[18px] text-text-secondary px-2 cursor-pointer">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-hide">
              {tempSelectedPhotos.map((photo, index) => (
                <div key={photo.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-border shadow-sm">
                  <span className="font-bold text-accent w-4 text-center">{index + 1}</span>
                  <img src={photo.blob_url} className="w-12 h-12 object-cover rounded-md" alt="img" />
                  <div className="flex-1 text-[13px] font-medium truncate">{photo.original_name}</div>
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => movePhotoUp(index)} disabled={index === 0} className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-30 cursor-pointer">▲</button>
                    <button onClick={() => movePhotoDown(index)} disabled={index === tempSelectedPhotos.length - 1} className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-xs disabled:opacity-30 cursor-pointer">▼</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {alertMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[10001] backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl shadow-2xl p-6 w-full max-w-[320px] flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 shrink-0 ${isUploadSuccess ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
              <span className="text-xl font-bold">{isUploadSuccess ? '✓' : '!'}</span>
            </div>
            <p className="text-[14px] text-text-primary text-center mb-6 font-bold whitespace-pre-wrap leading-relaxed">
              {alertMessage}
            </p>
            <button
              onClick={handleAlertConfirm}
              className="w-full py-3 bg-accent text-white rounded-lg font-bold text-[15px] cursor-pointer hover:bg-accent-dark transition-colors"
            >
              {t.common.confirm}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#FAFAFA]" />}>
      <ReviewContent />
    </Suspense>
  );
}
