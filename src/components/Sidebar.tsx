// 타겟 경로: src/components/Sidebar.tsx
"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

// URL 경로 매핑을 위한 확장된 메뉴 배열
const MENU_ITEMS = [
  { name: '대시보드', path: '/dashboard' },
  { name: '게시글 작성', path: '/preview' },
  { name: '전체 사진', path: '/photos' },
  { name: '내 앨범', path: '/album' },
  { name: '설정', path: '/setting' },
  { name: '로그인', path: '/login' },
];

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    // Container: LayoutAnimation 대신 Tailwind transition-all 사용
    <div 
      className={`h-screen bg-sidebar py-large z-10 flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
        isCollapsed ? 'w-[70px]' : 'w-[220px]'
      }`}
    >
      {/* 헤더 영역 (로고 및 햄버거 버튼) */}
      <div className={`flex flex-row items-center mb-xlarge px-medium ${
        isCollapsed ? 'justify-center px-0' : 'justify-between'
      }`}>
        
        {/* 펼쳐졌을 때만 보이는 로고 영역 */}
        {!isCollapsed && (
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex flex-row items-center py-small focus:outline-none hover:opacity-80 transition-opacity"
          >
            <div className="relative w-[40px] h-[40px]">
              <Image 
                src="/images/logo.png" 
                alt="BYBAEK Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <span className="text-h2 text-text-inverse font-bold ml-2">BYBAEK</span>
          </button>
        )}

        {/* 햄버거 버튼 */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-small focus:outline-none hover:opacity-80 transition-opacity"
        >
          <span className="text-[24px] text-text-inverse leading-none">≡</span>
        </button>
      </div>

      {/* 메뉴 리스트 영역 */}
      <div className="flex-1 flex flex-col">
        {MENU_ITEMS.map((item, index) => {
          // 현재 URL 경로가 메뉴의 path를 포함하고 있는지 확인 (단, 루트 경로는 대시보드와 매칭)
          const isActive = pathname === item.path || (pathname === '/' && item.path === '/dashboard');

          // RN 스타일 배열의 우선순위를 Tailwind로 정확히 분기
          // base: py-[14px] mb-small flex transition-colors focus:outline-none
          // expanded + active: bg-accent rounded-r-[20px] mr-medium px-medium
          // expanded + inactive: px-medium hover:bg-gray-800
          // collapsed + active: bg-accent rounded-lg mx-small justify-center items-center
          // collapsed + inactive: rounded-lg mx-small justify-center items-center hover:bg-gray-800
          
          let itemClasses = "py-[14px] mb-small flex transition-colors focus:outline-none ";
          let textClasses = "font-semibold ";

          if (isCollapsed) {
            itemClasses += "mx-small rounded-lg justify-center items-center px-0 ";
            itemClasses += isActive ? "bg-accent " : "hover:bg-gray-800 ";
            textClasses += "text-[20px] text-center ";
            textClasses += isActive ? "text-text-inverse" : "text-text-secondary";
          } else {
            itemClasses += "px-medium mr-medium flex-row items-center ";
            itemClasses += isActive ? "bg-accent rounded-r-[20px] " : "hover:bg-gray-800 rounded-r-[20px] ";
            textClasses += "text-body ";
            textClasses += isActive ? "text-text-inverse" : "text-text-secondary";
          }

          return (
            <button
              key={index}
              onClick={() => router.push(item.path)}
              className={itemClasses}
              title={isCollapsed ? item.name : undefined}
            >
              <span className={textClasses}>
                {isActive ? '✧✧ ' : '✧ '}
                {!isCollapsed && item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};