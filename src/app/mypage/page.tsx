"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { useTranslation } from '@/hooks/useTranslation';
import apiClient from '@/api/index';

const font = { fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" };

export default function MyPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [shopId, setShopId] = useState('');
  const [msConnected, setMsConnected] = useState(false);
  const [onedriveConnected, setOnedriveConnected] = useState(false);
  const [instaConnected, setInstaConnected] = useState(false);
  const [instagramUsername, setInstagramUsername] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const storedShopId = localStorage.getItem('shop_id') || '';
    setShopId(storedShopId);
    // MS 로그인이 shop_id의 유일한 발급원 → shop_id 보유 = MS 연결됨 (localStorage 기준, 다른 페이지와 동일).
    setMsConnected(!!storedShopId);
    setOnedriveConnected(localStorage.getItem('onedrive_connected') === 'true');
    setInstaConnected(localStorage.getItem('insta_connected') === 'true');

    // /auth/me는 백엔드 upsert/refresh_token 갱신 목적으로 호출. 표시용 이름/이메일은
    // /auth/status(shop_id 기준, 폴백 취약성 없음)에서 받으므로 여기 응답에는 의존하지 않는다.
    const fetchUserInfo = async () => {
      try {
        await apiClient.get('/auth/me');
      } catch {}
    };
    fetchUserInfo();

    if (storedShopId) {
      const fetchStatus = async () => {
        try {
          const statusRes = await apiClient.get(`/auth/status/${storedShopId}`);
          if (statusRes.data) {
            setOnedriveConnected(statusRes.data.is_onedrive_connected ?? localStorage.getItem('onedrive_connected') === 'true');
            setInstaConnected(statusRes.data.is_insta_connected ?? localStorage.getItem('insta_connected') === 'true');
            // 프로필 표시: 인스타 계정명(백필 안 됐으면 null) + MS 로그인 이메일.
            setInstagramUsername(statusRes.data.instagram_username ?? null);
            if (statusRes.data.email) setUserEmail(statusRes.data.email);
          }
        } catch {
          // fallback to localStorage
          setOnedriveConnected(localStorage.getItem('onedrive_connected') === 'true');
          setInstaConnected(localStorage.getItem('insta_connected') === 'true');
        }
      };
      fetchStatus();
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!isMounted) return null;

  // 프로필 이름: 인스타 계정명 우선, 없으면(백필 안 된 샵) shop_id 폴백.
  const displayName = instagramUsername ? `@${instagramUsername}` : (shopId || '샵 이름 미설정');
  const initial = (instagramUsername || shopId || 'U').charAt(0).toUpperCase();

  return (
    <div className="flex flex-row h-screen w-full bg-[#F5F0EB] overflow-hidden">
      <Sidebar />

      <div className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-[1.6rem] text-[#1A1A1A] mb-8" style={{ ...font, fontWeight: 700 }}>{t.mypage_page.title}</h1>

        {/* ① 프로필 */}
        <div className="bg-white border border-[#f0e8e8] rounded-[16px] p-7 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-[80px] h-[80px] rounded-full bg-[#8B0000] flex items-center justify-center shrink-0">
              <span className="text-white text-[2rem] font-bold">{initial}</span>
            </div>
            <div>
              <p className="text-[1.1rem] text-[#1A1A1A] font-bold" style={font}>{displayName}</p>
              {userEmail && <p className="text-[0.85rem] text-gray-500 mt-0.5" style={font}>{userEmail}</p>}
              <p className="text-[0.85rem] text-gray-500 mt-1" style={font}>{t.mypage_page.accountInfo}</p>
            </div>
          </div>
        </div>

        {/* ② 연결 상태 */}
        <div className="bg-white border border-[#f0e8e8] rounded-[16px] p-7 mb-6">
          <p className="text-[0.95rem] text-[#1A1A1A] font-bold mb-5" style={font}>{t.mypage_page.connections}</p>
          <div className="flex flex-col gap-4">
            {/* Microsoft */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="10" height="10" fill="#F25022"/>
                  <rect x="11" y="0" width="10" height="10" fill="#7FBA00"/>
                  <rect x="0" y="11" width="10" height="10" fill="#00A4EF"/>
                  <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
                </svg>
                <span className="text-[0.9rem] text-[#1A1A1A]" style={font}>Microsoft</span>
              </div>
              {msConnected ? (
                <span className="text-[0.8rem] text-green-600 font-medium" style={font}>✓ {t.mypage_page.connected}</span>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="text-[0.8rem] text-[#8B0000] font-bold px-3 py-1.5 border border-[#8B0000] rounded-[8px] hover:bg-[rgba(139,0,0,0.06)] transition-colors cursor-pointer"
                  style={font}
                >
                  {t.mypage_page.connect}
                </button>
              )}
            </div>

            {/* OneDrive */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12.5 6L6.5 14h4v4h4v-4h4L12.5 6z" fill={onedriveConnected ? '#0078D4' : '#ccc'}/>
                  <path d="M4 16c-1.1 0-2 .7-2 1.5S2.9 19 4 19h16c1.1 0 2-.7 2-1.5S21.1 16 20 16H4z" fill={onedriveConnected ? '#0078D4' : '#ccc'} opacity="0.6"/>
                </svg>
                <span className="text-[0.9rem] text-[#1A1A1A]" style={font}>OneDrive</span>
              </div>
              {onedriveConnected ? (
                <span className="text-[0.8rem] text-green-600 font-medium" style={font}>✓ {t.mypage_page.connected}</span>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="text-[0.8rem] text-[#8B0000] font-bold px-3 py-1.5 border border-[#8B0000] rounded-[8px] hover:bg-[rgba(139,0,0,0.06)] transition-colors cursor-pointer"
                  style={font}
                >
                  {t.mypage_page.connect}
                </button>
              )}
            </div>

            {/* Instagram */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-[4px] flex items-center justify-center" style={{ background: instaConnected ? 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)' : '#ccc' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="text-[0.9rem] text-[#1A1A1A]" style={font}>Instagram</span>
              </div>
              {instaConnected ? (
                <span className="text-[0.8rem] text-green-600 font-medium" style={font}>✓ {t.mypage_page.connected}</span>
              ) : (
                <button
                  onClick={() => router.push('/dashboard/auto-upload')}
                  className="text-[0.8rem] text-[#8B0000] font-bold px-3 py-1.5 border border-[#8B0000] rounded-[8px] hover:bg-[rgba(139,0,0,0.06)] transition-colors cursor-pointer"
                  style={font}
                >
                  {t.mypage_page.connect}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ③ 로그아웃 */}
        <button
          onClick={handleLogout}
          className="text-[0.9rem] text-gray-500 hover:text-[#1A1A1A] transition-colors cursor-pointer"
          style={font}
        >
          {t.mypage_page.logout}
        </button>
      </div>
    </div>
  );
}
