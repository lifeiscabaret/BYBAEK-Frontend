// 타겟 경로: /src/app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // 사용자가 루트 도메인('/')으로 접속하면 즉시 로그인 페이지로 리다이렉트
  // 추후 로그인 쿠키/세션 검증 로직을 추가하여 대시보드로 분기시킬 수 있음
  redirect('/login');
}