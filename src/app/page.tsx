// 타겟 경로: src/app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingScreen() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(false);
  const [splashPhase, setSplashPhase] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const seen = sessionStorage.getItem('splash_seen');
    if (!seen) {
      setShowSplash(true);
      sessionStorage.setItem('splash_seen', 'true');
    }
  }, []);

  useEffect(() => {
    if (!showSplash) return;
    const timers = [
      setTimeout(() => setSplashPhase(1), 0),
      setTimeout(() => setSplashPhase(2), 1000),
      setTimeout(() => setSplashPhase(3), 1800),
      setTimeout(() => setSplashPhase(4), 2400),
      setTimeout(() => setSplashPhase(5), 3400),
      setTimeout(() => setShowSplash(false), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [showSplash]);

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

  if (showSplash) {
    return (
      <div className="min-h-screen fixed inset-0 flex items-center justify-center" style={{
        background: 'radial-gradient(ellipse at center, #6b0f1a 0%, #3D0000 100%)'
      }}>
        {/* Phase 1: 로고 중앙 페이드인 → Phase 2: 좌상단 이동 */}
        <motion.div
          className="absolute"
          initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
          animate={
            splashPhase >= 2
              ? { opacity: 1, scale: 0.6, x: 'calc(-50vw + 80px)', y: 'calc(-50vh + 60px)' }
              : splashPhase >= 1
              ? { opacity: 1, scale: 1, x: 0, y: 0 }
              : { opacity: 0, scale: 0.8, x: 0, y: 0 }
          }
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <img src="/BYBAEK_icon.svg" alt="BYBAEK" className="w-24 h-24 object-contain" />
        </motion.div>

        {/* Phase 3: 워드마크 페이드인 */}
        <AnimatePresence>
          {splashPhase >= 3 && (
            <motion.h1
              className="absolute text-white text-[83px] tracking-[0.18em] font-thin"
              style={{ fontFamily: "'S-Core Dream', sans-serif" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              BYBAEK
            </motion.h1>
          )}
        </AnimatePresence>

        {/* Phase 4: 카피 텍스트 staggered */}
        <div className="absolute top-[55%] text-center space-y-6">
          {splashPhase >= 4 && (
            <>
              <motion.p
                className="text-white text-[clamp(1.8rem,3.5vw,3.2rem)] font-light tracking-[0.15em]"
                style={{ fontFamily: "'NanumSquare', sans-serif" }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                가게 일 하랴, 인스타 하랴 바쁜 사장님들
              </motion.p>
              <motion.p
                className="text-white/75 text-[clamp(1.5rem,3vw,2.8rem)] font-extralight tracking-[0.15em]"
                style={{ fontFamily: "'NanumSquare', sans-serif" }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 0.75, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
              >
                이제 마케팅은 맡기세요
              </motion.p>
              <motion.p
                className="text-white/55 text-[clamp(1.3rem,2.5vw,2.4rem)] font-extralight tracking-[0.15em]"
                style={{ fontFamily: "'NanumSquare', sans-serif" }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 0.55, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
              >
                사장님만의 마케터가 대신합니다
              </motion.p>
            </>
          )}
        </div>

        {/* Phase 5: 버튼 페이드인 */}
        {splashPhase >= 5 && (
          <motion.div
            className="absolute bottom-16 flex items-center justify-center gap-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <button
              onClick={handleStartClick}
              className="bg-transparent border border-white/70 text-white text-lg font-medium rounded-lg px-12 py-3.5 hover:bg-white/15 transition-all duration-[250ms] ease-in-out"
            >
              무료로 시작하기
            </button>
            <button
              onClick={handleStartClick}
              className="bg-transparent border border-white/70 text-white text-lg font-medium rounded-lg px-12 py-3.5 hover:bg-white/15 transition-all duration-[250ms] ease-in-out"
            >
              서비스 보러가기
            </button>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{
      background: 'radial-gradient(ellipse at center, #b37777 0%, #6b0f1a 50%, #3D0000 100%)'
    }}>
      {/* 헤더 */}
      <header className="relative flex items-center justify-center px-12 py-8">
        {/* 로고 - 좌측 고정 */}
        <div className="absolute left-12 top-1/2 -translate-y-1/2">
          <img src="/BYBAEK_icon.svg" alt="BYBAEK" className="w-10 h-10 object-contain" />
        </div>

        {/* 워드마크 - 중앙 고정 */}
        <h1 className="text-white text-[83px] tracking-[0.18em] font-thin" style={{ fontFamily: "'S-Core Dream', sans-serif" }}>
          BYBAEK
        </h1>

        {/* 언어 선택 - 우측 고정 */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 text-white text-xl tracking-wide">
          <span className="font-bold">KR</span>
          <span className="mx-2 opacity-60">|</span>
          <span className="opacity-40 font-normal hover:opacity-80 transition-opacity cursor-pointer">EN</span>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-center space-y-10">
          <p className="text-white text-[clamp(1.8rem,3.5vw,3.2rem)] font-light tracking-[0.15em] leading-loose" style={{ fontFamily: "'NanumSquare', sans-serif" }}>
            가게 일 하랴, 인스타 하랴 바쁜 사장님들
          </p>
          <p className="text-white/75 text-[clamp(1.5rem,3vw,2.8rem)] font-extralight tracking-[0.15em] leading-loose" style={{ fontFamily: "'NanumSquare', sans-serif" }}>
            이제 마케팅은 맡기세요
          </p>
          <p className="text-white/55 text-[clamp(1.3rem,2.5vw,2.4rem)] font-extralight tracking-[0.15em] leading-loose" style={{ fontFamily: "'NanumSquare', sans-serif" }}>
            사장님만의 마케터가 대신합니다
          </p>
        </div>
      </main>

      {/* 하단 버튼 */}
      <footer className="flex items-center justify-center gap-20 pb-16">
        <button
          onClick={handleStartClick}
          className="bg-transparent border border-white/70 text-white text-lg font-medium rounded-lg px-12 py-3.5 hover:bg-white/15 transition-all duration-[250ms] ease-in-out"
        >
          무료로 시작하기
        </button>
        <button
          onClick={handleStartClick}
          className="bg-transparent border border-white/70 text-white text-lg font-medium rounded-lg px-12 py-3.5 hover:bg-white/15 transition-all duration-[250ms] ease-in-out"
        >
          서비스 보러가기
        </button>
      </footer>
    </div>
  );
}
