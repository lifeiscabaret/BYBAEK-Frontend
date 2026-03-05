// 타겟 경로: src/app/setting/page.tsx
"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SnsConnectionModal } from '@/components/SnsConnectionModal';
import { SettingEditModal } from '@/components/SettingEditModal';
import { MockDB } from '@/utils/MockDB';
import { ONBOARDING_QUESTIONS } from '@/utils/constants/OnboardingData';
import { OnboardingSurvey } from '@/components/OnboardingSurvey';

export default function SettingScreen() {
  const [shopId] = useState('shop_12345');

  // 앱 설정 관련 (온보딩 MockDB 답변 매핑)
  const [isAutoUploadEnabled, setIsAutoUploadEnabled] = useState(
    MockDB.getAnswer(11) === '예 (추천)'
  );

  const [reviewMethod, setReviewMethod] = useState(
    (MockDB.getAnswer(12) as string) || '항상 내가 검토 후 업로드'
  );

  const [notiOffset, setNotiOffset] = useState(
    (MockDB.getAnswer(13) as string) || '30분 전'
  );

  // 🚨 새롭게 추가된 언어 설정 (ID: 14)
  const [language, setLanguage] = useState(
    (MockDB.getAnswer(14) as string) || '한국어'
  );

  // 모달 제어 상태
  const [isPromptListOpen, setIsPromptListOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [targetQuestionId, setTargetQuestionId] = useState<number>(1);
  const [isSnsModalVisible, setSnsModalVisible] = useState(false);
  const [isTimeModalVisible, setTimeModalVisible] = useState(false);
  const [isNotiModalVisible, setNotiModalVisible] = useState(false);

  // SNS 연동 상태
  const [isInstagramConnected, setIsInstagramConnected] = useState(true);
  const [isKakaoConnected, setIsKakaoConnected] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  
  const frequencies = ['매일', '2일마다', '3일마다', '4일마다', '5일마다', '6일마다', '일주일마다'];
  const notiOffsets = ['10분 전', '30분 전', '1시간 전', '받지 않음'];

  // 시스템 프롬프트 요약 (현재는 UI에서 숨김 처리됨)
  const [systemPrompt, setSystemPrompt] = useState(MockDB.generateSystemPrompt());
  
  // 업로드 설정
  const [frequency, setFrequency] = useState('매일');
  const [amPm, setAmPm] = useState('AM');
  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('30');
  
  // 모달창 임시 조작용
  const [tempFrequency, setTempFrequency] = useState(frequency);
  const [tempAmPm, setTempAmPm] = useState(amPm);
  const [tempHour, setTempHour] = useState(hour);
  const [tempMinute, setTempMinute] = useState(minute);
  
  const [isHourDropdownOpen, setIsHourDropdownOpen] = useState(false);
  const [isMinuteDropdownOpen, setIsMinuteDropdownOpen] = useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const [tempNotiOffset, setTempNotiOffset] = useState(notiOffset);
  const [isAppNotiEnabled, setIsAppNotiEnabled] = useState(
    MockDB.getAnswer(15) === '예'
  );

  const saveIndividualSetting = async (settingName: string, value: any) => {
    console.log(`[API MOCK] ${settingName} 업데이트 요청:`, value);
  };

  const handleToggleAutoUpload = (val: boolean) => {
    setIsAutoUploadEnabled(val);
    MockDB.saveAnswer(11, val ? '예 (추천)' : '아니오');
  };

  // 앱 푸시 알림 토글 핸들러
  const handleToggleAppNoti = (val: boolean) => {
    setIsAppNotiEnabled(val);
    MockDB.saveAnswer(15, val ? '예' : '아니오');
  };

  const handleToggleReviewMethod = () => {
    const nextMethod = reviewMethod === '항상 내가 검토 후 업로드' 
      ? '시간 되면 자동 업로드' 
      : '항상 내가 검토 후 업로드';
    setReviewMethod(nextMethod);
    MockDB.saveAnswer(12, nextMethod);
  };

  // 🚨 언어 변경 토글 핸들러
  const handleToggleLanguage = () => {
    const nextLang = language === '한국어' ? 'English' : '한국어';
    setLanguage(nextLang);
    MockDB.saveAnswer(14, nextLang);
    // 차후 서비스 전체 다국어(i18n) 적용 시 여기서 전역 상태나 언어팩 변경 로직을 호출하면 됩니다.
  };

  const toggleSwitch = (settingName: string, currentState: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    const newState = !currentState;
    setter(newState);
    saveIndividualSetting(settingName, newState);
  };

  const handleSnsConnection = async (
    snsName: string, 
    isConnected: boolean, 
    setConnectionState: React.Dispatch<React.SetStateAction<boolean>>, 
    authUrl: string
  ) => {
    if (isConnected) {
      setConnectionState(false);
      saveIndividualSetting(`${snsName}_connected`, false);
      window.alert(`${snsName} 연동이 해제 되었습니다.`);
    } else {
      try {
        window.open(authUrl, '_blank');
        setConnectionState(true);
        saveIndividualSetting(`${snsName}_connected`, true);
      } catch (error) {
        window.alert('오류: 해당 웹페이지를 열 수 없습니다.');
      }
    }
  };

  const CustomSwitch = ({ isOn, onToggle }: { isOn: boolean, onToggle: (val: boolean) => void }) => (
    <button
      onClick={() => onToggle(!isOn)}
      className={`w-[48px] h-[24px] rounded-full flex items-center px-1 transition-colors focus:outline-none ${
        isOn ? 'bg-accent' : 'bg-[#E0E0E0]'
      }`}
    >
      <div className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
        isOn ? 'translate-x-[22px]' : 'translate-x-0'
      }`} />
    </button>
  );

  return (
    <div className="flex flex-row h-screen w-full bg-background relative overflow-hidden">
      <Sidebar />

      <div className="flex-1 p-large flex flex-col min-w-0 h-full">
        <div className="mb-large border-b border-border pb-small shrink-0">
          <h1 className="text-[28px] text-text-primary font-bold">설정</h1>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-large min-h-0 scrollbar-hide">
          
          {/* 시스템 프롬프트 설정 */}
          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4 transition-all">
            <div className="flex flex-row justify-between items-center">
              <h2 className="text-base font-bold text-text-primary m-0">나만의 마케터</h2>
              <button 
                onClick={() => setIsPromptListOpen(!isPromptListOpen)}
                className="flex items-center text-sm font-bold text-text-primary hover:text-accent transition-colors focus:outline-none"
              >
                {isPromptListOpen ? '▲ 닫기' : '▼ 열기'}
              </button>
            </div>

            {isPromptListOpen && (
              <div className="flex flex-col gap-5 mt-4 pt-4 border-t border-[#E0E0E0]">
                {ONBOARDING_QUESTIONS.filter(q => q.category === 'PERSONAL').map((q, index) => {
                  const rawAnswer = MockDB.getAnswer(q.id);
                  const displayAnswer = rawAnswer 
                    ? (Array.isArray(rawAnswer) ? rawAnswer.join(', ') : rawAnswer)
                    : '미입력';

                  return (
                    <div key={q.id} className="flex flex-row items-center justify-between gap-4">
                      <p className="flex-[2] text-[14px] text-text-primary leading-snug">
                        {index + 1}. {q.question}
                      </p>
                      <p className="flex-[1] text-[14px] text-text-secondary font-bold text-right truncate">
                        {displayAnswer}
                      </p>
                      <button 
                        className="px-4 py-1.5 bg-background border border-[#D0D0D0] rounded-full text-[13px] font-semibold text-text-primary hover:bg-gray-50 transition-colors focus:outline-none shrink-0"
                        onClick={() => {
                          setTargetQuestionId(q.id);
                          setIsOnboardingModalOpen(true);
                        }}
                      >
                        수정
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SNS 연동 */}
          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4">
            <h2 className="text-base font-bold text-text-primary mb-4">SNS 연동</h2>
            <div className="flex flex-row justify-between items-center">
              <p className="text-sm text-[#666666]">인스타그램, 카카오톡, Gmail</p>
              <button 
                className="bg-background border border-[#D0D0D0] px-4 py-1.5 rounded-full text-[13px] text-text-primary font-semibold hover:bg-gray-50 transition-colors focus:outline-none"
                onClick={() => setSnsModalVisible(true)}
              >
                연동 설정
              </button>
            </div>
          </div>

          {/* 환경 설정 */}
          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4">
            <h2 className="text-base font-bold text-text-primary mb-4">환경 설정</h2>
            
            {/* 1. 언어 설정 */}
            <div className="flex flex-row justify-between items-center mb-4">
              <span className="text-[15px] text-text-primary">사용 언어(Language)</span>
              <div className="flex flex-row items-center">
                <span className="bg-background border border-border px-3 py-1.5 rounded-md text-sm mr-2">{language}</span>
                <button 
                  className="bg-background border border-[#D0D0D0] px-4 py-1.5 rounded-full text-[13px] text-text-primary font-semibold hover:bg-gray-50 transition-colors focus:outline-none"
                  onClick={handleToggleLanguage}
                >
                  변경
                </button>
              </div>
            </div>

            {/* 2. 인스타 자동 업로드 (이전에 있던 항목 복구) */}
            <div className="flex flex-row justify-between items-center mb-4">
              <span className="text-[15px] text-text-primary">인스타 자동 업로드</span>
              <CustomSwitch isOn={isAutoUploadEnabled} onToggle={handleToggleAutoUpload} />
            </div>

            {/* 3. 게시물 검토 방식 */}
            <div className="flex flex-row justify-between items-center mb-4">
              <span className="text-[15px] text-text-primary">게시물 검토 방식</span>
              <div className="flex flex-row items-center">
                <span className="bg-background border border-border px-3 py-1.5 rounded-md text-sm mr-2">{reviewMethod}</span>
                <button 
                  className="bg-background border border-[#D0D0D0] px-4 py-1.5 rounded-full text-[13px] text-text-primary font-semibold hover:bg-gray-50 transition-colors focus:outline-none"
                  onClick={handleToggleReviewMethod}
                >
                  변경
                </button>
              </div>
            </div>

            {/* 4. 앱 푸시 알림 (마지막 항목이라 mb-4 생략) */}
            <div className="flex flex-row justify-between items-center">
              <span className="text-[15px] text-text-primary">앱 푸시 알림</span>
              <CustomSwitch isOn={isAppNotiEnabled} onToggle={handleToggleAppNoti} />
            </div>
          </div>

          {/* 자동 업로드 설정 */}
          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4">
            <h2 className="text-base font-bold text-text-primary mb-4">자동 업로드 설정</h2>
            
            <div className="flex flex-row justify-between items-center mb-4">
              <span className="text-[15px] text-text-primary">업로드 시간</span>
              <div className="flex flex-row items-center">
                <span className="bg-background border border-border px-3 py-1.5 rounded-md text-sm mr-2">{frequency} {amPm} {hour}:{minute}</span> 
                <button 
                  className="bg-background border border-[#D0D0D0] px-4 py-1.5 rounded-full text-[13px] text-text-primary font-semibold hover:bg-gray-50 transition-colors focus:outline-none"
                  onClick={() => {
                    setTempFrequency(frequency);
                    setTempAmPm(amPm);
                    setTempHour(hour);
                    setTempMinute(minute);
                    setTimeModalVisible(true);
                  }}
                >
                  수정
                </button>
              </div>
            </div>
            
            <div className="flex flex-row justify-between items-center">
              <span className="text-[15px] text-text-primary">알림 시간</span>
              <div className="flex flex-row items-center">
                <span className="bg-background border border-border px-3 py-1.5 rounded-md text-sm mr-2">
                  {notiOffset === '받지 않음' ? '알림 없음' : `업로드 ${notiOffset}`}
                </span>
                <button 
                  className="bg-background border border-[#D0D0D0] px-4 py-1.5 rounded-full text-[13px] text-text-primary font-semibold hover:bg-gray-50 transition-colors focus:outline-none"
                  onClick={() => {
                    setTempNotiOffset(notiOffset);
                    setNotiModalVisible(true);
                  }}
                >
                  수정
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- 모달 영역 --- */}

      {/* SNS 연동 모달 */}
      <SnsConnectionModal 
        isVisible={isSnsModalVisible}
        onClose={() => setSnsModalVisible(false)}
        isInstagramConnected={isInstagramConnected}
        isKakaoConnected={isKakaoConnected}
        isGmailConnected={isGmailConnected}
        handleSnsConnection={handleSnsConnection}
        setIsInstagramConnected={setIsInstagramConnected}
        setIsKakaoConnected={setIsKakaoConnected}
        setIsGmailConnected={setIsGmailConnected}
      />

      {/* 업로드 시간 설정 모달 */}
      <SettingEditModal
        isVisible={isTimeModalVisible}
        title="업로드 스케줄 설정"
        onClose={() => setTimeModalVisible(false)}
        onSave={() => {
          setFrequency(tempFrequency);
          setAmPm(tempAmPm);
          setHour(tempHour);
          setMinute(tempMinute);
          saveIndividualSetting('schedule', { frequency: tempFrequency, time: `${tempAmPm} ${tempHour}:${tempMinute}` });
          setTimeModalVisible(false);
        }}
      >
        <p className="text-sm font-bold text-[#666666] mb-2 mt-4">시간 설정</p>
        <div className="flex flex-row flex-wrap mb-4 gap-2">
          {['AM', 'PM'].map(p => (
            <button 
              key={p} 
              className={`px-4 py-2 rounded-full border text-sm transition-colors focus:outline-none ${
                tempAmPm === p ? 'bg-accent border-accent text-white font-bold' : 'bg-[#F0F0F0] border-border text-text-primary'
              }`}
              onClick={() => setTempAmPm(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex flex-row relative z-50 mb-6 gap-4">
          {/* 시(Hour) 드롭다운 */}
          <div className="relative w-[140px]">
            <button 
              className="w-full flex justify-between items-center bg-background border border-border rounded-lg px-4 py-3 text-[15px] focus:outline-none"
              onClick={() => {
                setIsHourDropdownOpen(!isHourDropdownOpen);
                setIsMinuteDropdownOpen(false);
              }}
            >
              <span>{tempHour} 시</span>
              <span className="text-[12px] text-[#888888]">▼</span>
            </button>
            {isHourDropdownOpen && (
              <div className="absolute top-[110%] left-0 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                {hours.map(h => (
                  <button 
                    key={`hour-${h}`} 
                    className="w-full text-left px-4 py-3 border-b border-[#F0F0F0] text-sm hover:bg-gray-50 focus:outline-none"
                    onClick={() => { setTempHour(h); setIsHourDropdownOpen(false); }}
                  >
                    {h} 시
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 분(Minute) 드롭다운 */}
          <div className="relative w-[140px]">
            <button 
              className="w-full flex justify-between items-center bg-background border border-border rounded-lg px-4 py-3 text-[15px] focus:outline-none"
              onClick={() => {
                setIsMinuteDropdownOpen(!isMinuteDropdownOpen);
                setIsHourDropdownOpen(false);
              }}
            >
              <span>{tempMinute} 분</span>
              <span className="text-[12px] text-[#888888]">▼</span>
            </button>
            {isMinuteDropdownOpen && (
              <div className="absolute top-[110%] left-0 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                {minutes.map(m => (
                  <button 
                    key={`min-${m}`} 
                    className="w-full text-left px-4 py-3 border-b border-[#F0F0F0] text-sm hover:bg-gray-50 focus:outline-none"
                    onClick={() => { setTempMinute(m); setIsMinuteDropdownOpen(false); }}
                  >
                    {m} 분
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-sm font-bold text-[#666666] mb-2">업로드 빈도</p>
        <div className="flex flex-row flex-wrap gap-2">
          {frequencies.map(f => (
            <button 
              key={f} 
              className={`px-4 py-2 rounded-full border text-sm transition-colors focus:outline-none ${
                tempFrequency === f ? 'bg-accent border-accent text-white font-bold' : 'bg-[#F0F0F0] border-border text-text-primary'
              }`}
              onClick={() => setTempFrequency(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </SettingEditModal>

      {/* 알림 시간 설정 모달 */}
      <SettingEditModal
        isVisible={isNotiModalVisible}
        title="알림 시간 설정"
        onClose={() => setNotiModalVisible(false)}
        onSave={() => {
          setNotiOffset(tempNotiOffset);
          MockDB.saveAnswer(13, tempNotiOffset); 
          setNotiModalVisible(false);
        }}
      >
        <div className="flex flex-row flex-wrap gap-2 mt-4">
          {notiOffsets.map(o => (
            <button 
              key={o} 
              className={`px-4 py-2 rounded-full border text-sm transition-colors focus:outline-none ${
                tempNotiOffset === o ? 'bg-accent border-accent text-white font-bold' : 'bg-[#F0F0F0] border-border text-text-primary'
              }`}
              onClick={() => setTempNotiOffset(o)}
            >
              {o}
            </button>
          ))}
        </div>
      </SettingEditModal>

      {/* 온보딩(시스템 프롬프트 수정) 모달 */}
      {isOnboardingModalOpen && (
        <OnboardingSurvey 
          initialQuestionId={targetQuestionId} 
          onFinish={() => {
            setIsOnboardingModalOpen(false);
            setSystemPrompt(MockDB.generateSystemPrompt());
          }}
          onSkip={() => setIsOnboardingModalOpen(false)}
        />
      )}
    </div>  
  );
}