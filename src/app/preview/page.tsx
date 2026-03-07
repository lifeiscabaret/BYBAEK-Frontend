// 타겟 경로: src/app/preview/page.tsx
"use client";

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ImageEditModal } from '@/components/ImageEditModal';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

const MOCK_CHAT: ChatMessage[] = [
  { id: '1', sender: 'ai', text: '안녕하세요! 어떤 바버샵 스타일의 게시글을 작성해 드릴까요?' },
];

export default function PreviewScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT);
  const [inputText, setInputText] = useState('');
  
  // 🚨 [추가] AI 응답 대기 상태
  const [isLoading, setIsLoading] = useState(false);
  const shopId = '3sesac18'; // DB 연동용 하드코딩

  // 웹 표준 포커스 제어를 위한 Ref
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // 🚨 [추가] 스크롤용 Ref

  const mockImages = ['이미지1', '이미지2', '이미지3'];
  const [images, setImages] = useState<string[]>(mockImages);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const [generatedCaption, setGeneratedCaption] = useState('여기에 AI가 작성한 최종 캡션과 해시태그가 표시됩니다.');

  // 메시지 전송 후 포커스 유지 및 자동 스크롤
  useEffect(() => {
    textareaRef.current?.focus();
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); // 🚨 [추가] 자동 스크롤
  }, [messages, isLoading]);

  // 텍스트 입력 시 높이 조절 로직
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setInputText(target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // 높이 초기화
      textareaRef.current.style.height = `${target.scrollHeight}px`; // 내용 높이에 맞게 설정
    }
  };

  const handleRemoveImages = (indexesToRemove: number[]) => {
    setImages((prevImages) => 
      prevImages.filter((_, index) => !indexesToRemove.includes(index))
    );
    setCurrentImageIndex(0);
  };

  const handleAddImage = () => {
    const newImageName = `이미지${images.length + 1}`;
    setImages((prev) => [...prev, newImageName]);
  };

  // 🚨 [수정] 폼 제출 이벤트를 통한 메시지 전송 (스트리밍 로직 결합)
  const handleSendMessage = async (e?: FormEvent) => {
    e?.preventDefault(); // 새로고침 방지
    if (!inputText.trim() || isLoading) return;
    
    // 1. 유저 메시지 화면에 추가
    const userText = inputText;
    const newMessage: ChatMessage = { 
      id: Date.now().toString(), 
      sender: 'user', 
      text: userText 
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // 2. AI 답변용 빈 껍데기 메시지 미리 추가
    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: aiMessageId, sender: 'ai', text: '' }]);

    try {
      console.log("🚀 [전송 시작] 백엔드로 fetch 요청 시작...");
      
      // 🚨 8000포트로 수정된 fetch 요청
      const response = await fetch(`http://127.0.0.1:8000/api/agent/manual_chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          message: userText,
          photo_ids: []
        })
      });

      if (!response.ok) throw new Error(`서버 에러: ${response.status}`);
      if (!response.body) throw new Error('스트리밍 불가');

      // 3. 스트리밍 리더기 장착
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let fullResponse = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk; 
          
          setMessages((prev) => 
            prev.map(msg => 
              msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
            )
          );
        }
      }
      
      // 4. 작성이 완료되면 우측 프리뷰 영역에도 텍스트 업데이트
      setGeneratedCaption(fullResponse);

    } catch (error) {
      console.error("❌ [오류 발생]:", error);
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, text: `통신 오류가 발생했습니다: ${error}` } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) setCurrentImageIndex((prev) => prev - 1);
  };
  
  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) setCurrentImageIndex((prev) => prev + 1);
  };

  return (
    // 전체 컨테이너: 사이드바와 메인 컨텐츠 가로 배치
    <div className="flex flex-row h-screen w-full bg-background overflow-hidden">
      
      {/* 1. 좌측 사이드바 */}
      <Sidebar />

      {/* 2. 중앙 채팅 영역 (flex: 1.5) */}
      <div className="flex-[1.5] bg-background border-r border-border p-large flex flex-col min-w-0 h-full">
        
        {/* 헤더 */}
        <div className="mb-large pb-small border-b border-border shrink-0">
          <h1 className="text-h1 text-text-primary font-bold">게시글 작성</h1>
        </div>
        
        {/* 메시지 목록 (FlatList 대체) */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 scrollbar-hide min-h-0">
          {messages.map((item) => {
            const isUser = item.sender === 'user';
            return (
              <div 
                key={item.id}
                className={`max-w-[80%] p-medium rounded-xl break-words shrink-0 ${
                  isUser 
                    ? 'self-end bg-sidebar text-text-inverse' 
                    : 'self-start bg-[#F5F5F5] text-text-primary'
                }`}
              >
                <p className="text-body whitespace-pre-wrap">{item.text}</p>
              </div>
            );
          })}
          
          {/* 🚨 [추가] AI가 작성 중일 때 띄워줄 로딩 UI (기존 디자인 스타일 유지) */}
          {isLoading && (
            <div className="max-w-[80%] p-medium rounded-xl break-words shrink-0 self-start bg-[#F5F5F5] text-text-secondary flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-body">나만의 마케터가 작성중입니다...</p>
            </div>
          )}
          {/* 🚨 [추가] 스크롤 도착지점 */}
          <div ref={messagesEndRef} />
        </div>

        {/* 채팅 입력창 (form 태그로 감싸 엔터키 전송 지원) */}
        <form 
          onSubmit={handleSendMessage}
          className="flex flex-col py-medium bg-background mt-4 shrink-0"
        >
          <div className={`flex items-end gap-2 border border-[#E0E0E0] rounded-lg p-2 transition-colors focus-within:border-accent ${
            isEditModalVisible ? 'bg-gray-100 opacity-50' : 'bg-background'
          }`}>
            <textarea
              ref={textareaRef}
              rows={1}
              disabled={isEditModalVisible || isLoading} // 🚨 로딩 중 입력 방지
              className="flex-1 bg-transparent resize-none overflow-y-auto text-text-primary focus:outline-none min-h-[40px] max-h-[33vh] py-2 px-2 leading-relaxed appearance-none scrollbar-hide"
              placeholder={isEditModalVisible ? "" : "예시) 오늘 날씨에 어울리는 홍보 문구로 작성해줘."}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleSendMessage();
                  }
              }}
              // [추가] 브라우저별 스크롤바와 화살표를 강제로 숨기는 설정
              style={{
                  msOverflowStyle: 'none',  // IE/Edge
                  scrollbarWidth: 'none',   // Firefox
              }}
            />
            {/* 🚨 로딩 중이거나 입력값이 없을 때 색상 회색으로 변경 */}
            <button 
              type="submit" 
              disabled={isLoading || !inputText.trim()}
              className={`shrink-0 px-medium mb-1.5 font-bold ${isLoading || !inputText.trim() ? 'text-text-secondary' : 'text-accent'}`}
            >
              전송
            </button>
          </div>
        </form>
      </div>

      {/* 3. 우측 프리뷰 영역 (flex: 1) */}
      <div className="flex-1 p-large bg-[#FAFAFA] flex flex-col min-w-0 h-full overflow-y-auto">
        
        {/* 프리뷰 헤더 */}
        <div className="flex flex-row justify-between items-center mb-medium">
          <h2 className="text-h2 text-text-primary font-bold">생성 결과물</h2>
          <button 
            onClick={() => setIsEditModalVisible(true)}
            className="px-3 py-1.5 border border-accent rounded-md bg-background text-[12px] text-text-secondary font-medium hover:bg-gray-50 transition-colors focus:outline-none"
          >
            사진 추가
          </button>
        </div>

        {/* 이미지 프리뷰 슬라이더 */}
        <div className="flex-[2] flex flex-row items-center justify-between bg-[#EAEAEA] rounded-lg mb-medium overflow-hidden">
          <button 
            onClick={handlePrevImage} 
            disabled={currentImageIndex === 0}
            className="p-medium z-10 focus:outline-none group"
          >
            <span className={`text-h1 font-bold ${
              currentImageIndex === 0 ? 'text-border' : 'text-text-secondary group-hover:text-text-primary'
            }`}>
              {'<'}
            </span>
          </button>
          
          <div className="flex-1 flex justify-center items-center">
            {images.length > 0 ? (
              <span className="text-body text-text-secondary">{images[currentImageIndex]}</span>
            ) : (
              <span className="text-body text-text-secondary">사진 없음</span>
            )}
          </div>
          
          <button 
            onClick={handleNextImage} 
            disabled={currentImageIndex === images.length - 1 || images.length === 0}
            className="p-medium z-10 focus:outline-none group"
          >
            <span className={`text-h1 font-bold ${
              currentImageIndex === images.length - 1 || images.length === 0 ? 'text-border' : 'text-text-secondary group-hover:text-text-primary'
            }`}>
              {'>'}
            </span>
          </button>
        </div>

        {/* 텍스트 프리뷰 영역 (AI 캡션) */}
        <div className="flex-1 bg-background border border-border rounded-lg p-medium mb-large">
          <textarea
            className="w-full h-full resize-none text-body text-text-primary leading-[22px] bg-transparent focus:outline-none"
            value={generatedCaption}
            onChange={(e) => setGeneratedCaption(e.target.value)}
          />
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex flex-row justify-end gap-4 shrink-0">
          <button className="flex-1 py-3 border border-text-primary rounded-lg text-text-primary font-bold hover:bg-gray-100 transition-colors focus:outline-none">
            게시글 수정
          </button>
          {/* STEP 6. Instagram 업로드 [cite: 31] 트리거 버튼 */}
          <button className="flex-1 py-3 bg-accent rounded-lg text-text-inverse font-bold hover:bg-accent-dark transition-colors focus:outline-none">
            인스타 업로드
          </button>
        </div>
      </div>

      {/* 분리된 모달 컴포넌트 */}
      <ImageEditModal 
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        images={images}
        onRemove={handleRemoveImages}
        onAdd={handleAddImage}
      />
    </div>
  );
}