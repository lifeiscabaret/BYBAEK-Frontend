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
  
  // 웹 표준 포커스 제어를 위한 Ref
  const inputRef = useRef<HTMLInputElement>(null);

  const mockImages = ['이미지1', '이미지2', '이미지3'];
  const [images, setImages] = useState<string[]>(mockImages);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const [generatedCaption, setGeneratedCaption] = useState('여기에 AI가 작성한 최종 캡션과 해시태그가 표시됩니다.');

  // 메시지 전송 후 포커스 유지
  useEffect(() => {
    inputRef.current?.focus();
  }, [messages]);

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

  // 폼 제출 이벤트를 통한 메시지 전송 (엔터 키 지원)
  const handleSendMessage = (e?: FormEvent) => {
    e?.preventDefault(); // 새로고침 방지
    if (!inputText.trim()) return;
    
    const newMessage: ChatMessage = { 
      id: Date.now().toString(), 
      sender: 'user', 
      text: inputText 
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) setCurrentImageIndex((prev) => prev - 1);
  };
  
  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) setCurrentImageIndex((prev) => prev + 1);
  };

  return (
    // 전체 컨테이너: 사이드바와 메인 컨텐츠 가로 배치
    <div className="flex flex-row min-h-screen bg-background">
      
      {/* 1. 좌측 사이드바 */}
      <Sidebar />

      {/* 2. 중앙 채팅 영역 (flex: 1.5) */}
      <div className="flex-[1.5] bg-background border-r border-border p-large flex flex-col min-w-0">
        
        {/* 헤더 */}
        <div className="mb-large pb-small border-b border-border">
          <h1 className="text-h1 text-text-primary font-bold">게시글 작성</h1>
        </div>
        
        {/* 메시지 목록 (FlatList 대체) */}
        <div className="flex-1 overflow-y-auto pb-large flex flex-col gap-4 pr-2">
          {messages.map((item) => {
            const isUser = item.sender === 'user';
            return (
              <div 
                key={item.id}
                className={`max-w-[80%] p-medium rounded-xl break-words ${
                  isUser 
                    ? 'self-end bg-sidebar text-text-inverse' 
                    : 'self-start bg-[#F5F5F5] text-text-primary'
                }`}
              >
                <p className="text-body whitespace-pre-wrap">{item.text}</p>
              </div>
            );
          })}
        </div>

        {/* 채팅 입력창 (form 태그로 감싸 엔터키 전송 지원) */}
        <form 
          onSubmit={handleSendMessage}
          className="flex flex-row items-center py-medium bg-background mt-4"
        >
          {isEditModalVisible ? (
            <div className="flex-1 min-h-[45px] border border-[#E0E0E0] rounded-lg mr-small bg-background" />
          ) : (
            <input
              ref={inputRef}
              type="text"
              className="flex-1 min-h-[45px] border border-[#E0E0E0] rounded-lg px-medium mr-small text-text-primary bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="예시) 오늘 날씨에 어울리는 홍보 문구로 작성해줘."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          )}

          <button 
            type="submit"
            disabled={isEditModalVisible}
            className={`px-medium flex items-center justify-center font-bold text-accent transition-opacity focus:outline-none ${
              isEditModalVisible ? 'opacity-0 cursor-default' : 'hover:opacity-80'
            }`}
          >
            전송
          </button>
        </form>
      </div> 

      {/* 3. 우측 프리뷰 영역 (flex: 1) */}
      <div className="flex-1 p-large bg-[#FAFAFA] flex flex-col min-w-0">
        
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