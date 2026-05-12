"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useScroll } from 'framer-motion';

const demoTexts = {
  ko: {
    hero: '사진 한 장으로\n마케팅이 어떻게 만들어지는지 보여드릴게요',
    step1Label: 'Step 1',
    step1Text: 'AI가 바버샵 사진만 골라냅니다',
    step2Label: 'Step 2',
    step2Text: '사장님만의 브랜드 톤을 설정합니다',
    step3Label: 'Step 3',
    step3Text: 'AI가 게시물을 자동으로 만들어냅니다',
    step3Caption: '오늘도 멋진 스타일로 하루를 시작하세요 ✂️ 클래식한 감성, 모던한 마무리.',
    step3Hashtags: ['#바버샵', '#남성헤어', '#페이드컷', '#바버스타일', '#힙한이발소'],
    ctaText: '지금 바로 시작해보세요',
    ctaBtn1: '무료로 시작하기',
    ctaBtn2: '처음으로',
  },
  en: {
    hero: 'See how one photo\nbecomes your next Instagram post',
    step1Label: 'Step 1',
    step1Text: 'AI picks only barbershop photos',
    step2Label: 'Step 2',
    step2Text: 'Set your unique brand tone',
    step3Label: 'Step 3',
    step3Text: 'AI creates posts automatically',
    step3Caption: 'Start your day with a fresh cut ✂️ Classic vibes, modern finish.',
    step3Hashtags: ['#barbershop', '#menshair', '#fadecut', '#barberstyle', '#freshcut'],
    ctaText: 'Start your free trial',
    ctaBtn1: 'Start for free',
    ctaBtn2: 'Back to top',
  },
};

const styleCards = [
  { ko: '힙합', en: 'Hip-hop' },
  { ko: '클래식', en: 'Classic' },
  { ko: '모던', en: 'Modern' },
];

