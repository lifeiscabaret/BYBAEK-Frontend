// 타겟 경로: src/app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function FluidBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, #b37777 0%, #6b0f1a 50%, #3D0000 100%)'
      }} />
      <div
        className="absolute inset-[-50%] opacity-30 pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(139,0,0,0.4) 90deg, transparent 180deg, rgba(80,0,20,0.3) 270deg, transparent 360deg)',
          animation: 'fluidRotate 10s linear infinite',
        }}
      />
      <div
        className="absolute inset-[-50%] opacity-20 pointer-events-none"
        style={{
          background: 'conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(179,119,119,0.3) 120deg, transparent 240deg, rgba(60,0,0,0.4) 360deg)',
          animation: 'fluidRotate 14s linear infinite reverse',
        }}
      />
    </div>
  );
}

const texts = {
  ko: {
    line1: '가게 일 하랴, 인스타 하랴 바쁜 사장님들',
    line2: '이제 마케팅은 맡기세요',
    line3: '사장님만의 마케터가 대신합니다',
    btn1: '무료로 시작하기',
    btn2: '서비스 보러가기',
  },
  en: {
    line1: "Running your shop. Posting on Instagram. It's a lot.",
    line2: 'Let us handle the marketing.',
    line3: 'Your own personal marketer, working for you.',
    btn1: 'Start for free',
    btn2: 'See how it works',
  },
};

