// 타겟 경로: src/app/layout.tsx
import type { Metadata } from 'next';
// 1. Next.js 내장 폰트 최적화 도구 로드 (가장 기본인 Noto Sans KR 적용)
import { Noto_Sans_KR } from 'next/font/google'; 
import './globals.css';

// 2. 폰트 객체 생성 및 굵기 설정
const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'], // 웹 폰트 서브셋 설정
  weight: ['300', '400', '500', '700'], // 프로젝트에서 사용할 굵기 지정
  display: 'swap', // 폰트 로딩 최적화
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
      <body className={`${notoSansKr.className} bg-background text-text-primary min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}