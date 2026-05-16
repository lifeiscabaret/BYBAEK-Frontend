"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';

const font = { fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" };

export default function SettingsPage() {
  const [isMounted, setIsMounted] = useState(false);

  const [uploadTime, setUploadTime] = useState('19:00');
  const [uploadFrequency, setUploadFrequency] = useState<string | null>('매일');
  const [photoRange, setPhotoRange] = useState(3);
  const [emojiUsage, setEmojiUsage] = useState<string | null>('가끔 씀');
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  useEffect(() => {
    setIsMounted(true);
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'en' || savedLang === 'ko') setLanguage(savedLang);
  }, []);

  const handleSave = () => {
    if (language) localStorage.setItem('language', language);
    console.log('settings_saved', {
      upload_time: uploadTime,
      upload_frequency: uploadFrequency,
      photo_range: photoRange,
      emoji_usage: emojiUsage,
      language,
    });
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-row h-screen w-full bg-[#F5F0EB] overflow-hidden">
      <Sidebar />

      <div className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-[1.6rem] text-[#1A1A1A] mb-8" style={{ ...font, fontWeight: 700 }}>설정</h1>

        {/* ① 업로드 스케줄 */}
        <div className="bg-white border border-[#f0e8e8] rounded-[16px] p-7 mb-6">
          <p className="text-[0.95rem] text-[#1A1A1A] font-bold mb-5" style={font}>업로드 스케줄</p>

          <label className="block text-[0.85rem] text-[#5a2a2a] mb-2" style={{ ...font, fontWeight: 500 }}>업로드 시간</label>
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
          <p className="text-[0.75rem] text-gray-400 mb-6" style={font}>💡 저녁 7~9시 업로드 성과가 높습니다</p>

          <label className="block text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>업로드 빈도</label>
          <div className="flex gap-3">
            {['매일', '주 3회', '주 1회'].map(opt => (
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
          <p className="text-[0.95rem] text-[#1A1A1A] font-bold mb-5" style={font}>게시물 설정</p>

          <label className="block text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>게시물당 사진 수: {photoRange}장</label>
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

          <label className="block text-[0.85rem] text-[#5a2a2a] mb-3" style={{ ...font, fontWeight: 500 }}>이모지 사용</label>
          <div className="flex gap-3">
            {['자주 씀', '가끔 씀', '안 씀'].map(opt => (
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
          <p className="text-[0.95rem] text-[#1A1A1A] font-bold mb-5" style={font}>언어 설정</p>
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
          className="px-10 py-3.5 rounded-[10px] bg-[#8B0000] text-white text-[0.95rem] font-medium hover:bg-[#6b0000] transition-colors cursor-pointer"
          style={font}
        >
          설정 저장
        </button>
      </div>
    </div>
  );
}
