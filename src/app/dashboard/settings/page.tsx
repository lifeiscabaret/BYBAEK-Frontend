"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/components/Toast';
import { CustomButton } from '@/components/CustomButton';
import apiClient from '@/api/index';

const font = { fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" };

// 요일 라벨 (0=월 ... 6=일)
const WEEKDAYS: Record<string, string[]> = {
  ko: ['월', '화', '수', '목', '금', '토', '일'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

export default function SettingsPage() {
  const { t, lang } = useTranslation();
  const toast = useToast();
  const [isMounted, setIsMounted] = useState(false);

  const [uploadTime, setUploadTime] = useState('19:00');
  const [uploadFrequency, setUploadFrequency] = useState<string | null>(null);
  const [uploadDays, setUploadDays] = useState<number[]>([]);
  const [photoRange, setPhotoRange] = useState(3);
  const [emojiUsage, setEmojiUsage] = useState<string | null>(null);
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  const [shopId, setShopId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalyzeMsg, setReanalyzeMsg] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const id = localStorage.getItem('shop_id');
    setShopId(id);
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'en' || savedLang === 'ko') setLanguage(savedLang);

    if (id) {
      const fetchSettings = async () => {
        try {
          const res = await apiClient.get(`/onboarding/${id}`);
          const shop = res.data?.shop_info || {};
          if (shop.insta_upload_time) setUploadTime(shop.insta_upload_time);
          if (shop.insta_upload_time_slot) {
            const slotMap: Record<string, string> = {
              '매일': t.settings_page.daily,
              '주 3회': t.settings_page.threePerWeek,
              '주 1회': t.settings_page.weekly,
            };
            setUploadFrequency(slotMap[shop.insta_upload_time_slot] || shop.insta_upload_time_slot);
          }
          if (shop.insta_upload_days) setUploadDays(shop.insta_upload_days);
          if (shop.language === 'ko' || shop.language === 'en') setLanguage(shop.language);
          // ↓ 여기 두 줄 추가
          if (shop.photo_range_max) setPhotoRange(Math.min(10, Number(shop.photo_range_max) || 5));
          if (shop.brand_tone && Array.isArray(shop.brand_tone)) {
            const emojiOptions = ['자주 씀', '가끔 씀', '안 씀'];
            const foundEmoji = shop.brand_tone.find((v: string) => emojiOptions.includes(v));
            if (foundEmoji) {
              const emojiMap: Record<string, string> = {
                '자주 씀': t.settings_page.often,
                '가끔 씀': t.settings_page.sometimes,
                '안 씀': t.settings_page.never,
              };
              setEmojiUsage(emojiMap[foundEmoji] || foundEmoji);
            }
          }
        } catch { }
      };
      fetchSettings();
    }
  }, []);

  const requiredDays = uploadFrequency === t.settings_page.threePerWeek ? 3 : uploadFrequency === t.settings_page.weekly ? 1 : 0;

  const toggleUploadDay = (day: number) => {
    setUploadDays(prev => {
      if (prev.includes(day)) return prev.filter(d => d !== day);
      if (requiredDays > 0 && prev.length >= requiredDays) return prev; // 정확히 N개 초과 선택 방지
      return [...prev, day].sort((a, b) => a - b);
    });
  };

  const handleReanalyze = async () => {
    if (reanalyzing) return; // 연타 방지
    setReanalyzing(true);
    setReanalyzeMsg('');
    try {
      const res = await apiClient.post(`/onboarding/${shopId}/reanalyze`);
      if (res.data.status === 'success') {
        setReanalyzeMsg(t.settings_page.reanalyzeSuccess);
      } else {
        setReanalyzeMsg(res.data.message || t.settings_page.reanalyzeFailed);
      }
    } catch {
      setReanalyzeMsg(t.settings_page.reanalyzeError);
    } finally {
      setReanalyzing(false);
    }
  };

  const handleSave = async () => {
    localStorage.setItem('language', language);
    // shopId가 없으면 실제로 저장할 수 없음 — 성공으로 위장하지 않고 에러 토스트.
    if (!shopId) {
      toast.error(t.toast.save_failed);
      return;
    }
    setSaveStatus('saving');
    try {
      await apiClient.post(`/onboarding/${shopId}`, {
        insta_upload_time: uploadTime,
        insta_upload_time_slot: (
          uploadFrequency === t.settings_page.daily ? '매일' :
            uploadFrequency === t.settings_page.threePerWeek ? '주 3회' :
              uploadFrequency === t.settings_page.weekly ? '주 1회' :
                uploadFrequency
        ),
        language,
        insta_auto_upload_yn: 'Y',
        insta_upload_days: uploadDays,
        photo_range_max: photoRange,
        brand_tone_emoji: (
          emojiUsage === t.settings_page.often ? '자주 씀' :
            emojiUsage === t.settings_page.sometimes ? '가끔 씀' :
              emojiUsage === t.settings_page.never ? '안 씀' :
                emojiUsage
        ),
      });
      toast.success(t.toast.saved);
    } catch {
      toast.error(t.toast.save_failed);
    } finally {
      setSaveStatus('idle');
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-row h-screen w-full bg-[#F5F0EB] overflow-hidden">
      <Sidebar />

      <div className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-[1.6rem] text-[#1A1A1A] mb-8" style={{ ...font, fontWeight: 700 }}>{t.settings_page.title}</h1>

        {/* ① 업로드 스케줄 */}
        <div className="bg-white border border-[#f0e8e8] rounded-[16px] p-7 mb-6">
          <p className="text-[0.95rem] text-[#1A1A1A] font-bold mb-5" style={font}>{t.settings_page.scheduleTitle}</p>

          <label className="block text-[0.85rem] text-[#5a2a2a] mb-2" style={{ ...font, fontWeight: 500 }}>{t.settings_page.uploadTime}</label>
          <select
            value={uploadTime}
            onChange={e => setUploadTime(e.target.value)}
            className="w-full max-w-[240px] border border-gray-200 rounded-[10px] px-4 py-3 text-[0.9rem] text-[#1A1A1A] mb-2 focus:outline-none focus:border-[#8B0000] transition-colors appearance-none bg-white cursor-pointer"
            style={font}
          >
            {Array.from({ length: 24 }, (_, i) => {
              const t = `${String(i).padStart(2, '0')}:00`;
              return <option key={t} value={t}>{t}</option>;
            })}
          </select>
          <p className="text-[0.75rem] text-gray-400 mb-6" style={font}>{t.settings_page.timeTip}</p>

          <label className="block text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>{t.settings_page.frequency}</label>
          <div className="flex gap-3">
            {[t.settings_page.daily, t.settings_page.threePerWeek, t.settings_page.weekly].map(opt => (
              <button
                key={opt}
                onClick={() => { setUploadFrequency(opt); setUploadDays([]); }}
                className={`flex-1 max-w-[160px] py-3.5 rounded-[10px] border-2 text-[0.9rem] font-medium transition-all cursor-pointer ${uploadFrequency === opt ? 'border-[#8B0000] bg-[rgba(139,0,0,0.08)] text-[#8B0000]' : 'border-gray-200 text-[#1A1A1A] hover:border-gray-300'}`}
                style={font}
              >
                {opt}
              </button>
            ))}
          </div>

          {requiredDays > 0 && (
            <div className="mt-6">
              <label className="block text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>
                {t.settings_page.uploadDays} ({uploadDays.length}/{requiredDays})
              </label>
              <div className="flex gap-2 max-w-[400px]">
                {(WEEKDAYS[lang] || WEEKDAYS.ko).map((label, idx) => {
                  const isSelected = uploadDays.includes(idx);
                  const isFull = !isSelected && uploadDays.length >= requiredDays;
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleUploadDay(idx)}
                      disabled={isFull}
                      className={`flex-1 py-3 rounded-[10px] border-2 text-[0.9rem] font-medium transition-all ${isSelected ? 'border-[#8B0000] bg-[rgba(139,0,0,0.08)] text-[#8B0000] cursor-pointer' : isFull ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-[#1A1A1A] hover:border-gray-300 cursor-pointer'}`}
                      style={font}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ② 게시물 설정 */}
        <div className="bg-white border border-[#f0e8e8] rounded-[16px] p-7 mb-6">
          <p className="text-[0.95rem] text-[#1A1A1A] font-bold mb-5" style={font}>{t.settings_page.postSettings}</p>

          <label className="block text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>{t.settings_page.photoCount}: {photoRange}</label>
          <input
            type="range"
            min={1}
            max={10}
            value={photoRange}
            onChange={e => setPhotoRange(Number(e.target.value))}
            className="w-full max-w-[400px] accent-[#8B0000] cursor-pointer"
          />
          <div className="flex justify-between max-w-[400px] text-[0.75rem] text-gray-400 mt-1" style={font}>
            <span>1장</span><span>10장</span>
          </div>
          <p className="text-[0.75rem] text-gray-400 mt-2 mb-6" style={font}>{t.settings_page.photoMaxNotice}</p>

          <label className="block text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>{t.settings_page.emojiUsage}</label>
          <div className="flex gap-3">
            {[t.settings_page.often, t.settings_page.sometimes, t.settings_page.never].map(opt => (
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

        {/* ③ AI 개인화 */}
        <div className="bg-white border border-[#f0e8e8] rounded-[16px] p-7 mb-6">
          <p className="text-[0.95rem] text-[#1A1A1A] font-bold mb-2" style={font}>{t.settings_page.aiPersonalization}</p>
          <p className="text-[0.8rem] text-gray-500 mb-5" style={font}>{t.settings_page.reanalyzeDesc}</p>
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className={`px-6 py-3 rounded-[10px] border-2 text-[0.9rem] font-medium transition-all ${reanalyzing ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-[#8B0000] text-[#8B0000] hover:bg-[rgba(139,0,0,0.08)] cursor-pointer'}`}
            style={font}
          >
            {reanalyzing ? t.settings_page.reanalyzing : t.settings_page.reanalyzeBtn}
          </button>
          {reanalyzeMsg && (
            <p className="text-[0.85rem] text-[#5a2a2a] mt-3" style={{ ...font, fontWeight: 500 }}>{reanalyzeMsg}</p>
          )}
        </div>

        {/* ④ 언어 설정 */}
        <div className="bg-white border border-[#f0e8e8] rounded-[16px] p-7 mb-8">
          <p className="text-[0.95rem] text-[#1A1A1A] font-bold mb-5" style={font}>{t.settings_page.language}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setLanguage('ko')}
              className={`flex-1 max-w-[160px] py-3.5 rounded-[10px] border-2 text-[0.9rem] font-medium transition-all cursor-pointer ${language === 'ko' ? 'border-[#8B0000] bg-[rgba(139,0,0,0.08)] text-[#8B0000]' : 'border-gray-200 text-[#1A1A1A] hover:border-gray-300'}`}
              style={font}
            >
              한국어
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 max-w-[160px] py-3.5 rounded-[10px] border-2 text-[0.9rem] font-medium transition-all cursor-pointer ${language === 'en' ? 'border-[#8B0000] bg-[rgba(139,0,0,0.08)] text-[#8B0000]' : 'border-gray-200 text-[#1A1A1A] hover:border-gray-300'}`}
              style={font}
            >
              English
            </button>
          </div>
        </div>

        {/* ⑤ 저장 */}
        <CustomButton
          title={t.settings_page.saveBtn}
          onClick={handleSave}
          loading={saveStatus === 'saving'}
          loadingText={t.toast.saving}
          className="px-10 !py-3.5 !rounded-[10px]"
          style={font}
        />
      </div>
    </div>
  );
}
