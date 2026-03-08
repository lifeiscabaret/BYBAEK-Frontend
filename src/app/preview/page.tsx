// 타겟 경로: src/app/preview/page.tsx
"use client";

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Sidebar } from '@/components/Sidebar';
import apiClient from '@/api/index';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

const MOCK_CHAT: ChatMessage[] = [
  { id: '1', sender: 'ai', text: '안녕하세요! 어떤 바버샵 스타일의 게시글을 작성해 드릴까요?' },
];

export default function PreviewScreen() {
  const shopId = '3sesac18';

  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); 

  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]); 
  const [tempSelectedPhotos, setTempSelectedPhotos] = useState<any[]>([]);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  // 🚨 [추가] 순서 변경 모달 상태
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false); 

  const [generatedCaption, setGeneratedCaption] = useState('여기에 AI가 작성한 최종 캡션과 해시태그가 표시됩니다.');

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await apiClient.get(`/photos/all/${shopId}`);
        setAllPhotos(response.data.photos || []);
      } catch (error) {
        console.error("사진 로딩 실패:", error);
      }
    };
    fetchPhotos();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setInputText(target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${target.scrollHeight}px`; 
    }
  };

  const openPhotoModal = () => {
    setTempSelectedPhotos(images);
    setIsEditModalVisible(true);
  };

  const toggleTempSelect = (photo: any) => {
    setTempSelectedPhotos((prev) =>
      prev.some((p) => p.id === photo.id) ? prev.filter((p) => p.id !== photo.id) : [...prev, photo]
    );
  };

  const handleSavePhotos = () => {
    setImages(tempSelectedPhotos);
    setCurrentImageIndex(0);
    setIsEditModalVisible(false);
  };

  // 🚨 [추가] 사진 순서 변경 로직 (위로 이동)
  const movePhotoUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...tempSelectedPhotos];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setTempSelectedPhotos(newOrder);
  };

  // 🚨 [추가] 사진 순서 변경 로직 (아래로 이동)
  const movePhotoDown = (index: number) => {
    if (index === tempSelectedPhotos.length - 1) return;
    const newOrder = [...tempSelectedPhotos];
    [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    setTempSelectedPhotos(newOrder);
  };

  const handleSendMessage = async (e?: FormEvent) => {
    e?.preventDefault(); 
    if (!inputText.trim() || isLoading) return;
    
    const userText = inputText;
    const newMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: aiMessageId, sender: 'ai', text: '' }]);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/agent/manual_chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: shopId,
          message: userText,
          photo_ids: images.map(img => img.id)
        })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullResponse = '';

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk; 
        setMessages((prev) => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg));
      }
      setGeneratedCaption(fullResponse);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-row h-screen w-full bg-background overflow-hidden relative">
      <Sidebar />

      {/* 중앙 채팅 영역 */}
      <div className="flex-[1.5] bg-background border-r border-border p-large flex flex-col min-w-0 h-full">
        <div className="mb-large pb-small border-b border-border shrink-0">
          <h1 className="text-h1 text-text-primary font-bold">게시글 작성</h1>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 scrollbar-hide min-h-0">
          {messages.map((item) => (
            <div key={item.id} className={`max-w-[80%] p-medium rounded-xl break-words shrink-0 ${item.sender === 'user' ? 'self-end bg-sidebar text-text-inverse' : 'self-start bg-[#F5F5F5] text-text-primary'}`}>
              <p className="text-body whitespace-pre-wrap">{item.text}</p>
            </div>
          ))}
          {isLoading && (
            <div className="max-w-[80%] p-medium rounded-xl self-start bg-[#F5F5F5] text-text-secondary flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-body">나만의 마케터가 작성중입니다...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="flex flex-col py-medium bg-background mt-4 shrink-0">
          <div className="flex items-end gap-2 border border-[#E0E0E0] rounded-lg p-2 bg-background focus-within:border-accent">
            <textarea ref={textareaRef} rows={1} disabled={isLoading} className="flex-1 bg-transparent resize-none focus:outline-none min-h-[40px] max-h-[33vh] py-2 px-2" placeholder="요청사항을 입력하세요..." value={inputText} onChange={handleTextareaChange} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
            <button type="submit" disabled={isLoading || !inputText.trim()} className="font-bold text-accent px-medium mb-1.5">전송</button>
          </div>
        </form>
      </div>

      {/* 우측 프리뷰 영역 */}
      <div className="flex-1 p-large bg-[#FAFAFA] flex flex-col min-w-0 h-full overflow-y-auto">
        <div className="flex flex-row justify-between items-center mb-medium">
          <h2 className="text-h2 text-text-primary font-bold">생성 결과물</h2>
          <button onClick={openPhotoModal} className="px-3 py-1.5 border border-accent rounded-md bg-background text-[12px] text-text-secondary font-medium hover:bg-gray-50">사진 추가</button>
        </div>

        {/* 🚨 이미지 슬라이더 개선: 인스타 비율에 맞춰 꽉 차게 설정 */}
        <div className="relative aspect-square bg-[#EAEAEA] rounded-lg mb-small overflow-hidden flex items-center justify-center">
          <button onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))} disabled={currentImageIndex === 0} className="absolute left-2 z-10 text-white text-3xl drop-shadow-md disabled:opacity-30">{'<'}</button>
          
          <div className="w-full h-full">
            {images.length > 0 ? (
              <img 
                src={images[currentImageIndex].blob_url} 
                alt="preview" 
                className="w-full h-full object-cover" // 🚨 상하 기준으로 꽉 차게 설정
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary">사진 없음</div>
            )}
          </div>
          
          <button onClick={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))} disabled={currentImageIndex === images.length - 1 || images.length === 0} className="absolute right-2 z-10 text-white text-3xl drop-shadow-md disabled:opacity-30">{'>'}</button>
        </div>

        {/* 🚨 [추가] 사진 순서 변경 버튼 */}
        <button 
          onClick={() => { setTempSelectedPhotos(images); setIsOrderModalVisible(true); }}
          className="w-full py-2 mb-medium border border-border rounded-lg bg-white text-[13px] text-text-secondary hover:bg-gray-50 transition-colors"
        >
          ↕ 사진 순서 변경
        </button>

        <div className="flex-1 bg-background border border-border rounded-lg p-medium mb-large">
          <textarea className="w-full h-full resize-none text-body bg-transparent focus:outline-none" value={generatedCaption} onChange={(e) => setGeneratedCaption(e.target.value)} />
        </div>

        <div className="shrink-0">
          <button className="w-full py-3.5 bg-accent rounded-lg text-white font-bold text-[16px] hover:bg-accent-dark transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-md">
            인스타 업로드
          </button>
        </div>
      </div>

      {/* 1. 사진 선택 모달 */}
      {isEditModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
          <div className="w-[600px] h-[600px] bg-background rounded-xl shadow-lg p-large flex flex-col">
            <div className="flex justify-between items-center mb-large border-b pb-small">
              <h2 className="text-h2 font-bold">사진 선택</h2>
              <div className="flex gap-3">
                <button onClick={handleSavePhotos} className="px-5 py-2 bg-accent text-white rounded-md font-bold text-sm">저장</button>
                <button onClick={() => setIsEditModalVisible(false)} className="text-[20px] text-text-secondary">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-4">
              {allPhotos.map((photo) => {
                const isSelected = tempSelectedPhotos.some((p) => p.id === photo.id);
                return (
                  <button key={photo.id} onClick={() => toggleTempSelect(photo)} className={`relative aspect-square rounded-lg border overflow-hidden ${isSelected ? 'border-accent border-[3px]' : 'border-border'}`}>
                    <div className={`absolute top-2 left-2 w-[22px] h-[22px] rounded border-2 flex justify-center items-center ${isSelected ? 'bg-accent border-accent' : 'bg-white border-text-secondary'}`}>
                      {isSelected && <span className="text-white text-sm font-bold">✓</span>}
                    </div>
                    <img src={photo.blob_url} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. 🚨 [추가] 사진 순서 변경 모달 */}
      {isOrderModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]">
          <div className="w-[450px] max-h-[600px] bg-background rounded-xl shadow-lg p-large flex flex-col">
            <div className="flex justify-between items-center mb-large border-b pb-small">
              <h2 className="text-h2 font-bold text-text-primary">사진 순서 변경</h2>
              <div className="flex gap-3">
                <button onClick={() => { setImages(tempSelectedPhotos); setIsOrderModalVisible(false); }} className="px-5 py-2 bg-accent text-white rounded-md font-bold text-sm">저장</button>
                <button onClick={() => setIsOrderModalVisible(false)} className="text-[20px] text-text-secondary">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 scrollbar-hide">
              {tempSelectedPhotos.map((photo, index) => (
                <div key={photo.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-border">
                  <span className="font-bold text-accent w-5">{index + 1}</span>
                  <img src={photo.blob_url} className="w-16 h-16 object-cover rounded-md" />
                  <div className="flex-1 text-sm font-medium truncate">{photo.original_name}</div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => movePhotoUp(index)} disabled={index === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">▲</button>
                    <button onClick={() => movePhotoDown(index)} disabled={index === tempSelectedPhotos.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">▼</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}