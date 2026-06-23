"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import apiClient from '@/api/index';

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { t, lang } = useTranslation();

  const MAIN_MENU = [
    { name: t.sidebar_new.posts, path: '/dashboard/posts' },
    { name: t.sidebar_new.photos, path: '/photos' },
    { name: t.sidebar_new.aiUpload, path: '/dashboard/ai-upload' },
    { name: t.sidebar_new.autoUpload, path: '/dashboard/auto-upload' },
    { name: t.sidebar_new.analytics, path: '/dashboard/analytics' },
  ];

  const BOTTOM_MENU = [
    { name: t.sidebar_new.mypage, path: '/mypage' },
    { name: t.sidebar_new.settings, path: '/dashboard/settings' },
  ];

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const mainRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navRef = useRef<HTMLElement>(null);
  const [indicatorY, setIndicatorY] = useState(0);
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const [pressedPath, setPressedPath] = useState<string | null>(null);

  const updateIndicator = useCallback(() => {
    const activeIndex = MAIN_MENU.findIndex(item => isActive(item.path));
    if (activeIndex === -1 || !navRef.current) {
      setIndicatorVisible(false);
      return;
    }
    const btn = mainRefs.current[activeIndex];
    if (!btn || !navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setIndicatorY(btnRect.top - navRect.top + (btnRect.height - 32) / 2);
    setIndicatorVisible(true);
  }, [pathname]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  const handleClick = (path: string) => {
    setPressedPath(path);
    setTimeout(() => setPressedPath(null), 100);
    router.push(path);
  };

  return (
    <div
      className="h-screen w-[220px] shrink-0 flex flex-col"
      style={{ backgroundColor: '#780000' }}
    >
      {/* BYBAEK 워드마크 */}
      <div style={{ paddingTop: 36, paddingLeft: 32 }}>
        <button
          onClick={() => router.push('/dashboard/posts')}
          className="cursor-pointer focus:outline-none"
        >
          <span
            className="text-[1.5rem] text-white tracking-[0.2em]"
            style={{ fontFamily: "'S-Core Dream', sans-serif", fontWeight: 100 }}
          >
            BYBAEK
          </span>
        </button>
      </div>

      {/* 중간 메뉴 */}
      <nav ref={navRef} className="relative flex flex-col gap-2 mt-12 px-3">
        {/* Sliding Indicator */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: indicatorY,
            width: 3,
            height: 32,
            borderRadius: 2,
            backgroundColor: 'white',
            transform: `translateY(0px)`,
            transition: 'top 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: indicatorVisible ? 1 : 0,
          }}
        />

        {MAIN_MENU.map((item, idx) => (
          <button
            key={item.path}
            ref={el => { mainRefs.current[idx] = el; }}
            onClick={() => handleClick(item.path)}
            className={`relative text-left text-[1rem] text-white font-bold cursor-pointer ${isActive(item.path) ? 'opacity-100' : 'opacity-75'}`}
            style={{
              fontFamily: "'S-Core Dream', sans-serif",
              fontWeight: 700,
              padding: '16px 29px',
              borderRadius: 10,
              transition: 'all 0.15s ease, transform 0.1s ease',
              transform: pressedPath === item.path ? 'scale(0.97)' : 'scale(1)',
              ...(isActive(item.path)
                ? {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }
                : {
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                  }),
            }}
            onMouseEnter={e => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderRadius = '10px';
              }
            }}
            onMouseLeave={e => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {item.name}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      {/* 하단 메뉴 */}
      <nav
        className="flex flex-col pb-4 px-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 16 }}
      >
        {BOTTOM_MENU.map(item => (
          <button
            key={item.path}
            onClick={() => handleClick(item.path)}
            className={`relative text-left text-[0.9rem] text-white font-bold cursor-pointer ${isActive(item.path) ? 'opacity-100' : 'opacity-60'}`}
            style={{
              fontFamily: "'S-Core Dream', sans-serif",
              fontWeight: 700,
              padding: '10px 29px',
              borderRadius: 10,
              transition: 'all 0.15s ease, transform 0.1s ease',
              transform: pressedPath === item.path ? 'scale(0.97)' : 'scale(1)',
              ...(isActive(item.path)
                ? {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }
                : {
                    backgroundColor: 'transparent',
                    border: '1px solid transparent',
                  }),
            }}
            onMouseEnter={e => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderRadius = '10px';
              }
            }}
            onMouseLeave={e => {
              if (!isActive(item.path)) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {item.name}
          </button>
        ))}
      </nav>

      {/* 언어 토글 */}
      <div className="px-3 pb-6 flex justify-center">
        <div className="flex items-center gap-1 text-[0.8rem] text-white" style={{ opacity: 0.7 }}>
          <button
            onClick={async () => {
              const shopId = localStorage.getItem('shop_id');
              try {
                if (shopId) {
                  await apiClient.post(`/onboarding/${shopId}`, { language: 'ko' });
                }
              } catch (e) {
                console.error('language sync failed', e);
              } finally {
                localStorage.setItem('language', 'ko');
                window.location.reload();
              }
            }}
            className={`cursor-pointer ${lang === 'ko' ? 'font-bold opacity-100' : 'font-normal opacity-70'}`}
          >
            KR
          </button>
          <span>|</span>
          <button
            onClick={async () => {
              const shopId = localStorage.getItem('shop_id');
              try {
                if (shopId) {
                  await apiClient.post(`/onboarding/${shopId}`, { language: 'en' });
                }
              } catch (e) {
                console.error('language sync failed', e);
              } finally {
                localStorage.setItem('language', 'en');
                window.location.reload();
              }
            }}
            className={`cursor-pointer ${lang === 'en' ? 'font-bold opacity-100' : 'font-normal opacity-70'}`}
          >
            EN
          </button>
        </div>
      </div>
    </div>
  );
};
