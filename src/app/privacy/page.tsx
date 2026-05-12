"use client";

import Link from 'next/link';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#1a0a0a] text-white flex flex-col">
      <header className="flex items-center gap-3 px-8 py-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/BYBAEK_icon.svg" alt="BYBAEK" className="w-8 h-8 object-contain" />
          <span className="text-white text-xl tracking-[0.15em] font-thin">BYBAEK</span>
        </Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-8 py-12 w-full">
        <h1 className="text-2xl font-bold mb-8">개인정보처리방침</h1>

        <section className="space-y-6 text-sm leading-relaxed text-white/80">
          <div>
            <h2 className="text-base font-semibold text-white mb-2">1. 수집하는 개인정보 항목</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Microsoft OAuth: 이름, 이메일, 고유 식별자(UID)</li>
              <li>Instagram Graph API: 인스타그램 비즈니스 계정 ID, 액세스 토큰</li>
              <li>시술 사진: OneDrive에서 동기화된 이미지 파일</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white mb-2">2. 수집 목적</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>서비스 제공: 사용자 인증, 인스타그램 게시물 업로드</li>
              <li>AI 게시물 생성: 사용자 맞춤형 캡션 및 해시태그 생성</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white mb-2">3. 보유 및 이용 기간</h2>
            <p>수집된 개인정보는 회원 탈퇴 시까지 보유하며, 탈퇴 즉시 지체 없이 파기합니다.</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white mb-2">4. 제3자 제공</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Microsoft Azure: 인증 처리 및 데이터 저장</li>
              <li>Instagram (Meta): 게시물 업로드를 위한 API 연동</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white mb-2">5. 데이터 저장 위치</h2>
            <p>모든 데이터는 Microsoft Azure Korea Central 리전에 저장됩니다.</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white mb-2">6. 개인정보 보호책임자</h2>
            <p>성명: 이지현</p>
            <p>이메일: bybaek.ai@gmail.com</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
