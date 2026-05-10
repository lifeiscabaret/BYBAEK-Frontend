"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';

const demoTexts = {
  ko: {
    heroLine1: '사진 한 장으로',
    heroLine2: '마케팅이 어떻게 만들어지는지 보여드릴게요',
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
    heroLine1: 'See how one photo',
    heroLine2: 'becomes your next Instagram post',
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

export default function DemoPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [isMounted, setIsMounted] = useState(false);

  const section1Ref = useRef<HTMLElement>(null);

  // Section 2 auto animation
  const section2Ref = useRef<HTMLDivElement>(null);
  const section2InView = useInView(section2Ref, { once: true, amount: 0.2 });
  const [filterDone, setFilterDone] = useState(false);
  const [filteredPhotos] = useState(() =>
    Array(16).fill(false).map(() => Math.random() > 0.5)
  );

  // Section 3 auto animation
  const section3Ref = useRef<HTMLDivElement>(null);
  const section3InView = useInView(section3Ref, { once: true, amount: 0.2 });
  const [styleRevealed, setStyleRevealed] = useState(0);
  const [autoSelected, setAutoSelected] = useState(-1);

  // Section 4 typing
  const section4Ref = useRef<HTMLDivElement>(null);
  const section4InView = useInView(section4Ref, { once: true, amount: 0.2 });
  const [typedCaption, setTypedCaption] = useState('');
  const [hashtagsShown, setHashtagsShown] = useState(0);

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

  // Section 2: auto filter after in view
  useEffect(() => {
    if (!section2InView || filterDone) return;
    const timer = setTimeout(() => setFilterDone(true), 2000);
    return () => clearTimeout(timer);
  }, [section2InView, filterDone]);

  // Section 3: stagger cards + auto select
  useEffect(() => {
    if (!section3InView || styleRevealed >= 3) return;
    const timer = setTimeout(() => setStyleRevealed(prev => prev + 1), 600);
    return () => clearTimeout(timer);
  }, [section3InView, styleRevealed]);

  useEffect(() => {
    if (styleRevealed < 3) return;
    const timer = setTimeout(() => setAutoSelected(1), 800);
    return () => clearTimeout(timer);
  }, [styleRevealed]);

  // Section 4: typing effect
  useEffect(() => {
    if (!section4InView) return;
    const caption = demoTexts[lang].step3Caption;
    if (typedCaption.length >= caption.length) {
      const hashtags = demoTexts[lang].step3Hashtags;
      if (hashtagsShown < hashtags.length) {
        const timer = setTimeout(() => setHashtagsShown(prev => prev + 1), 400);
        return () => clearTimeout(timer);
      }
      return;
    }
    const timer = setTimeout(() => {
      setTypedCaption(caption.slice(0, typedCaption.length + 1));
    }, 35);
    return () => clearTimeout(timer);
  }, [section4InView, typedCaption, hashtagsShown, lang]);

  const switchLang = (l: 'ko' | 'en') => {
    setLang(l);
    localStorage.setItem('language', l);
  };

  if (!isMounted) return null;

  const t = demoTexts[lang];

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {/* 고정 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-12 py-6">
        <div className="absolute left-12 top-1/2 -translate-y-1/2">
          <img src="/BYBAEK_icon.svg" alt="BYBAEK" className="w-10 h-10 object-contain" />
        </div>
        <h1 className="text-[#8B0000] text-3xl tracking-[0.18em] font-thin" style={{ fontFamily: "'S-Core Dream', sans-serif" }}>
          BYBAEK
        </h1>
        <div className="absolute right-12 top-1/2 -translate-y-1/2 text-[#8B0000] text-lg tracking-wide">
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
      <section
        ref={section1Ref}
        className="h-screen snap-start flex flex-col items-center justify-center relative"
        style={{ background: 'linear-gradient(to bottom, #fce4ec, #fdf0f0)' }}
      >
        <div className="text-center px-8">
          <motion.p
            className="text-[#8B0000] font-light tracking-[0.08em] leading-relaxed"
            style={{ fontFamily: "'NanumSquare', sans-serif", fontSize: lang === 'en' ? 'clamp(1.6rem, 3vw, 2.6rem)' : 'clamp(1.8rem, 3.5vw, 3rem)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          >
            {t.heroLine1}
          </motion.p>
          <motion.p
            className="text-[#8B0000] font-light tracking-[0.08em] leading-relaxed mt-3"
            style={{ fontFamily: "'NanumSquare', sans-serif", fontSize: lang === 'en' ? 'clamp(1.6rem, 3vw, 2.6rem)' : 'clamp(1.8rem, 3.5vw, 3rem)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: 'easeOut' }}
          >
            {t.heroLine2}
          </motion.p>
        </div>
        <motion.div
          className="absolute bottom-12"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8B0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </section>

      {/* 섹션 2: Step 1 AI 필터링 */}
      <section
        ref={section2Ref}
        className="h-screen snap-start flex items-center justify-center px-8"
        style={{ background: 'linear-gradient(to bottom, #fdf0f0, #ffffff)' }}
      >
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="text-[#8B0000] text-sm uppercase tracking-widest mb-3 font-medium">{t.step1Label}</p>
            <p
              className="text-gray-800 text-2xl font-light leading-relaxed"
              style={{ fontFamily: "'NanumSquare', sans-serif" }}
            >
              {t.step1Text}
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-4 gap-3"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.2 }}
          >
            {Array(16).fill(null).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg bg-gray-200 flex items-center justify-center transition-all duration-[1500ms] ${
                  filterDone
                    ? filteredPhotos[i]
                      ? 'bg-gray-300 ring-2 ring-[#8B0000]/50 scale-105'
                      : 'opacity-20 scale-95'
                    : ''
                }`}
              >
                {filterDone && (
                  <span className={`text-lg ${filteredPhotos[i] ? 'text-[#8B0000]' : 'text-gray-400'}`}>
                    {filteredPhotos[i] ? '✓' : '✕'}
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 섹션 3: Step 2 마케터 설정 */}
      <section
        ref={section3Ref}
        className="h-screen snap-start flex items-center justify-center px-8"
        style={{ background: 'linear-gradient(to bottom, #ffffff, #fdf0f0)' }}
      >
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="text-[#8B0000] text-sm uppercase tracking-widest mb-3 font-medium">{t.step2Label}</p>
            <p
              className="text-gray-800 text-2xl font-light leading-relaxed"
              style={{ fontFamily: "'NanumSquare', sans-serif" }}
            >
              {t.step2Text}
            </p>
          </motion.div>
          <div className="space-y-4">
            {styleCards.map((card, i) => (
              <motion.div
                key={i}
                className={`px-6 py-5 rounded-xl border-2 transition-colors duration-500 ${
                  autoSelected === i
                    ? 'border-[#8B0000] bg-[#8B0000]/10'
                    : 'border-gray-200 bg-white'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={i < styleRevealed ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <span className={`text-lg font-medium ${autoSelected === i ? 'text-[#8B0000]' : 'text-gray-700'}`}>
                  {card[lang]}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 섹션 4: Step 3 게시물 생성 */}
      <section
        ref={section4Ref}
        className="h-screen snap-start flex items-center justify-center px-8"
        style={{ background: 'linear-gradient(to bottom, #fdf0f0, #4a0000)' }}
      >
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="text-[#8B0000] text-sm uppercase tracking-widest mb-3 font-medium">{t.step3Label}</p>
            <p
              className="text-gray-800 text-2xl font-light leading-relaxed"
              style={{ fontFamily: "'NanumSquare', sans-serif" }}
            >
              {t.step3Text}
            </p>
          </motion.div>
          <motion.div
            className="rounded-2xl border border-gray-200 overflow-hidden shadow-lg bg-white"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="aspect-video bg-gray-200" />
            <div className="p-5">
              <p className="text-sm text-gray-800 leading-relaxed min-h-[3rem]" style={{ fontFamily: "'NanumSquare', sans-serif" }}>
                {typedCaption}
                {typedCaption.length < t.step3Caption.length && (
                  <span className="animate-pulse">|</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {t.step3Hashtags.slice(0, hashtagsShown).map((tag, i) => (
                  <motion.span
                    key={i}
                    className="text-xs text-[#8B0000] font-medium"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 섹션 5: CTA */}
      <section
        className="h-screen snap-start flex flex-col items-center justify-center px-8"
        style={{ background: '#8B0000' }}
      >
        <motion.p
          className="text-white text-center font-light tracking-[0.1em] mb-16"
          style={{ fontFamily: "'NanumSquare', sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2.8rem)' }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
        >
          {t.ctaText}
        </motion.p>
        <motion.div
          className="flex items-center gap-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <button
            onClick={() => router.push('/')}
            className="bg-white text-[#8B0000] text-lg font-medium rounded-lg px-10 py-4 hover:bg-white/90 transition-colors"
          >
            {t.ctaBtn1}
          </button>
          <button
            onClick={() => section1Ref.current?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-transparent border border-white/70 text-white text-lg font-medium rounded-lg px-10 py-4 hover:bg-white/15 transition-colors"
          >
            {t.ctaBtn2}
          </button>
        </motion.div>
      </section>
    </div>
  );
}
