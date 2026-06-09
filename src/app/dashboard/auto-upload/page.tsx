"use client";

import { useState, useEffect, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { CheckCircle, X, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import apiClient from '@/api/index';

const BACKEND_URL = 'https://bybaek-b-bzhhgzh8d2gthpb3.koreacentral-01.azurewebsites.net';

const font = { fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" };

const STYLE_OPTIONS = [
  {
    label: '힙/스트릿 바이브',
    caption: '그 바이브 그대로. fade는 여기서 ✂️🔥',
    hashtagDesc: '영문 위주, 짧고 임팩트',
    hashtags: '#fadecut #barber #streetstyle #freshcut #vibes',
  },
  {
    label: '클래식 프리미엄',
    caption: '20년 경력의 기술로 완성하는 클래식 페이드컷',
    hashtagDesc: '한영 혼용, 전문적',
    hashtags: '#페이드컷 #클래식바버 #premium #barbershop #남성헤어',
  },
  {
    label: '친근한 동네 바버',
    caption: '오늘도 멋진 스타일 완성! 예약은 DM으로 😊',
    hashtagDesc: '한글 위주, 지역명 포함',
    hashtags: '#동네바버샵 #삼각지 #남성커트 #예약가능 #바버샵추천',
  },
  {
    label: '감성/무드',
    caption: '머리카락 한 올에도 정성을 담습니다 🤍',
    hashtagDesc: '감성적, 이모지 많음',
    hashtags: '#감성바버 #무드 #정성스타일 #바버라이프 ✨',
  },
];

const TARGET_OPTIONS = [
  { label: '10~20대', desc: '트렌드에 민감한 젊은 고객' },
  { label: '30~40대', desc: '직장인, 클래식 선호' },
  { label: '외국인 고객', desc: '영어 소통 가능' },
  { label: '전 연령대', desc: '' },
];

const PRESET_SERVICES = ['페이드컷', '투블럭', '스킨헤드', '크루컷', '포마드', '사이드파트', '아이비리그', '텍스처컷', '퍼머', '염색'];

const CTA_SUGGESTIONS = [
  'DM으로 예약해주세요',
  '카카오톡으로 문의해주세요',
  '프로필 링크로 예약 가능해요',
];

// 요일 라벨 (0=월 ... 6=일)
const WEEKDAYS: Record<string, string[]> = {
  ko: ['월', '화', '수', '목', '금', '토', '일'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

export default function AutoUploadPage() {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [isInstaConnected, setIsInstaConnected] = useState(false);
  const [step, setStep] = useState(1);
  const [shopId, setShopId] = useState<string | null>(null);

  // Step 1
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServices, setCustomServices] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState('');

  // Step 2
  const [targetCustomers, setTargetCustomers] = useState<string[]>([]);
  const [targetCustomText, setTargetCustomText] = useState('');

  // Step 3
  const [referenceStyle, setReferenceStyle] = useState<string | null>(null);

  // Step 4
  const [forbiddenWords, setForbiddenWords] = useState<string[]>([]);
  const [forbiddenInput, setForbiddenInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [cta, setCta] = useState('');
  const [emojiUsage, setEmojiUsage] = useState<string | null>(null);

  // Step 5
  const [uploadTime, setUploadTime] = useState('19:00');
  const [uploadFrequency, setUploadFrequency] = useState<string | null>(null);
  const [uploadDays, setUploadDays] = useState<number[]>([]);
  const [photoRange, setPhotoRange] = useState(5);

  useEffect(() => {
    setIsMounted(true);
    const id = localStorage.getItem('shop_id');
    setShopId(id);
    const connected = localStorage.getItem('insta_connected') === 'true';
    setIsInstaConnected(connected);

    const onboardingDone = localStorage.getItem('onboarding_completed') === 'true';
    if (connected && onboardingDone) {
      setStep(6);
    }

    if (id) {
      const fetchExisting = async () => {
        try {
          const res = await apiClient.get(`/onboarding/${id}`);
          const shop = res.data?.shop_info || {};
          if (shop) {
            if (shop.shop_intro) {
              const intro = shop.shop_intro as string;
              const nameMatch = intro.match(/^샵명: (.+)\n/);
              if (nameMatch) {
                setShopName(nameMatch[1]);
                setShopDescription(intro.replace(/^샵명: .+\n/, ''));
              } else {
                setShopDescription(intro);
              }
            }
            if (shop.preferred_styles) setSelectedServices(shop.preferred_styles);
            if (shop.brand_tone && Array.isArray(shop.brand_tone)) {
              const styleLabels = STYLE_OPTIONS.map(s => s.label);
              const emojiOptions = ['자주 씀', '가끔 씀', '안 씀'];
              const foundStyle = shop.brand_tone.find((v: string) => styleLabels.includes(v));
              const foundEmoji = shop.brand_tone.find((v: string) => emojiOptions.includes(v));
              const foundTargets = shop.brand_tone.filter((v: string) =>
                !styleLabels.includes(v) && !emojiOptions.includes(v)
              );
              if (foundStyle) setReferenceStyle(foundStyle);
              if (foundEmoji) setEmojiUsage(foundEmoji);
              if (foundTargets.length > 0) setTargetCustomers(foundTargets);
            }
            if (shop.forbidden_words) setForbiddenWords(shop.forbidden_words);
            if (shop.hashtag_style) setHashtags(shop.hashtag_style);
            if (shop.cta) setCta(shop.cta);
            if (shop.insta_upload_time) setUploadTime(shop.insta_upload_time);
            if (shop.insta_upload_time_slot) {
              const slotMap: Record<string, string> = {
                '매일': t.auto_upload.daily,
                '주 3회': t.auto_upload.threePerWeek,
                '주 1회': t.auto_upload.weekly,
              };
              setUploadFrequency(slotMap[shop.insta_upload_time_slot] || shop.insta_upload_time_slot);
            }
            if (shop.insta_upload_days) setUploadDays(shop.insta_upload_days);
            if (shop.photo_range_max != null) setPhotoRange(Number(shop.photo_range_max));
          }
        } catch { }
      };
      fetchExisting();
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'INSTA_LOGIN_SUCCESS') {
        localStorage.setItem('insta_connected', 'true');
        setIsInstaConnected(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleInstaConnect = () => {
    const redirectUri = encodeURIComponent(`${BACKEND_URL}/api/auth/instagram`);
    const instaUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=3357678851057487&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;
    window.open(instaUrl, 'Insta_Login_Popup', 'width=500,height=600');
  };

  const handleServiceKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter' && serviceInput.trim()) {
      e.preventDefault();
      const tag = serviceInput.trim().replace(/,$/, '');
      if (tag && !customServices.includes(tag) && !PRESET_SERVICES.includes(tag)) {
        setCustomServices([...customServices, tag]);
      }
      setServiceInput('');
    }
  };

  const togglePresetService = (s: string) => {
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleHashtagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter' && hashtagInput.trim()) {
      e.preventDefault();
      const tag = hashtagInput.trim().startsWith('#') ? hashtagInput.trim() : `#${hashtagInput.trim()}`;
      if (!hashtags.includes(tag)) setHashtags([...hashtags, tag]);
      setHashtagInput('');
    }
  };

  const handleForbiddenKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter' && forbiddenInput.trim()) {
      e.preventDefault();
      const tag = forbiddenInput.trim();
      if (!forbiddenWords.includes(tag)) setForbiddenWords([...forbiddenWords, tag]);
      setForbiddenInput('');
    }
  };

  const toggleTarget = (label: string) => {
    setTargetCustomers(prev =>
      prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]
    );
  };

  const requiredDays = uploadFrequency === t.auto_upload.threePerWeek ? 3 : uploadFrequency === t.auto_upload.weekly ? 1 : 0;

  const toggleUploadDay = (day: number) => {
    setUploadDays(prev => {
      if (prev.includes(day)) return prev.filter(d => d !== day);
      if (requiredDays > 0 && prev.length >= requiredDays) return prev; // 정확히 N개 초과 선택 방지
      return [...prev, day].sort((a, b) => a - b);
    });
  };

  const handleComplete = async () => {
    const payload = {
      brand_tone: [referenceStyle, ...(targetCustomers.length > 0 ? targetCustomers : []), emojiUsage].filter(Boolean),
      forbidden_words: forbiddenWords,
      cta,
      hashtag_style: hashtags,
      insta_upload_time: uploadTime,
      insta_upload_time_slot: (
        uploadFrequency === 'Daily' ? '매일' :
          uploadFrequency === '3x / week' ? '주 3회' :
            uploadFrequency === 'Weekly' ? '주 1회' :
              uploadFrequency
      ),
      shop_intro: [
        shopName ? `샵명: ${shopName}` : '',
        shopDescription,
        targetCustomText ? `타겟: ${targetCustomText}` : '',
      ].filter(Boolean).join('\n').trim(),
      preferred_styles: [...selectedServices, ...customServices],
      insta_upload_days: uploadDays,
      photo_range_max: photoRange,
      language: localStorage.getItem('language') || 'ko',
      insta_auto_upload_yn: 'Y',
      insta_review_bfr_upload_yn: 'N',
    };
    try {
      if (shopId) {
        await apiClient.post(`/onboarding/${shopId}`, payload);
      }
    } catch {
      // fallback: just proceed
    }
    localStorage.setItem('onboarding_completed', 'true');
    setStep(6);
  };

  const allServices = [...selectedServices, ...customServices];

  const canNext = (): boolean => {
    switch (step) {
      case 1: return shopName.trim().length > 0;
      case 2: return targetCustomers.length > 0;
      case 3: return referenceStyle !== null;
      case 4: return cta.trim().length > 0 && emojiUsage !== null;
      case 5:
        if (uploadFrequency === null) return false;
        if (requiredDays > 0) return uploadDays.length === requiredDays;
        return true;
      default: return false;
    }
  };

  const selectedStyleData = STYLE_OPTIONS.find(s => s.label === referenceStyle);

  if (!isMounted) return null;

  return (
    <div className="flex flex-row h-screen w-full bg-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* 미연결 상태 */}
        {!isInstaConnected && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center max-w-[400px]">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="1.5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
                </svg>
              </div>
              <p className="text-[1.1rem] text-[#1A1A1A] text-center whitespace-pre-line leading-relaxed mb-8" style={{ ...font, fontWeight: 400 }}>
                {t.auto_upload.connectTitle}
              </p>
              <div className="space-y-3 w-full mb-8">
                <p className="text-[0.9rem] text-[#5a2a2a] flex items-center gap-2.5" style={{ ...font, fontWeight: 300 }}>
                  <span className="text-[#8B0000] font-bold">✓</span> {t.auto_upload.benefit1}
                </p>
                <p className="text-[0.9rem] text-[#5a2a2a] flex items-center gap-2.5" style={{ ...font, fontWeight: 300 }}>
                  <span className="text-[#8B0000] font-bold">✓</span> {t.auto_upload.benefit2}
                </p>
                <p className="text-[0.9rem] text-[#5a2a2a] flex items-center gap-2.5" style={{ ...font, fontWeight: 300 }}>
                  <span className="text-[#8B0000] font-bold">✓</span> {t.auto_upload.benefit3}
                </p>
              </div>
              <button
                onClick={handleInstaConnect}
                className="w-full py-4 rounded-[10px] text-white text-[1rem] font-medium hover:opacity-90 transition-opacity cursor-pointer"
                style={{ ...font, background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)' }}
              >
                {t.auto_upload.connectBtn}
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => { localStorage.setItem('insta_connected', 'true'); setIsInstaConnected(true); }}
                  className="mt-4 text-xs text-gray-400 underline cursor-pointer"
                >
                  DEV: 연결 건너뛰기
                </button>
              )}
            </div>
          </div>
        )}

        {/* 온보딩 Steps 1~5 */}
        {isInstaConnected && step <= 5 && (
          <div className="flex-1 px-10 pt-8 pb-10 flex flex-col">
            {/* 진행률 바 */}
            <div className="shrink-0 mb-2">
              <p className="text-[1.2rem] text-[#1A1A1A] mb-4" style={{ ...font, fontWeight: 700 }}>
                {t.auto_upload.onboardingTitle}
              </p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.8rem] text-[#8B0000] font-medium" style={font}>{step}/6 {t.auto_upload.step}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8B0000] rounded-full transition-all duration-500"
                  style={{ width: `${(step / 6) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex-1 mt-8 flex flex-col">
              {/* Step 1: 샵 정체성 */}
              {step === 1 && (
                <div className="max-w-[520px]">
                  <h2 className="text-[1.3rem] text-[#1A1A1A] mb-8" style={{ ...font, fontWeight: 700 }}>{t.auto_upload.shopName}</h2>
                  <label className="block text-[0.85rem] text-[#5a2a2a] mb-2" style={{ ...font, fontWeight: 500 }}>{t.auto_upload.shopName}</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    placeholder={t.auto_upload.shopNamePlaceholder}
                    className="w-full border border-gray-200 rounded-[12px] px-4 py-3.5 text-[0.9rem] text-[#1A1A1A] mb-6 focus:outline-none focus:border-[#8B0000] transition-colors"
                    style={font}
                  />
                  <label className="block text-[0.85rem] text-[#5a2a2a] mb-2" style={{ ...font, fontWeight: 500 }}>{t.auto_upload.shopDesc}</label>
                  <input
                    type="text"
                    value={shopDescription}
                    onChange={e => setShopDescription(e.target.value)}
                    placeholder={t.auto_upload.shopDescPlaceholder}
                    className="w-full border border-gray-200 rounded-[12px] px-4 py-3.5 text-[0.9rem] text-[#1A1A1A] mb-6 focus:outline-none focus:border-[#8B0000] transition-colors"
                    style={font}
                  />
                  <label className="block text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>{t.auto_upload.services}</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PRESET_SERVICES.map(s => {
                      const isSelected = selectedServices.includes(s);
                      return (
                        <button
                          key={s}
                          onClick={() => togglePresetService(s)}
                          className={`text-[0.8rem] font-medium px-3.5 py-2 rounded-full border transition-all cursor-pointer ${isSelected ? 'border-[#8B0000] bg-[rgba(139,0,0,0.08)] text-[#8B0000]' : 'border-gray-200 text-[#1A1A1A] hover:border-gray-300'}`}
                          style={font}
                        >
                          {s}
                        </button>
                      );
                    })}
                    {customServices.map(tag => (
                      <span key={tag} className="flex items-center gap-1.5 bg-[rgba(139,0,0,0.08)] text-[#8B0000] text-[0.8rem] font-medium px-3.5 py-2 rounded-full border border-[#8B0000]">
                        {tag}
                        <button onClick={() => setCustomServices(customServices.filter(s => s !== tag))} className="hover:opacity-70 cursor-pointer"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={serviceInput}
                      onChange={e => setServiceInput(e.target.value)}
                      onKeyDown={handleServiceKey}
                      placeholder={t.auto_upload.servicesPlaceholder}
                      className="flex-1 border border-gray-200 rounded-[12px] px-4 py-3 text-[0.9rem] text-[#1A1A1A] focus:outline-none focus:border-[#8B0000] transition-colors"
                      style={font}
                    />
                    <button
                      onClick={() => {
                        if (serviceInput.trim() && !customServices.includes(serviceInput.trim()) && !PRESET_SERVICES.includes(serviceInput.trim())) {
                          setCustomServices([...customServices, serviceInput.trim()]);
                          setServiceInput('');
                        }
                      }}
                      className="px-4 py-3 rounded-[12px] bg-[#8B0000] text-white text-[0.85rem] font-medium hover:bg-[#6b0000] transition-colors cursor-pointer shrink-0"
                      style={font}
                    >
                      {t.auto_upload.addBtn}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: 타겟 고객 */}
              {step === 2 && (
                <div className="max-w-[520px]">
                  <h2 className="text-[1.3rem] text-[#1A1A1A] mb-8" style={{ ...font, fontWeight: 700 }}>{t.auto_upload.targetTitle}</h2>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {TARGET_OPTIONS.map(opt => {
                      const isSelected = targetCustomers.includes(opt.label);
                      return (
                        <button
                          key={opt.label}
                          onClick={() => toggleTarget(opt.label)}
                          className={`flex flex-col items-start py-5 px-5 rounded-[14px] border-2 transition-all cursor-pointer text-left ${isSelected ? 'border-[#8B0000] bg-[rgba(139,0,0,0.08)]' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <span className="text-[0.95rem] font-medium text-[#1A1A1A]" style={font}>{opt.label}</span>
                          {opt.desc && <span className="text-[0.75rem] text-gray-500 mt-1" style={font}>{opt.desc}</span>}
                        </button>
                      );
                    })}
                  </div>
                  <label className="block text-[0.85rem] text-[#5a2a2a] mb-2" style={{ ...font, fontWeight: 500 }}>{t.auto_upload.targetCustomLabel}</label>
                  <input
                    type="text"
                    value={targetCustomText}
                    onChange={e => setTargetCustomText(e.target.value)}
                    placeholder={t.auto_upload.targetCustomPlaceholder}
                    className="w-full border border-gray-200 rounded-[12px] px-4 py-3.5 text-[0.9rem] text-[#1A1A1A] focus:outline-none focus:border-[#8B0000] transition-colors"
                    style={font}
                  />
                </div>
              )}

              {/* Step 3: 레퍼런스 스타일 */}
              {step === 3 && (
                <div className="max-w-[600px]">
                  <h2 className="text-[1.3rem] text-[#1A1A1A] mb-2" style={{ ...font, fontWeight: 700 }}>{t.auto_upload.styleTitle}</h2>
                  <p className="text-[0.85rem] text-gray-500 mb-8" style={font}>{t.auto_upload.styleSub}</p>
                  <div className="flex flex-col gap-3 mb-6">
                    {STYLE_OPTIONS.map(opt => {
                      const isSelected = referenceStyle === opt.label;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => setReferenceStyle(opt.label)}
                          className={`flex flex-col items-start py-5 px-6 rounded-[14px] border-2 transition-all cursor-pointer text-left ${isSelected ? 'border-[#8B0000] bg-[rgba(139,0,0,0.08)]' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <span className="text-[0.95rem] font-medium text-[#1A1A1A]" style={font}>{opt.label}</span>
                          <span className="text-[0.8rem] text-gray-600 mt-1" style={font}>"{opt.caption}"</span>
                          <span className="text-[0.75rem] text-gray-400 mt-0.5" style={font}>해시태그: {opt.hashtagDesc}</span>
                        </button>
                      );
                    })}
                  </div>
                  {referenceStyle && selectedStyleData && (
                    <div className="bg-[#fdf5f5] border border-[rgba(139,0,0,0.12)] rounded-[12px] p-5">
                      <p className="text-[0.8rem] text-[#8B0000] mb-2 font-medium" style={font}>{t.auto_upload.stylePreview}</p>
                      <p className="text-[0.9rem] text-[#1A1A1A] leading-relaxed" style={font}>"{selectedStyleData.caption}"</p>
                      <p className="text-[0.8rem] text-[#8B0000] mt-2" style={font}>{selectedStyleData.hashtags}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: 금칙어 + CTA */}
              {step === 4 && (
                <div className="max-w-[520px]">
                  <h2 className="text-[1.3rem] text-[#1A1A1A] mb-8" style={{ ...font, fontWeight: 700 }}>{t.auto_upload.forbiddenTitle}</h2>

                  <label className="block text-[0.85rem] text-[#5a2a2a] mb-2" style={{ ...font, fontWeight: 500 }}>{t.auto_upload.forbiddenLabel}</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {forbiddenWords.map(tag => (
                      <span key={tag} className="flex items-center gap-1.5 bg-red-50 text-red-700 text-[0.8rem] font-medium px-3 py-1.5 rounded-full">
                        {tag}
                        <button onClick={() => setForbiddenWords(forbiddenWords.filter(w => w !== tag))} className="hover:opacity-70 cursor-pointer"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={forbiddenInput}
                    onChange={e => setForbiddenInput(e.target.value)}
                    onKeyDown={handleForbiddenKey}
                    placeholder={t.auto_upload.forbiddenPlaceholder}
                    className="w-full border border-gray-200 rounded-[12px] px-4 py-3.5 text-[0.9rem] text-[#1A1A1A] mb-1 focus:outline-none focus:border-[#8B0000] transition-colors"
                    style={font}
                  />
                  <p className="text-[0.75rem] text-gray-400 mb-8" style={font}>{t.auto_upload.forbiddenHint}</p>

                  <label className="block text-[0.85rem] text-[#5a2a2a] mb-2" style={{ ...font, fontWeight: 500 }}>{t.auto_upload.hashtagLabel}</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {hashtags.map(tag => (
                      <span key={tag} className="flex items-center gap-1.5 bg-[rgba(139,0,0,0.08)] text-[#8B0000] text-[0.8rem] font-medium px-3 py-1.5 rounded-full">
                        {tag}
                        <button onClick={() => setHashtags(hashtags.filter(h => h !== tag))} className="hover:opacity-70 cursor-pointer"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={e => setHashtagInput(e.target.value)}
                    onKeyDown={handleHashtagKey}
                    placeholder={t.auto_upload.hashtagPlaceholder}
                    className="w-full border border-gray-200 rounded-[12px] px-4 py-3.5 text-[0.9rem] text-[#1A1A1A] mb-1 focus:outline-none focus:border-[#8B0000] transition-colors"
                    style={font}
                  />
                  <p className="text-[0.75rem] text-gray-400 mb-8" style={font}>{t.auto_upload.hashtagHint}</p>

                  <label className="block text-[0.85rem] text-[#5a2a2a] mb-2" style={{ ...font, fontWeight: 500 }}>{t.auto_upload.ctaLabel}</label>
                  <input
                    type="text"
                    value={cta}
                    onChange={e => setCta(e.target.value)}
                    placeholder={t.auto_upload.ctaPlaceholder}
                    className="w-full border border-gray-200 rounded-[12px] px-4 py-3.5 text-[0.9rem] text-[#1A1A1A] mb-2 focus:outline-none focus:border-[#8B0000] transition-colors"
                    style={font}
                  />
                  <div className="flex flex-wrap gap-2 mb-8">
                    {CTA_SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => setCta(s)} className="text-[0.75rem] text-[#8B0000] bg-[rgba(139,0,0,0.08)] px-3 py-1.5 rounded-full hover:bg-[rgba(139,0,0,0.15)] transition-colors cursor-pointer" style={font}>
                        {s}
                      </button>
                    ))}
                  </div>

                  <label className="block text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>{t.auto_upload.emojiLabel}</label>
                  <div className="flex gap-3">
                    {[t.auto_upload.emojiOften, t.auto_upload.emojiSometimes, t.auto_upload.emojiNever].map(opt => (
                      <button
                        key={opt}
                        onClick={() => setEmojiUsage(opt)}
                        className={`px-5 py-3 rounded-[10px] border-2 text-[0.9rem] font-medium transition-all cursor-pointer ${emojiUsage === opt ? 'border-[#8B0000] bg-[rgba(139,0,0,0.08)] text-[#8B0000]' : 'border-gray-200 text-[#1A1A1A] hover:border-gray-300'}`}
                        style={font}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: 업로드 스케줄 */}
              {step === 5 && (
                <div className="max-w-[520px]">
                  <h2 className="text-[1.3rem] text-[#1A1A1A] mb-8" style={{ ...font, fontWeight: 700 }}>{t.auto_upload.scheduleTitle}</h2>

                  <label className="block text-[0.85rem] text-[#5a2a2a] mb-2" style={{ ...font, fontWeight: 500 }}>{t.auto_upload.uploadTime}</label>
                  <select
                    value={uploadTime}
                    onChange={e => setUploadTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-[12px] px-4 py-3.5 text-[0.9rem] text-[#1A1A1A] mb-1 focus:outline-none focus:border-[#8B0000] transition-colors appearance-none bg-white cursor-pointer"
                    style={font}
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const t = `${String(i).padStart(2, '0')}:00`;
                      return <option key={t} value={t}>{t}</option>;
                    })}
                  </select>
                  <p className="text-[0.75rem] text-gray-400 mb-8" style={font}>{t.auto_upload.timeTip}</p>

                  <label className="block text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>{t.auto_upload.frequency}</label>
                  <div className="flex gap-3 mb-8">
                    {[t.auto_upload.daily, t.auto_upload.threePerWeek, t.auto_upload.weekly].map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setUploadFrequency(opt); setUploadDays([]); }}
                        className={`flex-1 py-4 rounded-[12px] border-2 text-[0.95rem] font-medium transition-all cursor-pointer ${uploadFrequency === opt ? 'border-[#8B0000] bg-[rgba(139,0,0,0.08)] text-[#8B0000]' : 'border-gray-200 text-[#1A1A1A] hover:border-gray-300'}`}
                        style={font}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {requiredDays > 0 && (
                    <div className="mb-8">
                      <label className="block text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>
                        {t.auto_upload.uploadDays} ({uploadDays.length}/{requiredDays})
                      </label>
                      <div className="flex gap-2">
                        {(WEEKDAYS[lang] || WEEKDAYS.ko).map((label, idx) => {
                          const isSelected = uploadDays.includes(idx);
                          const isFull = !isSelected && uploadDays.length >= requiredDays;
                          return (
                            <button
                              key={idx}
                              onClick={() => toggleUploadDay(idx)}
                              disabled={isFull}
                              className={`flex-1 py-3 rounded-[12px] border-2 text-[0.9rem] font-medium transition-all ${isSelected ? 'border-[#8B0000] bg-[rgba(139,0,0,0.08)] text-[#8B0000] cursor-pointer' : isFull ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-[#1A1A1A] hover:border-gray-300 cursor-pointer'}`}
                              style={font}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <label className="block text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>{t.auto_upload.photoCount}: {photoRange}</label>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={photoRange}
                    onChange={e => setPhotoRange(Number(e.target.value))}
                    className="w-full accent-[#8B0000] cursor-pointer"
                  />
                  <div className="flex justify-between text-[0.75rem] text-gray-400 mt-1" style={font}>
                    <span>1장</span><span>20장</span>
                  </div>
                </div>
              )}

              {/* 네비게이션 버튼 */}
              <div className="flex items-center justify-between mt-auto pt-10">
                <button
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                  className={`px-8 py-3 rounded-[10px] border text-[0.95rem] font-medium transition-all cursor-pointer ${step === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-[#5a2a2a] hover:bg-gray-50'}`}
                  style={font}
                >
                  {t.auto_upload.prev}
                </button>
                {step < 5 ? (
                  <button
                    onClick={() => canNext() && setStep(step + 1)}
                    disabled={!canNext()}
                    className={`px-8 py-3 rounded-[10px] text-[0.95rem] font-medium transition-all cursor-pointer ${canNext() ? 'bg-[#8B0000] text-white hover:bg-[#6b0000]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    style={font}
                  >
                    {t.auto_upload.next}
                  </button>
                ) : (
                  <button
                    onClick={() => canNext() && handleComplete()}
                    disabled={!canNext()}
                    className={`px-8 py-3 rounded-[10px] text-[0.95rem] font-medium transition-all cursor-pointer ${canNext() ? 'bg-[#8B0000] text-white hover:bg-[#6b0000]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    style={font}
                  >
                    {t.auto_upload.done}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: 완료 */}
        {isInstaConnected && step === 6 && (
          <div className="flex-1 flex items-center justify-center py-10">
            <div className="flex flex-col items-center max-w-[400px]">
              <CheckCircle size={80} className="text-[#8B0000] mb-6" strokeWidth={1.5} />
              <p className="text-[1.4rem] text-[#1A1A1A] mb-8" style={{ ...font, fontWeight: 500 }}>
                {t.auto_upload.complete}
              </p>

              {/* 샘플 게시물 */}
              <p className="text-[0.85rem] text-gray-500 mb-3" style={font}>{t.auto_upload.sampleLabel}</p>
              <div className="w-[280px] rounded-lg border border-gray-200 overflow-hidden shadow-md bg-white mb-8" style={font}>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-[28px] h-[28px] rounded-full bg-gray-300 shrink-0" />
                    <span className="text-[12px] font-bold text-gray-900">{shopName || 'barber_studio'}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="5" cy="12" r="1.5" fill="#262626" />
                    <circle cx="12" cy="12" r="1.5" fill="#262626" />
                    <circle cx="19" cy="12" r="1.5" fill="#262626" />
                  </svg>
                </div>
                <div className="aspect-square w-full bg-gray-200">
                  <img src="/demo/pass_01.jpg" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Heart size={16} className="text-gray-800" />
                    <MessageCircle size={16} className="text-gray-800" />
                    <Send size={16} className="text-gray-800" />
                  </div>
                  <Bookmark size={16} className="text-gray-800" />
                </div>
                <div className="px-3 pb-3">
                  <p className="text-[11px] text-gray-800 leading-relaxed">
                    <span className="font-bold">{shopName || 'barber_studio'}</span>{' '}
                    {selectedStyleData?.caption || '페이드컷 전문점이 있다고?! 바로 여기로 오세요! ✂️'}
                  </p>
                  <p className="text-[10px] text-[#8B0000] mt-1.5">
                    {selectedStyleData?.hashtags || '#페이드컷 #바버샵 #남성헤어'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <p className="text-[0.9rem] text-[#5a2a2a] flex items-center gap-2.5" style={{ ...font, fontWeight: 300 }}>
                  <span className="text-[#8B0000] font-bold">✓</span> {t.auto_upload.checkInsta}
                </p>
                <p className="text-[0.9rem] text-[#5a2a2a] flex items-center gap-2.5" style={{ ...font, fontWeight: 300 }}>
                  <span className="text-[#8B0000] font-bold">✓</span> {t.auto_upload.checkPersonal}
                </p>
                <p className="text-[0.9rem] text-[#5a2a2a] flex items-center gap-2.5" style={{ ...font, fontWeight: 300 }}>
                  <span className="text-[#8B0000] font-bold">✓</span> {t.auto_upload.checkAI}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/dashboard/posts')}
                  className="px-10 py-3.5 rounded-[10px] bg-[#8B0000] text-white text-[0.95rem] font-medium hover:bg-[#6b0000] transition-colors cursor-pointer"
                  style={font}
                >
                  {t.auto_upload.goToDashboard}
                </button>
                <button
                  onClick={() => { localStorage.setItem('onboarding_completed', 'false'); setStep(1); }}
                  className="px-8 py-3.5 rounded-[10px] border border-gray-200 text-[0.9rem] text-[#5a2a2a] font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  style={font}
                >
                  온보딩 다시 설정하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
