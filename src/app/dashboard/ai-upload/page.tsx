"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { CheckCircle, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/components/Toast';
import { CustomButton } from '@/components/CustomButton';
import apiClient from '@/api/index';
import { runAgent, reviewPost } from '@/api/agent';
import type { Photo } from '@/types';

const PHOTO_GRID = [
  '/demo/pass_01.jpg',
  '/demo/pass_02.jpg',
  '/demo/pass_03.jpg',
  '/demo/pass_04.jpg',
  'https://picsum.photos/seed/barber1/300/300',
  'https://picsum.photos/seed/barber2/300/300',
  'https://picsum.photos/seed/barber3/300/300',
  'https://picsum.photos/seed/barber4/300/300',
  'https://picsum.photos/seed/barber5/300/300',
  'https://picsum.photos/seed/barber6/300/300',
  'https://picsum.photos/seed/barber7/300/300',
  'https://picsum.photos/seed/barber8/300/300',
];

const STYLE_KEYS = ['trendy', 'classic', 'premium', 'street'] as const;
const PURPOSE_KEYS = ['promo', 'event', 'review', 'newCustomer'] as const;
const LOADING_KEYS = ['loading1', 'loading2', 'loading3'] as const;

const font = { fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" };

export default function AIUploadPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);

  // Step 2
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [extraRequest, setExtraRequest] = useState('');

  // Step 3
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const loadingInterval = useRef<NodeJS.Timeout | null>(null);

  // API state
  const [shopId, setShopId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [generatedPhotoUrl, setGeneratedPhotoUrl] = useState('');
  const [generatedCta, setGeneratedCta] = useState('');
  const [postId, setPostId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const id = localStorage.getItem('shop_id');
    setShopId(id);
  }, []);

  useEffect(() => {
    if (!shopId) return;
    const fetchPhotos = async () => {
      try {
        const res = await apiClient.get(`/photos/all/${shopId}`);
        setPhotos(res.data.photos || []);
      } catch { }
    };
    fetchPhotos();
  }, [shopId]);

  // Step 3 auto-advance with API call
  useEffect(() => {
    if (step !== 3) return;
    setLoadingTextIdx(0);
    setApiError(null);
    let count = 0;
    loadingInterval.current = setInterval(() => {
      count++;
      setLoadingTextIdx(count % LOADING_KEYS.length);
    }, 1500);

    const generate = async () => {
      const grid = photos.length > 0 ? photos.map(p => p.blob_url) : PHOTO_GRID;
      const photoIds = selectedPhotos.map(i => {
        if (photos.length > 0 && photos[i]) return photos[i].id;
        return `mock_${i}`;
      });

      // [FIX] 실패 시 목업(MOCK_CAPTION)으로 조용히 바꿔치기하던 로직 제거.
      // 데모 중 실제 생성이 실패하거나 타임아웃돼도 지현님이 알아채지 못한 채
      // "20년 경력 용산미군부대..." 같은 가짜 게시물이 그대로 노출되는 문제가 있었음.
      // 이제는 실패 시 명확한 에러를 보여주고 Step 2(사진/스타일 선택 유지)로 돌려보내 재시도 가능하게 함.
      try {
        const [result] = await Promise.all([
          runAgent({ shop_id: shopId || '', trigger: 'manual', photo_ids: photoIds, message: extraRequest }),
          new Promise(resolve => setTimeout(resolve, 3000)),
        ]);

        if (!result || !result.caption) {
          throw new Error('AI 응답에 캡션이 없습니다 (응답 형식 불일치 가능성)');
        }

        setGeneratedCaption(result.caption);
        setGeneratedHashtags(result.hashtags || []);
        setGeneratedPhotoUrl(result.photo_urls?.[0] || grid[selectedPhotos[0]] || '/demo/pass_01.jpg');
        setGeneratedCta(result.cta || '');
        setPostId(result.post_id || null);
        if (loadingInterval.current) clearInterval(loadingInterval.current);
        setStep(4);
      } catch (err: any) {
        console.error('[ai-upload] 캡션 생성 실패:', err);
        if (loadingInterval.current) clearInterval(loadingInterval.current);

        const isTimeout = err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '');
        setApiError(
          isTimeout
            ? 'AI 생성이 너무 오래 걸려서 중단됐어요. 다시 시도해주세요.'
            : 'AI 캡션 생성에 실패했어요. 잠시 후 다시 시도해주세요.'
        );
        setStep(2);
      }
    };
    generate();

    return () => {
      if (loadingInterval.current) clearInterval(loadingInterval.current);
    };
  }, [step]);

  const togglePhoto = (idx: number) => {
    setSelectedPhotos(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const resetAll = () => {
    setStep(1);
    setSelectedPhotos([]);
    setSelectedStyle(null);
    setSelectedPurpose(null);
    setExtraRequest('');
    setGeneratedCaption('');
    setGeneratedHashtags([]);
    setGeneratedPhotoUrl('');
    setGeneratedCta('');
    setPostId(null);
    setApiError(null);
  };

  if (!isMounted) return null;

  const photoGrid = photos.length > 0
    ? photos.map(p => p.blob_url)
    : PHOTO_GRID;

  const progressPercent = (step / 5) * 100;

  const STYLE_OPTIONS = [t.ai_upload.styles.trendy, t.ai_upload.styles.classic, t.ai_upload.styles.premium, t.ai_upload.styles.street];
  const PURPOSE_OPTIONS = [t.ai_upload.purposes.promo, t.ai_upload.purposes.event, t.ai_upload.purposes.review, t.ai_upload.purposes.newCustomer];
  const LOADING_TEXTS = [t.ai_upload.loading1, t.ai_upload.loading2, t.ai_upload.loading3];

  return (
    <div className="flex flex-row h-screen w-full bg-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* 진행률 바 */}
        <div className="shrink-0 px-10 pt-8 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[0.8rem] text-[#8B0000] font-medium" style={font}>{step}/5</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8B0000] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex-1 px-10 pb-10">
          {/* Step 1: 사진 선택 */}
          {step === 1 && (
            <div>
              <h2 className="text-[1.4rem] text-[#1A1A1A] mb-6" style={{ ...font, fontWeight: 700 }}>
                {t.ai_upload.selectPhotos}
              </h2>
              <div className="grid grid-cols-4 gap-4 mb-8">
                {photoGrid.map((src, i) => {
                  const isSelected = selectedPhotos.includes(i);
                  return (
                    <div
                      key={i}
                      className={`relative aspect-square rounded-[12px] overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-[#8B0000] ring-2 ring-[#8B0000]/20' : 'border-transparent hover:border-gray-200'}`}
                      onClick={() => togglePhoto(i)}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#8B0000] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[0.9rem] text-[#5a2a2a]" style={font}>
                  {selectedPhotos.length}{t.ai_upload.selectedCount}
                </span>
                <button
                  onClick={() => selectedPhotos.length > 0 && setStep(2)}
                  disabled={selectedPhotos.length === 0}
                  className={`px-8 py-3 rounded-[10px] text-[0.95rem] font-medium transition-all cursor-pointer ${selectedPhotos.length > 0 ? 'bg-[#8B0000] text-white hover:bg-[#6b0000]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  style={font}
                >
                  {t.ai_upload.next}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 스타일 / 목적 선택 */}
          {step === 2 && (
            <div>
              <h2 className="text-[1.4rem] text-[#1A1A1A] mb-6" style={{ ...font, fontWeight: 700 }}>
                {t.ai_upload.styleAndPurpose}
              </h2>

              {/* [NEW] 생성 실패 시 에러 배너 — 이전엔 목업으로 조용히 넘어갔음 */}
              {apiError && (
                <div className="mb-6 px-4 py-3 rounded-[10px] bg-red-50 border border-red-200 text-red-700 text-[0.85rem]" style={font}>
                  {apiError}
                </div>
              )}

              <p className="text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>{t.ai_upload.styleLabel}</p>
              <div className="grid grid-cols-4 gap-3 mb-8">
                {STYLE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStyle(s)}
                    className={`py-4 rounded-[12px] border-2 text-[0.95rem] font-medium transition-all cursor-pointer ${selectedStyle === s ? 'border-[#8B0000] bg-[#8B0000]/10 text-[#8B0000]' : 'border-gray-200 text-[#1A1A1A] hover:border-gray-300'}`}
                    style={font}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <p className="text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>{t.ai_upload.purposeLabel}</p>
              <div className="grid grid-cols-4 gap-3 mb-8">
                {PURPOSE_OPTIONS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPurpose(p)}
                    className={`py-4 rounded-[12px] border-2 text-[0.95rem] font-medium transition-all cursor-pointer ${selectedPurpose === p ? 'border-[#8B0000] bg-[#8B0000]/10 text-[#8B0000]' : 'border-gray-200 text-[#1A1A1A] hover:border-gray-300'}`}
                    style={font}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <p className="text-[0.85rem] text-[#5a2a2a] mb-2" style={{ ...font, fontWeight: 500 }}>{t.ai_upload.additionalReq}</p>
              <textarea
                value={extraRequest}
                onChange={(e) => setExtraRequest(e.target.value)}
                placeholder={t.ai_upload.additionalPlaceholder}
                className="w-full h-24 border border-gray-200 rounded-[12px] px-4 py-3 text-[0.9rem] text-[#1A1A1A] resize-none focus:outline-none focus:border-[#8B0000] transition-colors"
                style={font}
              />

              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-3 rounded-[10px] border border-gray-200 text-[0.95rem] text-[#5a2a2a] font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  style={font}
                >
                  {t.ai_upload.prev}
                </button>
                <button
                  onClick={() => selectedStyle && selectedPurpose && setStep(3)}
                  disabled={!selectedStyle || !selectedPurpose}
                  className={`px-8 py-3 rounded-[10px] text-[0.95rem] font-medium transition-all cursor-pointer ${selectedStyle && selectedPurpose ? 'bg-[#8B0000] text-white hover:bg-[#6b0000]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  style={font}
                >
                  {t.ai_upload.generateBtn}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: AI 생성 로딩 */}
          {step === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[500px]">
              <div className="w-12 h-12 border-3 border-[#8B0000] border-t-transparent rounded-full animate-spin mb-6" />
              <p className="text-[1.1rem] text-[#1A1A1A]" style={{ ...font, fontWeight: 400 }}>
                {LOADING_TEXTS[loadingTextIdx] || LOADING_TEXTS[0]}
              </p>
            </div>
          )}

          {/* Step 4: 결과 미리보기 */}
          {step === 4 && (
            <div className="flex flex-col items-center">
              <h2 className="text-[1.4rem] text-[#1A1A1A] mb-8 self-start" style={{ ...font, fontWeight: 700 }}>
                {t.ai_upload.preview}
              </h2>

              {/* 인스타그램 카드 */}
              <div className="w-[320px] rounded-lg border border-gray-200 overflow-hidden shadow-md bg-white mb-8" style={font}>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-[32px] h-[32px] rounded-full bg-gray-300 shrink-0" />
                    <span className="text-sm font-bold text-gray-900">barber_studio</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="5" cy="12" r="1.5" fill="#262626" />
                    <circle cx="12" cy="12" r="1.5" fill="#262626" />
                    <circle cx="19" cy="12" r="1.5" fill="#262626" />
                  </svg>
                </div>
                <div className="aspect-square w-full bg-gray-200">
                  <img
                    src={generatedPhotoUrl || (selectedPhotos.length > 0 ? photoGrid[selectedPhotos[0]] : '/demo/pass_01.jpg')}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-4">
                    <Heart size={20} className="text-gray-800" />
                    <MessageCircle size={20} className="text-gray-800" />
                    <Send size={20} className="text-gray-800" />
                  </div>
                  <Bookmark size={20} className="text-gray-800" />
                </div>
                <div className="px-3 pb-3">
                  <p className="text-xs text-gray-800 leading-relaxed">
                    <span className="font-bold">barber_studio</span>{' '}
                    {generatedCaption || '(캡션 없음)'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {generatedHashtags.map((tag, i) => (
                      <span key={i} className="text-[11px] text-[#8B0000] font-medium">{tag}</span>
                    ))}
                  </div>
                  {generatedCta && (
                    <p className="text-[11px] text-gray-600 mt-2 font-medium">{generatedCta}</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-2">3시간 전</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setStep(3)}
                  className="px-8 py-3 rounded-[10px] border border-[#8B0000] text-[#8B0000] text-[0.95rem] font-medium hover:bg-[#fdf0f0] transition-colors cursor-pointer"
                  style={font}
                >
                  {t.ai_upload.regenerate}
                </button>
                <CustomButton
                  title={t.ai_upload.uploadBtn}
                  loadingText={t.toast.publishing}
                  onClick={async () => {
                    if (!postId || !shopId) return;
                    // 발행 실패 시 성공 화면(step 5)으로 넘어가지 않고 에러 토스트만 — 조용한 성공 위장 방지.
                    try {
                      await reviewPost({ shop_id: shopId, post_id: postId, action: 'ok' });
                      toast.success(t.toast.published);
                      setStep(5);
                    } catch {
                      toast.error(t.toast.publish_failed);
                    }
                  }}
                  className="px-8 !rounded-[10px]"
                  style={font}
                />
              </div>
            </div>
          )}

          {/* Step 5: 업로드 완료 */}
          {step === 5 && (
            <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[500px]">
              <CheckCircle size={80} className="text-[#8B0000] mb-6" strokeWidth={1.5} />
              <p className="text-[1.4rem] text-[#1A1A1A] mb-10" style={{ ...font, fontWeight: 500 }}>
                {t.ai_upload.successMsg}
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/dashboard/posts')}
                  className="px-8 py-3 rounded-[10px] border border-[#8B0000] text-[#8B0000] text-[0.95rem] font-medium hover:bg-[#fdf0f0] transition-colors cursor-pointer"
                  style={font}
                >
                  {t.ai_upload.viewPosts}
                </button>
                <button
                  onClick={resetAll}
                  className="px-8 py-3 rounded-[10px] bg-[#8B0000] text-white text-[0.95rem] font-medium hover:bg-[#6b0000] transition-colors cursor-pointer"
                  style={font}
                >
                  {t.ai_upload.newPost}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
