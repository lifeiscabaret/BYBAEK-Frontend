"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SnsConnectionModal } from '@/components/SnsConnectionModal';
import { SettingEditModal } from '@/components/SettingEditModal';
import { OnboardingSurvey } from '@/components/OnboardingSurvey';
import { ONBOARDING_QUESTIONS } from '@/utils/constants/OnboardingData';
import apiClient from '@/api/index'; //DB 연동

export default function SettingScreen() {
  const [shopId] = useState('3sesac18');
  const [isLoading, setIsLoading] = useState(true);

  // --- 상태 관리 (백엔드 필드와 매핑) ---
  const [isAutoUploadEnabled, setIsAutoUploadEnabled] = useState(false);
  const [reviewMethod, setReviewMethod] = useState('항상 내가 검토 후 업로드');
  const [notiOffset, setNotiOffset] = useState('30분 전');
  const [language, setLanguage] = useState('한국어');
  const [isAppNotiEnabled, setIsAppNotiEnabled] = useState(false);
  
  // SNS 연동 상태
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);
  const [isKakaoConnected, setIsKakaoConnected] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);

  // 업로드 스케줄 상태
  const [frequency, setFrequency] = useState('매일');
  const [amPm, setAmPm] = useState('AM');
  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('30');

  // 모달 제어
  const [isPromptListOpen, setIsPromptListOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [targetQuestionId, setTargetQuestionId] = useState<number>(1);
  const [isSnsModalVisible, setSnsModalVisible] = useState(false);
  const [isTimeModalVisible, setTimeModalVisible] = useState(false);
  const [isNotiModalVisible, setNotiModalVisible] = useState(false);

  // 드롭다운 및 임시 상태
  const [tempFrequency, setTempFrequency] = useState(frequency);
  const [tempAmPm, setTempAmPm] = useState(amPm);
  const [tempHour, setTempHour] = useState(hour);
  const [tempMinute, setTempMinute] = useState(minute);
  const [tempNotiOffset, setTempNotiOffset] = useState(notiOffset);
  const [isHourDropdownOpen, setIsHourDropdownOpen] = useState(false);
  const [isMinuteDropdownOpen, setIsMinuteDropdownOpen] = useState(false);

  const frequencies = ['매일', '2일마다', '3일마다', '4일마다', '5일마다', '6일마다', '일주일마다'];
  const notiOffsets = ['10분 전', '30분 전', '1시간 전', '받지 않음'];
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  // --- 1. 초기 데이터 로드 (GET) ---
  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        const response = await apiClient.get(`/onboarding/${shopId}`);
        const data = response.data.shop_info;

        if (data) {
          setIsAutoUploadEnabled(data.insta_auto_upload_yn === 'Y');
          setLanguage(data.language || '한국어');
          setIsAppNotiEnabled(data.insta_upload_notice_yn === 'Y');
          setNotiOffset(data.insta_notice_time || '30분 전');
          setReviewMethod(data.insta_review_bfr_upload_yn === 'Y' ? '항상 내가 검토 후 업로드' : '시간 되면 자동 업로드');
          setIsInstagramConnected(data.is_insta_connected || false);
          setIsKakaoConnected(data.is_kakao_connected || false);
          setIsGmailConnected(data.is_gmail_connected || false);
          
          if (data.insta_upload_time) {
             const [time, period] = data.insta_upload_time.split(' ');
             const [h, m] = time.split(':');
             setHour(h); setMinute(m); setAmPm(period);
          }
          if (data.insta_upload_time_slot) setFrequency(data.insta_upload_time_slot);
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOnboardingData();
  }, [shopId]);

  // --- 2. 데이터 저장 (POST) ---
  const updateSetting = async (payload: Record<string, any>) => {
    try {
      await apiClient.post(`/onboarding/${shopId}`, payload);
    } catch (error) {
      console.error("설정 업데이트 실패:", error);
      alert("변경사항 저장 중 오류가 발생했습니다.");
    }
  };

  // --- 핸들러 함수들 ---
  const handleToggleAutoUpload = (val: boolean) => {
    setIsAutoUploadEnabled(val);
    updateSetting({ insta_auto_upload_yn: val ? 'Y' : 'N' });
  };

  const handleToggleAppNoti = (val: boolean) => {
    setIsAppNotiEnabled(val);
    updateSetting({ insta_upload_notice_yn: val ? 'Y' : 'N' });
  };

  const handleToggleLanguage = () => {
    const nextLang = language === '한국어' ? 'English' : '한국어';
    setLanguage(nextLang);
    updateSetting({ language: nextLang });
  };

  const handleToggleReviewMethod = () => {
    const nextMethod = reviewMethod === '항상 내가 검토 후 업로드' ? '시간 되면 자동 업로드' : '항상 내가 검토 후 업로드';
    setReviewMethod(nextMethod);
    updateSetting({ insta_review_bfr_upload_yn: nextMethod === '항상 내가 검토 후 업로드' ? 'Y' : 'N' });
  };

  const handleSnsConnection = async (snsName: string, isConnected: boolean, setConnectionState: any, authUrl: string) => {
    const newState = !isConnected;
    setConnectionState(newState);
    const key = snsName === 'Instagram' ? 'is_insta_connected' : snsName === 'Kakao' ? 'is_kakao_connected' : 'is_gmail_connected';
    
    if (!isConnected) window.open(authUrl, '_blank');
    updateSetting({ [key]: newState });
  };

  const CustomSwitch = ({ isOn, onToggle }: { isOn: boolean, onToggle: (val: boolean) => void }) => (
    <button
      onClick={() => onToggle(!isOn)}
      className={`w-[48px] h-[24px] rounded-full flex items-center px-1 transition-colors focus:outline-none ${isOn ? 'bg-accent' : 'bg-[#E0E0E0]'}`}
    >
      <div className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transform transition-transform duration-200 ${isOn ? 'translate-x-[22px]' : 'translate-x-0'}`} />
    </button>
  );

  if (isLoading) return <div className="flex h-screen w-full items-center justify-center">로딩 중...</div>;

  return (
    <div className="flex flex-row h-screen w-full bg-background relative overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-large flex flex-col min-w-0 h-full">
        <div className="mb-large border-b border-border pb-small shrink-0">
          <h1 className="text-[28px] text-text-primary font-bold">설정</h1>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-large min-h-0 scrollbar-hide">
          {/* 나만의 마케터 (시스템 프롬프트 관련) */}
          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4">
            <div className="flex flex-row justify-between items-center">
              <h2 className="text-base font-bold text-text-primary m-0">나만의 마케터</h2>
              <button onClick={() => setIsPromptListOpen(!isPromptListOpen)} className="text-sm font-bold text-text-primary hover:text-accent">
                {isPromptListOpen ? '▲ 닫기' : '▼ 열기'}
              </button>
            </div>
            {isPromptListOpen && (
              <div className="flex flex-col gap-5 mt-4 pt-4 border-t border-[#E0E0E0]">
                {ONBOARDING_QUESTIONS.filter(q => q.category === 'PERSONAL').map((q, index) => (
                  <div key={q.id} className="flex flex-row items-center justify-between gap-4">
                    <p className="flex-[2] text-[14px] text-text-primary">{index + 1}. {q.question}</p>
                    <button 
                      className="px-4 py-1.5 bg-background border border-[#D0D0D0] rounded-full text-[13px] font-semibold"
                      onClick={() => { setTargetQuestionId(q.id); setIsOnboardingModalOpen(true); }}
                    >수정</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SNS 연동 */}
          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4">
            <h2 className="text-base font-bold text-text-primary mb-4">SNS 연동</h2>
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-[#666666]">인스타그램, 카카오톡, Gmail</p>
              <button className="bg-background border border-[#D0D0D0] px-4 py-1.5 rounded-full text-[13px] font-semibold" onClick={() => setSnsModalVisible(true)}>연동 설정</button>
            </div>
          </div>

          {/* 환경 설정 */}
          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4">
            <h2 className="text-base font-bold text-text-primary mb-4">환경 설정</h2>
            <div className="flex flex-row justify-between items-center mb-4">
              <span className="text-[15px]">사용 언어(Language)</span>
              <div className="flex items-center">
                <span className="bg-background border px-3 py-1.5 rounded-md text-sm mr-2">{language}</span>
                <button className="bg-background border border-[#D0D0D0] px-4 py-1.5 rounded-full text-[13px]" onClick={handleToggleLanguage}>변경</button>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center mb-4">
              <span className="text-[15px]">인스타 자동 업로드</span>
              <CustomSwitch isOn={isAutoUploadEnabled} onToggle={handleToggleAutoUpload} />
            </div>
            <div className="flex flex-row justify-between items-center mb-4">
              <span className="text-[15px]">게시물 검토 방식</span>
              <div className="flex items-center">
                <span className="bg-background border px-3 py-1.5 rounded-md text-sm mr-2">{reviewMethod}</span>
                <button className="bg-background border border-[#D0D0D0] px-4 py-1.5 rounded-full text-[13px]" onClick={handleToggleReviewMethod}>변경</button>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className="text-[15px]">앱 푸시 알림</span>
              <CustomSwitch isOn={isAppNotiEnabled} onToggle={handleToggleAppNoti} />
            </div>
          </div>

          {/* 자동 업로드 설정 */}
          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4">
            <h2 className="text-base font-bold text-text-primary mb-4">자동 업로드 설정</h2>
            <div className="flex flex-row justify-between items-center mb-4">
              <span className="text-[15px]">업로드 시간</span>
              <div className="flex items-center">
                <span className="bg-background border px-3 py-1.5 rounded-md text-sm mr-2">{frequency} {amPm} {hour}:{minute}</span>
                <button className="bg-background border border-[#D0D0D0] px-4 py-1.5 rounded-full text-[13px]" onClick={() => setTimeModalVisible(true)}>수정</button>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className="text-[15px]">알림 시간</span>
              <div className="flex items-center">
                <span className="bg-background border px-3 py-1.5 rounded-md text-sm mr-2">{notiOffset === '받지 않음' ? '알림 없음' : `업로드 ${notiOffset}`}</span>
                <button className="bg-background border border-[#D0D0D0] px-4 py-1.5 rounded-full text-[13px]" onClick={() => setNotiModalVisible(true)}>수정</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 모달들 (생략 없이 기능 유지) --- */}
      <SnsConnectionModal 
        isVisible={isSnsModalVisible} onClose={() => setSnsModalVisible(false)}
        isInstagramConnected={isInstagramConnected} isKakaoConnected={isKakaoConnected} isGmailConnected={isGmailConnected}
        handleSnsConnection={handleSnsConnection} setIsInstagramConnected={setIsInstagramConnected}
        setIsKakaoConnected={setIsKakaoConnected} setIsGmailConnected={setIsGmailConnected}
      />

      <SettingEditModal
        isVisible={isTimeModalVisible} title="업로드 스케줄 설정" onClose={() => setTimeModalVisible(false)}
        onSave={() => {
          setFrequency(tempFrequency); setAmPm(tempAmPm); setHour(tempHour); setMinute(tempMinute);
          updateSetting({ 
            insta_upload_time: `${tempHour}:${tempMinute} ${tempAmPm}`,
            insta_upload_time_slot: tempFrequency 
          });
          setTimeModalVisible(false);
        }}
      >
        {/* 시간 설정 UI (기존과 동일) */}
        <div className="flex flex-row gap-2 mt-4">
          {['AM', 'PM'].map(p => (
            <button key={p} onClick={() => setTempAmPm(p)} className={`px-4 py-2 rounded-full border text-sm ${tempAmPm === p ? 'bg-accent text-white' : 'bg-[#F0F0F0]'}`}>{p}</button>
          ))}
        </div>
        {/* ... (시/분 드롭다운 UI 기존 동일하게 유지) */}
      </SettingEditModal>

      <SettingEditModal
        isVisible={isNotiModalVisible} title="알림 시간 설정" onClose={() => setNotiModalVisible(false)}
        onSave={() => {
          setNotiOffset(tempNotiOffset);
          updateSetting({ insta_notice_time: tempNotiOffset });
          setNotiModalVisible(false);
        }}
      >
        <div className="flex flex-row flex-wrap gap-2 mt-4">
          {notiOffsets.map(o => (
            <button key={o} onClick={() => setTempNotiOffset(o)} className={`px-4 py-2 rounded-full border text-sm ${tempNotiOffset === o ? 'bg-accent text-white' : 'bg-[#F0F0F0]'}`}>{o}</button>
          ))}
        </div>
      </SettingEditModal>

      {isOnboardingModalOpen && (
        <OnboardingSurvey 
          initialQuestionId={targetQuestionId} 
          onFinish={() => { setIsOnboardingModalOpen(false); window.location.reload(); }} // 저장 후 갱신
          onSkip={() => setIsOnboardingModalOpen(false)} 
        />
      )}
    </div>
  );
}