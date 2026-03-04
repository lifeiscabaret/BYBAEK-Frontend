// 타겟 경로: src/components/SnsConnectionModal.tsx
"use client";

import React from 'react';
import { SettingEditModal } from './SettingEditModal';

interface SnsConnectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  isInstagramConnected: boolean;
  isKakaoConnected: boolean;
  isGmailConnected: boolean;
  handleSnsConnection: (
    snsName: string, 
    isConnected: boolean, 
    setConnectionState: React.Dispatch<React.SetStateAction<boolean>>, 
    authUrl: string
  ) => void;
  setIsInstagramConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsKakaoConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setIsGmailConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SnsConnectionModal: React.FC<SnsConnectionModalProps> = ({
  isVisible,
  onClose,
  isInstagramConnected,
  isKakaoConnected,
  isGmailConnected,
  handleSnsConnection,
  setIsInstagramConnected,
  setIsKakaoConnected,
  setIsGmailConnected
}) => {
  return (
    // 앞서 만든 공통 모달 컨테이너 사용
    <SettingEditModal
      isVisible={isVisible}
      title="SNS 연동 설정"
      onClose={onClose}
      // SNS는 토글 시 즉시 상태가 반영되므로, 하단 '저장' 버튼은 창을 닫는 용도로 동일하게 연결
      onSave={onClose} 
    >
      <div className="py-2">
        
        {/* 인스타그램 연동 영역 */}
        <div className="flex flex-row justify-between items-center mb-5">
          <span className="text-[15px] text-text-primary">인스타그램</span>
          <button 
            onClick={() => handleSnsConnection('인스타그램', isInstagramConnected, setIsInstagramConnected, 'https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1219138883682659&redirect_uri=https://bybaek.azurewebsites.net/api/instagram_business_login&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors focus:outline-none ${
              isInstagramConnected 
                ? 'bg-background border border-text-primary text-text-primary hover:bg-gray-50' // 연동 완료 상태 (아웃라인 버튼)
                : 'bg-accent text-white hover:bg-accent-dark' // 미연동 상태 (포인트 컬러 버튼)
            }`}
          >
            {isInstagramConnected ? '연동 해제' : '연동 하기'}
          </button>
        </div>

        {/* 카카오톡 연동 영역 */}
        <div className="flex flex-row justify-between items-center mb-5">
          <span className="text-[15px] text-text-primary">카카오톡</span>
          <button 
            onClick={() => handleSnsConnection('카카오톡', isKakaoConnected, setIsKakaoConnected, 'https://accounts.kakao.com/login')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors focus:outline-none ${
              isKakaoConnected 
                ? 'bg-background border border-text-primary text-text-primary hover:bg-gray-50' 
                : 'bg-accent text-white hover:bg-accent-dark'
            }`}
          >
            {isKakaoConnected ? '연동 해제' : '연동 하기'}
          </button>
        </div>

        {/* Gmail 연동 영역 */}
        <div className="flex flex-row justify-between items-center">
          <span className="text-[15px] text-text-primary">Gmail</span>
          <button 
            onClick={() => handleSnsConnection('Gmail', isGmailConnected, setIsGmailConnected, 'https://accounts.google.com/signin')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors focus:outline-none ${
              isGmailConnected 
                ? 'bg-background border border-text-primary text-text-primary hover:bg-gray-50' 
                : 'bg-accent text-white hover:bg-accent-dark'
            }`}
          >
            {isGmailConnected ? '연동 해제' : '연동 하기'}
          </button>
        </div>
        
      </div>
    </SettingEditModal>
  );
};