// 타겟 경로: src/app/page.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingScreen() {
  const router = useRouter();

  // 화면(로고) 클릭 시 실행되는 분기 로직
  const handleStartClick = () => {
    // 1. 로컬 스토리지에서 로그인 기록(isLoggedIn) 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    // 2. 로그인 기록이 있다면 바로 대시보드로 이동
    if (isLoggedIn === 'true') {
      router.push('/dashboard');
    } else {
      // 3. 없다면 본격적인 로그인 페이지로 이동
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <button 
        onClick={handleStartClick}
        className="flex flex-col items-center focus:outline-none hover:scale-105 transition-transform duration-300 group"
      >
        <div className="flex flex-row items-center mb-medium">
          <div className="relative w-16 h-16 mr-medium">
            <Image 
              src="/images/logo.png" 
              alt="BYBAEK 로고" 
              fill 
              className="object-contain"
            />
          </div>
          <span className="text-[64px] font-bold text-text-primary group-hover:text-accent transition-colors">BYBAEK</span>
        </div>
        <p className="text-body text-text-secondary mt-4 animate-pulse">
          화면을 클릭하여 시작하세요
        </p>
      </button>
    </div>
  );
}