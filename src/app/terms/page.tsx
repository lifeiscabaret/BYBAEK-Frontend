"use client";

import Link from 'next/link';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#1a0a0a] text-white flex flex-col">
      <header className="flex items-center gap-3 px-8 py-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/BYBAEK_icon.svg" alt="BYBAEK" className="w-8 h-8 object-contain" />
          <span className="text-white text-xl tracking-[0.15em] font-thin">BYBAEK</span>
        </Link>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-8 py-12 w-full">
        <h1 className="text-2xl font-bold mb-8">이용약관</h1>

        <section className="space-y-6 text-sm leading-relaxed text-white/80">
          <div>
            <h2 className="text-base font-semibold text-white mb-2">제1조 (서비스 제공자)</h2>
            <p>본 서비스는 (주)바이백(대표: 이지현)이 제공합니다.</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white mb-2">제2조 (서비스 내용)</h2>
            <p>BYBAEK은 AI 기반 바버샵 인스타그램 마케팅 자동화 서비스입니다. 사용자가 요청한 스타일에 맞춰 AI가 캡션 및 해시태그를 생성하고, OneDrive에 저장된 시술 사진을 선택하여 인스타그램에 게시물을 자동 업로드합니다.</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white mb-2">제3조 (AI 생성 콘텐츠의 저작권)</h2>
            <p>AI가 생성한 게시물(캡션, 해시태그 등)의 저작권은 해당 게시물을 요청한 사용자에게 귀속됩니다.</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white mb-2">제4조 (인스타그램 자동 업로드)</h2>
            <p>사용자는 본 서비스가 연동된 인스타그램 비즈니스 계정에 게시물을 자동 업로드하는 것에 동의합니다. 자동 업로드 여부는 설정에서 변경할 수 있으며, 업로드 전 검토 기능을 활성화할 수 있습니다.</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white mb-2">제5조 (OneDrive 사진 접근)</h2>
            <p>사용자는 본 서비스가 Microsoft OneDrive에 저장된 사진에 접근하여 게시물 후보 이미지로 활용하는 것에 동의합니다. 접근 범위는 사용자가 지정한 폴더에 한정됩니다.</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white mb-2">제6조 (면책 조항)</h2>
            <p>회사는 AI가 생성한 콘텐츠의 정확성, 적절성을 보장하지 않으며, 게시물 업로드로 인해 발생하는 제3자와의 분쟁에 대해 책임지지 않습니다. 인스타그램 및 Microsoft의 서비스 정책 변경으로 인한 기능 제한에 대해 회사는 책임을 지지 않습니다.</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-white mb-2">제7조 (준거법 및 관할법원)</h2>
            <p>본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용과 관련한 분쟁은 대한민국 법원을 관할법원으로 합니다.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
