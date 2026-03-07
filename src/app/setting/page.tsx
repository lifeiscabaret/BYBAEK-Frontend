// 타겟 경로: src/app/setting/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SettingEditModal } from '@/components/SettingEditModal';
import { OnboardingSurvey } from '@/components/OnboardingSurvey';
import { ONBOARDING_QUESTIONS } from '@/utils/constants/OnboardingData';
import apiClient from '@/api/index'; // DB 연동

type AuthModalType = 'NONE' | 'Microsoft' | 'Instagram' | 'Gmail';
type AuthStatus = 'IDLE' | 'IN_PROGRESS' | 'COMPLETED';

// 커스텀 알림/확인창을 위한 타입 정의
interface CustomAlertState {
  isOpen: boolean;
  message: string;
  type: 'ALERT' | 'CONFIRM';
  onConfirm?: () => void;
}

export default function SettingScreen() {
  const [shopId] = useState('3sesac18');
  const [isLoading, setIsLoading] = useState(true);

  // 1. 환경 설정 State (초기값은 비워두고 API에서 받아옵니다)
  const [isAutoUploadEnabled, setIsAutoUploadEnabled] = useState(false);
  const [language, setLanguage] = useState('한국어');
  
  // 2. 계정 연동 State
  const [isMicrosoftConnected, setIsMicrosoftConnected] = useState(false);
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [gmailAddress, setGmailAddress] = useState('');

  // 3. UI 및 모달 제어 State
  const [isPromptListOpen, setIsPromptListOpen] = useState(false);
  const [isAccountListOpen, setIsAccountListOpen] = useState(false); 
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [targetQuestionId, setTargetQuestionId] = useState<number>(1);
  const [isTimeModalVisible, setTimeModalVisible] = useState(false);
  
  const [activeAuthModal, setActiveAuthModal] = useState<AuthModalType>('NONE');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('IDLE');

  const [customAlert, setCustomAlert] = useState<CustomAlertState>({
    isOpen: false,
    message: '',
    type: 'ALERT'
  });

  // 4. 업로드 시간 설정 State
  const frequencies = ['매일', '2일마다', '3일마다', '4일마다', '5일마다', '6일마다', '일주일마다'];
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const [frequency, setFrequency] = useState('매일');
  const [amPm, setAmPm] = useState('AM');
  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('30');
  
  const [tempFrequency, setTempFrequency] = useState(frequency);
  const [tempAmPm, setTempAmPm] = useState(amPm);
  const [tempHour, setTempHour] = useState(hour);
  const [tempMinute, setTempMinute] = useState(minute);
  
  const [isHourDropdownOpen, setIsHourDropdownOpen] = useState(false);
  const [isMinuteDropdownOpen, setIsMinuteDropdownOpen] = useState(false);

  // 5. 스무고개(설문) 답변 State (MockDB 대체)
  const [surveyAnswers, setSurveyAnswers] = useState<Record<number, any>>({});

  // --- API: 데이터 저장 (POST) ---
  const updateSetting = async (payload: Record<string, any>) => {
    try {
      await apiClient.post(`/onboarding/${shopId}`, payload);
      console.log('설정 업데이트 성공:', payload);
    } catch (error) {
      console.error("설정 업데이트 실패:", error);
      setCustomAlert({
        isOpen: true,
        message: '변경사항 저장 중 오류가 발생했습니다.',
        type: 'ALERT'
      });
    }
  };

  // --- API: 초기 데이터 로드 (GET) ---
  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        const response = await apiClient.get(`/onboarding/${shopId}`);
        const data = response.data.shop_info;
        const answersData = response.data.survey_answers; // API 명세에 맞춰 수정 필요

        if (answersData) {
          setSurveyAnswers(answersData);
          setGmailAddress(answersData[12] || ''); // 12번 문항이 이메일이라 가정
        }

        if (data) {
          setIsAutoUploadEnabled(data.insta_auto_upload_yn === 'Y');
          setLanguage(data.language || '한국어');
          setIsInstagramConnected(data.is_insta_connected || false);
          setIsGmailConnected(data.is_gmail_connected || false);
          // 🚨 주의: 백엔드 DB 컬럼명에 따라 is_ms_connected 등 수정 필요
          setIsMicrosoftConnected(data.is_ms_connected || false); 
          
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

  // 외부 팝업창 로그인 성공 메시지 수신 (로그인 성공 시 API 업데이트도 같이 호출)
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data === 'MS_LOGIN_SUCCESS' && activeAuthModal === 'Microsoft') {
        setAuthStatus('COMPLETED');
        setIsMicrosoftConnected(true);
        updateSetting({ is_ms_connected: true });
      }
      if (event.data === 'INSTA_LOGIN_SUCCESS' && activeAuthModal === 'Instagram') {
        setAuthStatus('COMPLETED');
        setIsInstagramConnected(true);
        updateSetting({ is_insta_connected: true });
      }
      if (event.data === 'GMAIL_LOGIN_SUCCESS' && activeAuthModal === 'Gmail') {
        setAuthStatus('COMPLETED');
        setIsGmailConnected(true);
        updateSetting({ is_gmail_connected: true });
      }
    };
    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAuthModal]);

  // --- 핸들러 함수들 ---
  const handleToggleAutoUpload = (val: boolean) => {
    setIsAutoUploadEnabled(val);
    updateSetting({ insta_auto_upload_yn: val ? 'Y' : 'N' });
  };

  const handleToggleLanguage = () => {
    const nextLang = language === '한국어' ? 'English' : '한국어';
    setLanguage(nextLang);
    updateSetting({ language: nextLang });
  };

  const triggerExternalPopup = (platform: AuthModalType) => {
    setAuthStatus('IN_PROGRESS');
    
    const currentOrigin = window.location.origin;
    const callbackUrl = encodeURIComponent(`${currentOrigin}/auth/callback`);
    let authUrl = '';

    if (platform === 'Microsoft') {
      authUrl = `https://bybaek-backend-awehcre3f3fpb4fg.koreacentral-01.azurewebsites.net/.auth/login/aad?post_login_redirect_uri=${callbackUrl}`;
    } else if (platform === 'Instagram') {
      authUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1219138883682659&redirect_uri=${callbackUrl}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;
    } else if (platform === 'Gmail') {
      authUrl = 'https://accounts.google.com/'; 
    }

    if (authUrl !== '') {
      const popup = window.open(authUrl, `${platform}_Login_Popup`, 'width=500,height=600');
      if (!popup) {
        setCustomAlert({
          isOpen: true,
          message: '팝업 차단이 감지되었습니다.\n브라우저 설정에서 팝업을 허용해주세요.',
          type: 'ALERT'
        });
        setAuthStatus('IDLE');
      }
    }
  };

  const CustomSwitch = ({ isOn, onToggle }: { isOn: boolean, onToggle: (val: boolean) => void }) => (
    <button
      onClick={() => onToggle(!isOn)}
      className={`w-[48px] h-[24px] rounded-full flex items-center px-1 transition-colors focus:outline-none ${isOn ? 'bg-accent' : 'bg-[#E0E0E0]'}`}
    >
      <div className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transform transition-transform duration-200 ${isOn ? 'translate-x-[22px]' : 'translate-x-0'}`} />
    </button>
  );

  if (isLoading) return <div className="flex h-screen w-full items-center justify-center font-bold text-text-secondary">설정 데이터를 불러오는 중입니다...</div>;

  // --- UI 렌더링 함수들 ---
  const renderCustomAlert = () => {
    if (!customAlert.isOpen) return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[99999]">
        <div className="bg-background rounded-xl shadow-lg p-8 w-[360px] flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${customAlert.type === 'CONFIRM' ? 'bg-[#FFE5E5]' : 'bg-red-50'}`}>
            <span className={`text-2xl font-bold leading-none ${customAlert.type === 'CONFIRM' ? 'text-[#E02424]' : 'text-accent'}`}>!</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            {customAlert.type === 'CONFIRM' ? '연동 해제' : '알림'}
          </h3>
          <p className="text-sm text-text-secondary text-center mb-6 whitespace-pre-wrap leading-relaxed">{customAlert.message}</p>
          <div className="flex flex-row w-full gap-3">
            {customAlert.type === 'CONFIRM' && (
              <button onClick={() => setCustomAlert({ ...customAlert, isOpen: false })} className="flex-1 py-3 bg-[#E0E0E0] text-text-primary rounded-lg font-bold hover:bg-gray-300 transition-colors focus:outline-none">취소</button>
            )}
            <button
              onClick={() => {
                if (customAlert.onConfirm) customAlert.onConfirm();
                setCustomAlert({ ...customAlert, isOpen: false });
              }}
              className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors focus:outline-none ${customAlert.type === 'CONFIRM' ? 'bg-[#E02424] hover:bg-red-800' : 'bg-accent hover:bg-accent-dark'}`}
            >
              {customAlert.type === 'CONFIRM' ? '해제하기' : '확인'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAuthModal = () => {
    if (activeAuthModal === 'NONE') return null;
    let title = '', desc = '', btnText = '';

    if (activeAuthModal === 'Microsoft') {
      title = 'MS 로그인 화면'; desc = '보안을 위해 외부 브라우저에서 로그인을 진행합니다.'; btnText = 'Microsoft 계정으로 로그인';
    } else if (activeAuthModal === 'Instagram') {
      title = '인스타 연동'; desc = 'Instagram 연동을 위해 권한을 부여해 주세요.'; btnText = 'Instagram 연동하기';
    } else if (activeAuthModal === 'Gmail') {
      title = 'Gmail 연동'; desc = '이메일 알림을 위해 Gmail 계정을 연동해 주세요.'; btnText = 'Gmail 계정으로 로그인';
    }

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
        <div className="w-[450px] min-h-[500px] bg-background rounded-xl shadow-lg p-large flex flex-col justify-between">
          <div className="flex justify-between items-center mb-large">
            <h2 className="text-h2 font-bold text-text-primary">{title}</h2>
            <button onClick={() => setActiveAuthModal('NONE')} className="text-[20px] text-text-secondary hover:text-text-primary transition-colors focus:outline-none">✕</button>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center px-4">
            {authStatus === 'IDLE' && (
              <>
                <p className="text-body text-text-primary text-center mb-5">{desc}</p>
                <button onClick={() => triggerExternalPopup(activeAuthModal)} className="w-full bg-accent py-[14px] rounded-lg shadow-sm text-text-inverse font-bold text-[15px] hover:bg-accent-dark transition-colors focus:outline-none">
                  {btnText}
                </button>
              </>
            )}
            {authStatus === 'IN_PROGRESS' && (
              <div className="flex flex-col items-center animate-pulse">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-body text-text-primary text-center font-bold">로그인 진행 중입니다...</p>
                <p className="text-[14px] text-text-secondary text-center mt-2">외부 창에서 로그인이 완료되면<br />자동으로 이 화면이 넘어갑니다.</p>
                <button onClick={() => {
                  setAuthStatus('COMPLETED');
                  if(activeAuthModal === 'Microsoft') { setIsMicrosoftConnected(true); updateSetting({ is_ms_connected: true }); }
                  if(activeAuthModal === 'Instagram') { setIsInstagramConnected(true); updateSetting({ is_insta_connected: true }); }
                  if(activeAuthModal === 'Gmail') { setIsGmailConnected(true); updateSetting({ is_gmail_connected: true }); }
                }} className="mt-8 text-xs text-gray-400 underline">(테스트용) 로그인 완료 강제 트리거</button>
              </div>
            )}
            {authStatus === 'COMPLETED' && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><span className="text-green-600 text-3xl">✓</span></div>
                <p className="text-[18px] font-bold text-text-primary">인증 완료!</p>
              </div>
            )}
          </div>
          <div className="flex flex-row justify-between mt-large">
            <button onClick={() => setActiveAuthModal('NONE')} className="flex-1 bg-[#E0E0E0] py-3 rounded-lg flex items-center justify-center mr-small text-text-primary font-bold hover:bg-gray-300 transition-colors focus:outline-none">취소</button>
            <button onClick={() => setActiveAuthModal('NONE')} disabled={authStatus !== 'COMPLETED'} className={`flex-1 py-3 rounded-lg flex items-center justify-center font-bold transition-colors focus:outline-none ${authStatus !== 'COMPLETED' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-accent text-text-inverse hover:bg-accent-dark'}`}>완료</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-row h-screen w-full bg-background relative overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-large flex flex-col min-w-0 h-full">
        <div className="mb-large border-b border-border pb-small shrink-0">
          <h1 className="text-[28px] text-text-primary font-bold">설정</h1>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-large min-h-0 scrollbar-hide">
          
          {/* 나만의 마케터 (DB에서 불러온 surveyAnswers 렌더링) */}
          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4">
            <div className="flex flex-row justify-between items-center">
              <h2 className="text-base font-bold text-text-primary m-0">나만의 마케터</h2>
              <button onClick={() => setIsPromptListOpen(!isPromptListOpen)} className="flex items-center text-sm font-bold text-text-primary hover:text-accent transition-colors focus:outline-none">
                {isPromptListOpen ? '▲ 닫기' : '▼ 열기'}
              </button>
            </div>
            {isPromptListOpen && (
              <div className="flex flex-col gap-5 mt-4 pt-4 border-t border-[#E0E0E0]">
                {ONBOARDING_QUESTIONS.filter(q => q.category === 'PERSONAL').map((q, index) => {
                  const rawAnswer = surveyAnswers[q.id];
                  const displayAnswer = rawAnswer ? (Array.isArray(rawAnswer) ? rawAnswer.join(', ') : rawAnswer) : '미입력';
                  return (
                    <div key={q.id} className="flex flex-row items-center justify-between gap-4">
                      <p className="flex-[2] text-[14px] text-text-primary leading-snug">{index + 1}. {q.question}</p>
                      <p className="flex-[1] text-[14px] text-text-secondary font-bold text-right truncate">{displayAnswer}</p>
                      <button className="px-4 py-1.5 bg-background border border-[#D0D0D0] rounded-full text-[13px] font-semibold text-text-primary hover:bg-gray-50 transition-colors focus:outline-none shrink-0" onClick={() => { setTargetQuestionId(q.id); setIsOnboardingModalOpen(true); }}>수정</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4 transition-all">
            <div className="flex flex-row justify-between items-center">
              <h2 className="text-base font-bold text-text-primary m-0">계정 연동</h2>
              <button onClick={() => setIsAccountListOpen(!isAccountListOpen)} className="flex items-center text-sm font-bold text-text-primary hover:text-accent transition-colors focus:outline-none">
                {isAccountListOpen ? '▲ 닫기' : '▼ 열기'}
              </button>
            </div>

            {isAccountListOpen && (
              <div className="flex flex-col gap-5 mt-4 pt-4 border-t border-[#E0E0E0]">
                {/* Microsoft 연동 */}
                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="flex-[1] flex items-center gap-2">
                    <span className="text-[14px] font-bold text-text-primary">Microsoft</span>
                  </div>
                  <p className="flex-[2] text-[14px] text-text-secondary text-right truncate">
                    {isMicrosoftConnected ? 'bybaek_barber@outlook.com' : '연동된 계정 없음'}
                  </p>
                  <button 
                    onClick={() => {
                      if (isMicrosoftConnected) {
                        setCustomAlert({
                          isOpen: true,
                          message: 'Microsoft 계정 연동을 해제하시겠습니까?\n해제 시 관련 기능을 사용할 수 없습니다.',
                          type: 'CONFIRM',
                          onConfirm: () => {
                            setIsMicrosoftConnected(false);
                            updateSetting({ is_ms_connected: false });
                          }
                        });
                      } else {
                        setActiveAuthModal('Microsoft');
                        setAuthStatus('IDLE');
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors focus:outline-none shrink-0 w-[100px] whitespace-nowrap text-center ${isMicrosoftConnected ? 'bg-background border border-[#D0D0D0] text-text-primary hover:bg-gray-50' : 'bg-accent text-white hover:bg-accent-dark'}`}
                  >
                    {isMicrosoftConnected ? '연동 해제' : '연동하기'}
                  </button>
                </div>

                {/* Instagram 연동 */}
                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="flex-[1] flex items-center gap-2">
                    <span className="text-[14px] font-bold text-text-primary">Instagram</span>
                  </div>
                  <p className="flex-[2] text-[14px] text-text-secondary text-right truncate">
                    {isInstagramConnected ? '@bybaek_official' : '연동된 계정 없음'}
                  </p>
                  <button 
                    onClick={() => {
                      if (isInstagramConnected) {
                        setCustomAlert({
                          isOpen: true,
                          message: 'Instagram 연동을 해제하시겠습니까?\n자동 포스팅 기능이 중지됩니다.',
                          type: 'CONFIRM',
                          onConfirm: () => {
                            setIsInstagramConnected(false);
                            updateSetting({ is_insta_connected: false });
                          }
                        });
                      } else {
                        setActiveAuthModal('Instagram');
                        setAuthStatus('IDLE');
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors focus:outline-none shrink-0 w-[100px] whitespace-nowrap text-center ${isInstagramConnected ? 'bg-background border border-[#D0D0D0] text-text-primary hover:bg-gray-50' : 'bg-accent text-white hover:bg-accent-dark'}`}
                  >
                    {isInstagramConnected ? '연동 해제' : '연동하기'}
                  </button>
                </div>

                {/* Gmail 연동 */}
                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="flex-[1] flex items-center gap-2">
                    <span className="text-[14px] font-bold text-text-primary">Gmail</span>
                  </div>
                  <p className="flex-[2] text-[14px] text-text-secondary text-right truncate">
                    {isGmailConnected ? (gmailAddress || '연동된 계정 없음') : '연동된 계정 없음'}
                  </p>
                  <button 
                    onClick={() => {
                      if (isGmailConnected) {
                        setCustomAlert({
                          isOpen: true,
                          message: 'Gmail 연동을 해제하시겠습니까?\n더 이상 알림 메일을 받을 수 없습니다.',
                          type: 'CONFIRM',
                          onConfirm: () => {
                            setIsGmailConnected(false);
                            updateSetting({ is_gmail_connected: false });
                          }
                        });
                      } else {
                        setActiveAuthModal('Gmail');
                        setAuthStatus('IDLE');
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors focus:outline-none shrink-0 w-[100px] whitespace-nowrap text-center ${isGmailConnected ? 'bg-background border border-[#D0D0D0] text-text-primary hover:bg-gray-50' : 'bg-accent text-white hover:bg-accent-dark'}`}
                  >
                    {isGmailConnected ? '연동 해제' : '연동하기'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4">
            <h2 className="text-base font-bold text-text-primary mb-4">환경 설정</h2>
            <div className="flex flex-row justify-between items-center mb-4">
              <span className="text-[15px] text-text-primary">사용 언어(Language)</span>
              <div className="flex flex-row items-center">
                <span className="bg-background border border-border px-3 py-1.5 rounded-md text-sm mr-2">{language}</span>
                <button className="bg-background border border-[#D0D0D0] px-4 py-1.5 rounded-full text-[13px] text-text-primary font-semibold hover:bg-gray-50 transition-colors focus:outline-none" onClick={handleToggleLanguage}>변경</button>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className="text-[15px] text-text-primary">인스타 자동 업로드</span>
              <CustomSwitch isOn={isAutoUploadEnabled} onToggle={handleToggleAutoUpload} />
            </div>
          </div>

          <div className="bg-[#F5F5F5] rounded-xl p-5 mb-4">
            <h2 className="text-base font-bold text-text-primary mb-4">자동 업로드 설정</h2>
            <div className="flex flex-row justify-between items-center">
              <span className="text-[15px] text-text-primary">업로드 시간</span>
              <div className="flex flex-row items-center">
                <span className="bg-background border border-border px-3 py-1.5 rounded-md text-sm mr-2">{frequency} {amPm} {hour}:{minute}</span> 
                <button className="bg-background border border-[#D0D0D0] px-4 py-1.5 rounded-full text-[13px] text-text-primary font-semibold hover:bg-gray-50 transition-colors focus:outline-none" onClick={() => { setTempFrequency(frequency); setTempAmPm(amPm); setTempHour(hour); setTempMinute(minute); setTimeModalVisible(true); }}>수정</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 모달 영역 --- */}
      {renderAuthModal()}
      {renderCustomAlert()}

      <SettingEditModal
        isVisible={isTimeModalVisible} title="업로드 스케줄 설정" onClose={() => setTimeModalVisible(false)}
        onSave={() => {
          setFrequency(tempFrequency); setAmPm(tempAmPm); setHour(tempHour); setMinute(tempMinute);
          
          // 🚨 시간 설정도 API POST로 쏘도록 변경
          updateSetting({ 
            insta_upload_time_slot: tempFrequency, 
            insta_upload_time: `${tempHour}:${tempMinute} ${tempAmPm}` 
          });
          
          setTimeModalVisible(false);
        }}
      >
        <p className="text-sm font-bold text-[#666666] mb-2 mt-4">시간 설정</p>
        <div className="flex flex-row gap-2 mb-4">
          {['AM', 'PM'].map(p => (
            <button key={p} className={`px-4 py-2 rounded-full border text-sm transition-colors focus:outline-none ${tempAmPm === p ? 'bg-accent border-accent text-white font-bold' : 'bg-[#F0F0F0] border-border text-text-primary'}`} onClick={() => setTempAmPm(p)}>{p}</button>
          ))}
        </div>
        <div className="flex flex-row relative z-50 mb-6 gap-4">
          <div className="relative w-[140px]">
            <button className="w-full flex justify-between items-center bg-background border border-border rounded-lg px-4 py-3 text-[15px] focus:outline-none" onClick={() => { setIsHourDropdownOpen(!isHourDropdownOpen); setIsMinuteDropdownOpen(false); }}>
              <span>{tempHour} 시</span><span className="text-[12px] text-[#888888]">▼</span>
            </button>
            {isHourDropdownOpen && (
              <div className="absolute top-[110%] left-0 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                {hours.map(h => <button key={`hour-${h}`} className="w-full text-left px-4 py-3 border-b border-[#F0F0F0] text-sm hover:bg-gray-50 focus:outline-none" onClick={() => { setTempHour(h); setIsHourDropdownOpen(false); }}>{h} 시</button>)}
              </div>
            )}
          </div>
          <div className="relative w-[140px]">
            <button className="w-full flex justify-between items-center bg-background border border-border rounded-lg px-4 py-3 text-[15px] focus:outline-none" onClick={() => { setIsMinuteDropdownOpen(!isMinuteDropdownOpen); setIsHourDropdownOpen(false); }}>
              <span>{tempMinute} 분</span><span className="text-[12px] text-[#888888]">▼</span>
            </button>
            {isMinuteDropdownOpen && (
              <div className="absolute top-[110%] left-0 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                {minutes.map(m => <button key={`min-${m}`} className="w-full text-left px-4 py-3 border-b border-[#F0F0F0] text-sm hover:bg-gray-50 focus:outline-none" onClick={() => { setTempMinute(m); setIsMinuteDropdownOpen(false); }}>{m} 분</button>)}
              </div>
            )}
          </div>
        </div>
        <p className="text-sm font-bold text-[#666666] mb-2">업로드 빈도</p>
        <div className="flex flex-row flex-wrap gap-2">
          {frequencies.map(f => (
            <button key={f} className={`px-4 py-2 rounded-full border text-sm transition-colors focus:outline-none ${tempFrequency === f ? 'bg-accent border-accent text-white font-bold' : 'bg-[#F0F0F0] border-border text-text-primary'}`} onClick={() => setTempFrequency(f)}>{f}</button>
          ))}
        </div>
      </SettingEditModal>

      {isOnboardingModalOpen && (
        <OnboardingSurvey 
          initialQuestionId={targetQuestionId} 
          onFinish={(newAnswers) => {
            setIsOnboardingModalOpen(false);
            // 모달창에서 완료 후 데이터를 새로 받아왔다고 가정하고 업데이트
            if (newAnswers) {
              setSurveyAnswers(newAnswers);
              setGmailAddress(newAnswers[12] || '');
            }
          }}
          onSkip={() => setIsOnboardingModalOpen(false)}
        />
      )}
    </div>
  );
}