export default function LandingScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState(-1);
  const [isMounted, setIsMounted] = useState(false);
  const [skipSplash, setSkipSplash] = useState(false);
  const [lang, setLang] = useState<'ko' | 'en'>('ko');

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'ko') {
      setLang(saved);
    } else {
      const isKorean = navigator.languages
        ? navigator.languages.some(l => l.startsWith('ko'))
        : navigator.language?.startsWith('ko');
      const detected = isKorean ? 'ko' : 'en';
      setLang(detected);
      localStorage.setItem('language', detected);
    }
    const seen = sessionStorage.getItem('splash_seen');
    if (seen) {
      setSkipSplash(true);
    } else {
      sessionStorage.setItem('splash_seen', 'true');
      setPhase(0);
    }
  }, []);

  const switchLang = (l: 'ko' | 'en') => {
    setLang(l);
    localStorage.setItem('language', l);
  };

  useEffect(() => {
    if (skipSplash || phase < 0) return;
    const delays: Record<number, number> = {
      0: 100,   // Phase 0 → 1: B 로고 중앙 페이드인
      1: 1000,  // Phase 1 → 2: B 로고 좌상단 이동
      2: 800,   // Phase 2 → 3: 첫째 줄 등장
      3: 1500,  // Phase 3 → 4: 둘째 줄 등장
      4: 1500,  // Phase 4 → 5: 셋째 줄 등장
      5: 1500,  // Phase 5 → 6: 3줄 페이드아웃
      6: 2000,  // Phase 6 → 7: BYBAEK 임팩트
      7: 1500,  // Phase 7 → 8: 최종 상태 (버튼)
    };
    const delay = delays[phase];
    if (delay === undefined) return;
    const timer = setTimeout(() => setPhase(phase + 1), delay);
    return () => clearTimeout(timer);
  }, [phase, skipSplash]);

  const handleStartClick = () => {
    if (typeof window === 'undefined') return;
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  if (!isMounted) return null;

  // 버그1: 새로고침 시 최종 UI (카피 없이 BYBAEK + 버튼만)
  if (skipSplash) {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center" style={{
        background: 'radial-gradient(ellipse at center, #b37777 0%, #6b0f1a 50%, #3D0000 100%)'
      }}>
        <FluidBackground />

        {/* B 로고 - 좌상단 */}
        <div className="absolute z-10 left-12 top-8">
          <img src="/BYBAEK_icon.svg" alt="BYBAEK" className="w-10 h-10 object-contain" />
        </div>

        {/* KR|EN - 우상단 */}
        <div className="absolute z-10 right-12 top-10 text-white text-xl tracking-wide">
          <span
            className={`cursor-pointer transition-opacity duration-300 ${lang === 'ko' ? 'font-bold opacity-100' : 'font-normal opacity-50 hover:opacity-80'}`}
            onClick={() => switchLang('ko')}
          >KR</span>
          <span className="mx-2 opacity-60">|</span>
          <span
            className={`cursor-pointer transition-opacity duration-300 ${lang === 'en' ? 'font-bold opacity-100' : 'font-normal opacity-50 hover:opacity-80'}`}
            onClick={() => switchLang('en')}
          >EN</span>
        </div>

        {/* BYBAEK 워드마크 - 중앙 위 */}
        <h1
          className="relative z-10 text-white text-[83px] tracking-[0.18em] font-thin -mt-16"
          style={{ fontFamily: "'S-Core Dream', sans-serif" }}
        >
          BYBAEK
        </h1>

        {/* 버튼 - BYBAEK 아래 */}
        <div className="relative z-10 flex items-center justify-center gap-20 mt-12">
          <button
            onClick={handleStartClick}
            className="bg-transparent border border-white/70 text-white text-lg font-medium rounded-lg px-12 py-3.5 hover:bg-white/15 transition-all duration-[250ms] ease-in-out"
          >
            {texts[lang].btn1}
          </button>
          <button
            onClick={handleStartClick}
            className="bg-transparent border border-white/70 text-white text-lg font-medium rounded-lg px-12 py-3.5 hover:bg-white/15 transition-all duration-[250ms] ease-in-out"
          >
            {texts[lang].btn2}
          </button>
        </div>
      </div>
    );
  }

  // 스플래시 화면
  if (phase <= 8) {
    const showLogo = phase >= 1;
    const logoMoved = phase >= 2;
    const showLine1 = phase >= 3 && phase <= 5;
    const showLine2 = phase >= 4 && phase <= 5;
    const showLine3 = phase >= 5 && phase <= 5;
    const fadeOutLines = phase >= 6;
    const showBrand = phase >= 7;
    const showFinal = phase >= 8;

    return (
      <div className="min-h-screen fixed inset-0 overflow-hidden" style={{
        background: 'radial-gradient(ellipse at center, #6b0f1a 0%, #3D0000 100%)'
      }}>
        <FluidBackground />

        {/* 버그2: B 로고 - 중앙에서 페이드인 → 좌상단으로 이동 */}
        <div
          className="absolute z-10"
          style={{
            opacity: showLogo ? 1 : 0,
            top: logoMoved ? '32px' : '50%',
            left: logoMoved ? '48px' : '50%',
            transform: logoMoved
              ? 'translate(0, 0) scale(1)'
              : 'translate(-50%, -50%) scale(2.5)',
            transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), top 0.8s cubic-bezier(0.4, 0, 0.2, 1), left 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <img src="/BYBAEK_icon.svg" alt="BYBAEK" className="w-10 h-10 object-contain" />
        </div>

        {/* KR|EN - 우상단 고정 */}
        <div
          className="absolute z-10 right-12 top-10 text-white text-xl tracking-wide"
          style={{
            opacity: logoMoved ? 1 : 0,
            transition: 'opacity 0.8s ease',
          }}
        >
          <span className={lang === 'ko' ? 'font-bold' : 'font-normal opacity-50'}>KR</span>
          <span className="mx-2 opacity-60">|</span>
          <span className={lang === 'en' ? 'font-bold' : 'font-normal opacity-50'}>EN</span>
        </div>

        {/* 소개 텍스트 3줄 - 화면 정중앙 */}
        <div
          className="absolute z-10 inset-0 flex flex-col items-center justify-center text-center space-y-6 px-8"
          style={{
            opacity: fadeOutLines ? 0 : 1,
            transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <p
            className={`text-white font-light tracking-[0.15em] ${lang === 'en' ? 'text-[clamp(1.4rem,2.8vw,2.6rem)]' : 'text-[clamp(1.8rem,3.5vw,3.2rem)]'}`}
            style={{
              fontFamily: "'NanumSquare', sans-serif",
              opacity: showLine1 ? 1 : 0,
              transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {texts[lang].line1}
          </p>
          <p
            className={`text-white font-extralight tracking-[0.15em] ${lang === 'en' ? 'text-[clamp(1.2rem,2.4vw,2.2rem)]' : 'text-[clamp(1.5rem,3vw,2.8rem)]'}`}
            style={{
              fontFamily: "'NanumSquare', sans-serif",
              opacity: showLine2 ? 0.75 : 0,
              transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {texts[lang].line2}
          </p>
          <p
            className={`text-white font-extralight tracking-[0.15em] ${lang === 'en' ? 'text-[clamp(1rem,2vw,1.8rem)]' : 'text-[clamp(1.3rem,2.5vw,2.4rem)]'}`}
            style={{
              fontFamily: "'NanumSquare', sans-serif",
              opacity: showLine3 ? 0.55 : 0,
              transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {texts[lang].line3}
          </p>
        </div>

        {/* BYBAEK 워드마크 - 중앙에서 살짝 위로 */}
        <h1
          className="absolute z-10 left-1/2 top-1/2 text-white text-[83px] tracking-[0.18em] font-thin whitespace-nowrap"
          style={{
            fontFamily: "'S-Core Dream', sans-serif",
            opacity: showBrand ? 1 : 0,
            transform: showFinal
              ? 'translate(-50%, calc(-50% - 60px))'
              : 'translate(-50%, -50%)',
            transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          BYBAEK
        </h1>

        {/* 버튼 - BYBAEK 바로 아래 중앙 */}
        <div
          className="absolute z-10 left-1/2 top-1/2 flex items-center justify-center gap-20"
          style={{
            opacity: showFinal ? 1 : 0,
            transform: showFinal
              ? 'translate(-50%, 30px)'
              : 'translate(-50%, 60px)',
            transition: 'opacity 2s ease-out, transform 2s ease-out',
          }}
        >
          <button
            onClick={handleStartClick}
            className="bg-transparent border border-white/70 text-white text-lg font-medium rounded-lg px-12 py-3.5 hover:bg-white/15 transition-all duration-[250ms] ease-in-out"
          >
            {texts[lang].btn1}
          </button>
          <button
            onClick={handleStartClick}
            className="bg-transparent border border-white/70 text-white text-lg font-medium rounded-lg px-12 py-3.5 hover:bg-white/15 transition-all duration-[250ms] ease-in-out"
          >
            {texts[lang].btn2}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
