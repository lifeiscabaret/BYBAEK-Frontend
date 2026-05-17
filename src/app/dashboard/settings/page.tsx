"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useTranslation } from '@/hooks/useTranslation';
import apiClient from '@/api/index';

const font = { fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" };

export default function SettingsPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  const [uploadTime, setUploadTime] = useState('19:00');
  const [uploadFrequency, setUploadFrequency] = useState<string | null>('매일');
  const [photoRange, setPhotoRange] = useState(3);
  const [emojiUsage, setEmojiUsage] = useState<string | null>('가끔 씀');
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');
  const [shopId, setShopId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

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
          if (res.data) {
            if (res.data.upload_time) setUploadTime(res.data.upload_time);
            if (res.data.upload_frequency) setUploadFrequency(res.data.upload_frequency);
            if (res.data.photo_range) setPhotoRange(res.data.photo_range);
            if (res.data.emoji_usage) setEmojiUsage(res.data.emoji_usage);
          }
        } catch {}
      };
      fetchSettings();
    }
  }, []);

  const handleSave = async () => {
    if (language) localStorage.setItem('language', language);
    setSaveStatus('saving');
    try {
      if (shopId) {
        await apiClient.post(`/onboarding/${shopId}`, {
          upload_time: uploadTime,
          upload_frequency: uploadFrequency,
          photo_range: photoRange,
          emoji_usage: emojiUsage,
        });
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
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
                onClick={() => setUploadFrequency(opt)}
                className={`flex-1 max-w-[160px] py-3.5 rounded-[10px] border-2 text-[0.9rem] font-medium transition-all cursor-pointer ${uploadFrequency === opt ? 'border-[#8B0000] bg-[rgba(139,0,0,0.08)] text-[#8B0000]' : 'border-gray-200 text-[#1A1A1A] hover:border-gray-300'}`}
                style={font}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* ② 게시물 설정 */}
        <div className="bg-white border border-[#f0e8e8] rounded-[16px] p-7 mb-6">
          <p className="text-[0.95rem] text-[#1A1A1A] font-bold mb-5" style={font}>{t.settings_page.postSettings}</p>

          <label className="block text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>{t.settings_page.photoCount}: {photoRange}</label>
          <input
            type="range"
            min={1}
            max={20}
            value={photoRange}
            onChange={e => setPhotoRange(Number(e.target.value))}
            className="w-full max-w-[400px] accent-[#8B0000] cursor-pointer"
          />
          <div className="flex justify-between max-w-[400px] text-[0.75rem] text-gray-400 mt-1 mb-6" style={font}>
            <span>1장</span><span>20장</span>
          </div>

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

        {/* ③ 언어 설정 */}
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

        {/* ④ 저장 */}
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`px-10 py-3.5 rounded-[10px] text-white text-[0.95rem] font-medium transition-colors cursor-pointer ${saveStatus === 'saving' ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8B0000] hover:bg-[#6b0000]'}`}
          style={font}
        >
          {saveStatus === 'saving' ? '...' : saveStatus === 'success' ? '저장됨 ✓' : saveStatus === 'error' ? '저장 실패' : t.settings_page.saveBtn}
        </button>
      </div>
    </div>
  );
}
