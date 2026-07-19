// 타겟 경로: src/app/layout.tsx
import type { Metadata } from 'next';
// 1. Next.js 내장 폰트 최적화 도구 로드 (가장 기본인 Noto Sans KR 적용)
import { Noto_Sans_KR, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { PhotoSyncProgress } from '@/components/PhotoSyncProgress';
import { TutorialTour } from '@/components/TutorialTour';
import { ToastProvider } from '@/components/Toast';

// 2. 폰트 객체 생성 및 굵기 설정
const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  title: 'BYBAEK - 바버샵 마케팅 자동화',
  description: 'AI 에이전트 기반 인스타그램 마케팅 자동화 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      {/* 3. 폰트 클래스(notoSansKr.className)를 body에 주입하고,
        하드코딩된 헥스 코드 대신 tailwind.config.ts에 정의한 시맨틱 컬러 사용 
      */}
      <body className={`${notoSansKr.className} ${notoSansKr.variable} ${cormorantGaramond.variable} bg-background text-text-primary min-h-screen flex flex-col`}>
        {/* 전역 토스트: 어디서든 useToast()로 동일한 성공/실패 피드백 */}
        <ToastProvider>
          {children}

          {/* 🚨 최상위 뼈대에 동기화 알림창 부착! (항상 모든 화면 위를 덮게 됩니다) */}
          <PhotoSyncProgress />

          {/* 🚨 튜토리얼 투어 컴포넌트 부착 */}
          <TutorialTour />
        </ToastProvider>
      </body>
    </html>
  );
}