function interpolateColor(progress: number, colors: { stop: number; color: [number, number, number] }[]) {
  for (let i = 0; i < colors.length - 1; i++) {
    if (progress >= colors[i].stop && progress <= colors[i + 1].stop) {
      const localProgress = (progress - colors[i].stop) / (colors[i + 1].stop - colors[i].stop);
      const r = Math.round(colors[i].color[0] + (colors[i + 1].color[0] - colors[i].color[0]) * localProgress);
      const g = Math.round(colors[i].color[1] + (colors[i + 1].color[1] - colors[i].color[1]) * localProgress);
      const b = Math.round(colors[i].color[2] + (colors[i + 1].color[2] - colors[i].color[2]) * localProgress);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  const last = colors[colors.length - 1];
  return `rgb(${last.color[0]}, ${last.color[1]}, ${last.color[2]})`;
}

const bgColors: { stop: number; color: [number, number, number] }[] = [
  { stop: 0.0, color: [252, 228, 236] },
  { stop: 0.15, color: [253, 240, 240] },
  { stop: 0.35, color: [255, 255, 255] },
  { stop: 0.55, color: [253, 240, 240] },
  { stop: 0.75, color: [74, 0, 0] },
  { stop: 1.0, color: [139, 0, 0] },
];

function rangeMap(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const clamped = Math.max(inMin, Math.min(inMax, value));
  return outMin + ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin);
}

export default function DemoPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [isMounted, setIsMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => setProgress(v));
    return unsubscribe;
  }, [scrollYProgress]);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'ko') {
      setLang(saved);
    } else {
      const isKorean = navigator.languages
        ? navigator.languages.some(l => l.startsWith('ko'))
        : navigator.language?.startsWith('ko');
      setLang(isKorean ? 'ko' : 'en');
    }
  }, []);

  const switchLang = (l: 'ko' | 'en') => {
    setLang(l);
    localStorage.setItem('language', l);
  };

  if (!isMounted) return null;

  const t = demoTexts[lang];
  const bgColor = interpolateColor(progress, bgColors);
  const isLightBg = progress < 0.65;

  // Section visibilities
  const s1Opacity = rangeMap(progress, 0, 0.12, 1, 0);
  const s2Opacity = rangeMap(progress, 0.12, 0.15, 0, 1) * rangeMap(progress, 0.32, 0.35, 1, 0);
  const s3Opacity = rangeMap(progress, 0.32, 0.35, 0, 1) * rangeMap(progress, 0.52, 0.55, 1, 0);
  const s4Opacity = rangeMap(progress, 0.52, 0.55, 0, 1) * rangeMap(progress, 0.72, 0.75, 1, 0);
  const s5Opacity = rangeMap(progress, 0.72, 0.75, 0, 1);

  // Section 2 filter progress (0~1 within its range)
  const filterProgress = rangeMap(progress, 0.2, 0.32, 0, 1);

  // Section 3 card reveal
  const cardProgress = rangeMap(progress, 0.38, 0.50, 0, 1);
  const card1Visible = cardProgress > 0;
  const card2Visible = cardProgress > 0.33;
  const card3Visible = cardProgress > 0.66;
  const autoSelectVisible = cardProgress >= 1;

  // Section 4 typing progress
  const typingProgress = rangeMap(progress, 0.58, 0.70, 0, 1);
  const caption = t.step3Caption;
  const typedLength = Math.floor(typingProgress * caption.length);
  const hashtagProgress = rangeMap(progress, 0.68, 0.73, 0, 1);
  const hashtagCount = Math.floor(hashtagProgress * t.step3Hashtags.length);

  return (
    <div>
      {/* Scrollable height */}
      <div style={{ height: '500vh', position: 'relative' }}>
        {/* Sticky viewport */}
        <div
          className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          {/* 고정 헤더 */}
          <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center px-12 py-6">
            <div className="absolute left-12 top-1/2 -translate-y-1/2">
              <img src="/BYBAEK_icon.svg" alt="BYBAEK" className="w-10 h-10 object-contain" />
            </div>
            <h1
              className="text-3xl tracking-[0.18em] font-thin transition-colors duration-300"
              style={{ fontFamily: "'S-Core Dream', sans-serif", color: isLightBg ? '#8B0000' : '#ffffff' }}
            >
              BYBAEK
            </h1>
            <div className="absolute right-12 top-1/2 -translate-y-1/2 text-lg tracking-wide transition-colors duration-300" style={{ color: isLightBg ? '#8B0000' : '#ffffff' }}>
              <span
                className={`cursor-pointer transition-opacity duration-300 ${lang === 'ko' ? 'font-bold opacity-100' : 'font-normal opacity-40 hover:opacity-70'}`}
                onClick={() => switchLang('ko')}
              >KR</span>
              <span className="mx-2 opacity-40">|</span>
              <span
                className={`cursor-pointer transition-opacity duration-300 ${lang === 'en' ? 'font-bold opacity-100' : 'font-normal opacity-40 hover:opacity-70'}`}
                onClick={() => switchLang('en')}
              >EN</span>
            </div>
          </header>

          {/* 섹션 1: 인트로 */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-8 transition-none"
            style={{ opacity: s1Opacity, pointerEvents: s1Opacity > 0.1 ? 'auto' : 'none' }}
          >
            <p
              className="text-center font-light tracking-[0.08em] leading-relaxed whitespace-pre-line"
              style={{
                fontFamily: "'NanumSquare', sans-serif",
                fontSize: lang === 'en' ? 'clamp(1.6rem, 3vw, 2.6rem)' : 'clamp(1.8rem, 3.5vw, 3rem)',
                color: '#8B0000',
              }}
            >
              {t.hero}
            </p>
            <div className="absolute bottom-12 animate-bounce">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
          </div>

          {/* 섹션 2: Step 1 AI 필터링 */}
          <div
            className="absolute inset-0 flex items-center justify-center px-8"
            style={{ opacity: s2Opacity, pointerEvents: s2Opacity > 0.1 ? 'auto' : 'none' }}
          >
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div style={{ transform: `translateX(${rangeMap(progress, 0.13, 0.2, -40, 0)}px)` }}>
                <p className="text-[#8B0000] text-sm uppercase tracking-widest mb-3 font-medium">{t.step1Label}</p>
                <p className="text-gray-800 text-2xl font-light leading-relaxed" style={{ fontFamily: "'NanumSquare', sans-serif" }}>
                  {t.step1Text}
                </p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {Array(16).fill(null).map((_, i) => {
                  const isKept = i % 3 !== 0;
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-gray-200 flex items-center justify-center"
                      style={{
                        opacity: filterProgress > 0.3 ? (isKept ? 1 : 0.2) : 1,
                        transform: filterProgress > 0.3 ? (isKept ? 'scale(1.05)' : 'scale(0.95)') : 'scale(1)',
                        boxShadow: filterProgress > 0.3 && isKept ? '0 0 0 2px rgba(139,0,0,0.4)' : 'none',
                        transition: 'all 0.6s ease',
                      }}
                    >
                      {filterProgress > 0.5 && (
                        <span className={`text-lg ${isKept ? 'text-[#8B0000]' : 'text-gray-400'}`}>
                          {isKept ? '✓' : '✕'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 섹션 3: Step 2 마케터 설정 */}
          <div
            className="absolute inset-0 flex items-center justify-center px-8"
            style={{ opacity: s3Opacity, pointerEvents: s3Opacity > 0.1 ? 'auto' : 'none' }}
          >
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div style={{ transform: `translateX(${rangeMap(progress, 0.33, 0.4, -40, 0)}px)` }}>
                <p className="text-[#8B0000] text-sm uppercase tracking-widest mb-3 font-medium">{t.step2Label}</p>
                <p className="text-gray-800 text-2xl font-light leading-relaxed" style={{ fontFamily: "'NanumSquare', sans-serif" }}>
                  {t.step2Text}
                </p>
              </div>
              <div className="space-y-4">
                {styleCards.map((card, i) => {
                  const visible = i === 0 ? card1Visible : i === 1 ? card2Visible : card3Visible;
                  const selected = autoSelectVisible && i === 1;
                  return (
                    <div
                      key={i}
                      className={`px-6 py-5 rounded-xl border-2 transition-all duration-500 ${
                        selected ? 'border-[#8B0000] bg-[#8B0000]/10' : 'border-gray-200 bg-white'
                      }`}
                      style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.5s ease, transform 0.5s ease, border-color 0.5s ease, background-color 0.5s ease',
                      }}
                    >
                      <span className={`text-lg font-medium ${selected ? 'text-[#8B0000]' : 'text-gray-700'}`}>
                        {card[lang]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 섹션 4: Step 3 게시물 생성 */}
          <div
            className="absolute inset-0 flex items-center justify-center px-8"
            style={{ opacity: s4Opacity, pointerEvents: s4Opacity > 0.1 ? 'auto' : 'none' }}
          >
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div style={{ transform: `translateX(${rangeMap(progress, 0.53, 0.6, -40, 0)}px)` }}>
                <p className="text-sm uppercase tracking-widest mb-3 font-medium" style={{ color: progress > 0.65 ? '#ffb3b3' : '#8B0000' }}>{t.step3Label}</p>
                <p
                  className="text-2xl font-light leading-relaxed"
                  style={{ fontFamily: "'NanumSquare', sans-serif", color: progress > 0.65 ? '#ffffff' : '#1f2937' }}
                >
                  {t.step3Text}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-lg bg-white">
                <div className="aspect-video bg-gray-200" />
                <div className="p-5">
                  <p className="text-sm text-gray-800 leading-relaxed min-h-[3rem]" style={{ fontFamily: "'NanumSquare', sans-serif" }}>
                    {caption.slice(0, typedLength)}
                    {typedLength < caption.length && <span className="animate-pulse">|</span>}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {t.step3Hashtags.slice(0, hashtagCount).map((tag, i) => (
                      <span key={i} className="text-xs text-[#8B0000] font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 섹션 5: CTA */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
            style={{ opacity: s5Opacity, pointerEvents: s5Opacity > 0.1 ? 'auto' : 'none' }}
          >
            <p
              className="text-white text-center font-light tracking-[0.1em] mb-16"
              style={{ fontFamily: "'NanumSquare', sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2.8rem)' }}
            >
              {t.ctaText}
            </p>
            <div className="flex items-center gap-8">
              <button
                onClick={() => router.push('/')}
                className="bg-white text-[#8B0000] text-lg font-medium rounded-lg px-10 py-4 hover:bg-white/90 transition-colors"
              >
                {t.ctaBtn1}
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-transparent border border-white/70 text-white text-lg font-medium rounded-lg px-10 py-4 hover:bg-white/15 transition-colors"
              >
                {t.ctaBtn2}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
