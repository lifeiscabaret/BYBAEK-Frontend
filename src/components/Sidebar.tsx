// 타겟 경로: src/components/Sidebar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

// 🚨 1. 타입스크립트 에러 해결: 메뉴 객체의 생김새(타입)를 명확히 정의합니다.
// (? 기호를 붙이면 "이 속성은 있을 수도 있고 없을 수도 있어" 라는 뜻입니다)
interface MenuItem {
  name: string;
  path?: string;
  action?: string;
}

// 🚨 2. BASE_MENU_ITEMS가 이 규격(MenuItem)을 따른다고 선언합니다.
const BASE_MENU_ITEMS: MenuItem[] = [
  { name: '대시보드', path: '/dashboard' },
  { name: '게시글 작성', path: '/preview' },
  { name: '전체 사진', path: '/photos' },
  { name: '내 앨범', path: '/album' },
  { name: '설정', path: '/setting' },
  { name: '테스트', path: '/' },
];

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };
    
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, [pathname]);

  // 🚨 3. menuItems 배열도 이 규격을 따른다고 선언합니다.
  const menuItems: MenuItem[] = [
    ...BASE_MENU_ITEMS,
    isLoggedIn 
      ? { name: '로그아웃', action: 'LOGOUT' } 
      : { name: '로그인', path: '/login?from=sidebar' }
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.action === 'LOGOUT') {
      setIsLogoutModalOpen(true);
    } else if (item.path) {
      router.push(item.path);
    }
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isGuest');
    
    setIsLoggedIn(false);
    setIsLogoutModalOpen(false);
    
    router.push('/');
  };

  return (
    <>
      <div 
        className={`h-screen bg-sidebar py-large z-10 flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
          isCollapsed ? 'w-17.5' : 'w-55'
        }`}
      >
        {/* 헤더 영역 */}
        <div className={`flex flex-row items-center mb-xlarge px-medium ${
          isCollapsed ? 'justify-center px-0' : 'justify-between'
        }`}>
          {/* 로고 홈 버튼 (가독성 + 버건디 밑줄 애니메이션 적용) */}
          {!isCollapsed && (
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex flex-row items-center py-small focus:outline-none group hover:scale-105 origin-left transition-all duration-300"
            >
              <div className="relative w-10 h-10 transition-transform duration-300">
                <Image 
                  src="/images/logo.png" 
                  alt="BYBAEK Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              
              {/* 글자와 밑줄을 감싸는 컨테이너 */}
              <div className="relative ml-2 overflow-hidden py-1">
                {/* 글자는 하얀색(text-inverse)으로 유지해서 가독성 확보 */}
                <span className="text-h2 text-text-inverse font-bold block">
                  BYBAEK
                </span>
                {/* 핵심: 평소엔 왼쪽 밖(-100%)에 숨어있다가, 마우스를 올리면 제자리(0)로 스르륵 밀려 들어오는 버건디색 밑줄 */}
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></span>
              </div>
            </button>
          )}

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-small focus:outline-none hover:opacity-80 transition-opacity"
          >
            <span className="text-[24px] text-text-inverse leading-none">≡</span>
          </button>
        </div>

        {/* 메뉴 리스트 영역 */}
        <div className="flex-1 flex flex-col">
          {menuItems.map((item, index) => {
            // item.path가 있을 때만 pathname과 비교하도록 안전하게 처리
            const isActive = item.path ? (pathname === item.path || (pathname === '/' && item.path === '/dashboard')) : false;

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
                onClick={() => handleMenuClick(item)}
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

      {/* 로그아웃 확인 모달 (팝업) */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
          <div className="bg-white rounded-xl shadow-lg p-8 w-[360px] flex flex-col items-center">
            
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-red-500 text-2xl leading-none">!</span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">로그아웃</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              정말 로그아웃 하시겠습니까?<br />다시 이용하시려면 계정 연동이 필요합니다.
            </p>
            
            <div className="flex flex-row w-full gap-3">
              <button 
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors focus:outline-none"
              >
                아니오
              </button>
              <button 
                onClick={handleConfirmLogout}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors focus:outline-none"
              >
                예
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};