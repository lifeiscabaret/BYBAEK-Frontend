// 타겟 경로: src/components/CustomButton.tsx
"use client";

import React, { useState } from 'react';

// 버튼 Props 타입 정의 (웹 표준에 맞게 변경)
interface CustomButtonProps {
  title: string;
  onClick: () => void | Promise<void>; // 비동기 핸들러 허용 (자동 로딩)
  variant?: 'primary' | 'outline';
  className?: string; // Tailwind 클래스 문자열 주입 허용
  loading?: boolean; // 제어형 로딩. 주면 자동 로딩보다 우선.
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset'; // 기본 'button' (폼 오작동 방지)
  loadingText?: string; // 기본 "저장 중..."
  icon?: React.ReactNode; // 선택 아이콘 (로딩 중엔 스피너로 대체)
  style?: React.CSSProperties; // 폰트 등 페이지별 인라인 스타일 주입 허용
}

const Spinner = () => (
  <svg
    className="animate-spin"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onClick,
  variant = 'primary',
  className = '',
  loading,
  disabled = false,
  type = 'button',
  loadingText = '저장 중...',
  icon,
  style,
}) => {
  const isPrimary = variant === 'primary';
  const [autoLoading, setAutoLoading] = useState(false);

  // 제어형(loading prop)이 있으면 그것을 쓰고, 없으면 async onClick을 감지해 자동 관리.
  const isLoading = loading !== undefined ? loading : autoLoading;
  const isDisabled = disabled || isLoading;

  const handleClick = async () => {
    if (isDisabled) return;
    const result = onClick();
    // 제어형이 아닐 때만 Promise 완료까지 내부 로딩 on/off.
    if (loading === undefined && result instanceof Promise) {
      setAutoLoading(true);
      try {
        await result;
      } finally {
        setAutoLoading(false);
      }
    }
  };

  // 공통 기반 스타일 (패딩, 라운드, 정렬, 트랜지션, 클릭 시 살짝 작아지는 효과)
  const baseClasses =
    'py-[12px] px-large rounded-lg flex items-center justify-center gap-2 text-button transition-all focus:outline-none active:scale-[0.98]';

  // Primary (버건디 배경) / Outline (테두리)
  const primaryClasses = 'bg-accent text-text-inverse font-bold hover:bg-accent-dark shadow-sm';
  const outlineClasses =
    'bg-transparent border border-text-primary text-text-primary font-medium hover:bg-gray-50';

  // 비활성/로딩 시 시각 표현 (호버 무력화 + 살짝 흐리게 + 커서 변경)
  const disabledClasses = isDisabled
    ? 'opacity-60 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={isLoading}
      style={style}
      className={`${baseClasses} ${isPrimary ? primaryClasses : outlineClasses} ${disabledClasses} ${className}`}
    >
      {isLoading ? (
        <>
          <Spinner />
          {loadingText}
        </>
      ) : (
        <>
          {icon}
          {title}
        </>
      )}
    </button>
  );
};
