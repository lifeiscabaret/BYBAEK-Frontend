"use client";

import Link from 'next/link';

export function Footer() {
  return (
    <footer
      className="w-full text-center"
      style={{ padding: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}
    >
      <p>(주)바이백 | 대표: 이지현 | bybaek.ai@gmail.com</p>
      <p className="mt-1">
        <Link href="/terms" target="_blank" className="underline hover:text-white/60 transition-colors">이용약관</Link>
        {' | '}
        <Link href="/privacy" target="_blank" className="underline hover:text-white/60 transition-colors">개인정보처리방침</Link>
      </p>
      <p className="mt-1">&copy; 2026 BYBAEK. All rights reserved.</p>
    </footer>
  );
}
