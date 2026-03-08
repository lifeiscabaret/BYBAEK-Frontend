// 타겟 경로: src/components/PhotoSyncProgress.tsx
"use client";

import React, { useState, useEffect } from 'react';
import apiClient from '@/api/index';

interface SyncStatus {
  is_syncing: boolean;
  total_detected: number;
  processed_count: number;
  saved_count: number;
  filtered_count: number;
}

export function PhotoSyncProgress() {
  const shopId = '3sesac18'; 
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkSyncStatus = async () => {
      try {
        const response = await apiClient.get(`/photos/sync-status/${shopId}`);
        const data: SyncStatus = response.data;
        setStatus(data);

        if (data.is_syncing) {
          setIsVisible(true);
        } else if (isVisible && !data.is_syncing) {
          setTimeout(() => setIsVisible(false), 5000); // 완료 후 5초 뒤 사라짐
        }
      } catch (error) {
        // 에러 무시 (API가 없거나 통신 실패 시 화면에 안 띄움)
      }
    };

    checkSyncStatus();
    const intervalId = setInterval(checkSyncStatus, 3000);
    return () => clearInterval(intervalId);
  }, [isVisible]);

  if (!isVisible || !status) return null;

  const percent = status.total_detected > 0 
    ? Math.round((status.processed_count / status.total_detected) * 100) 
    : 0;

  return (
    // 🚨 핵심 포인트: top-6, left-1/2, -translate-x-1/2 로 상단 중앙에 완벽히 고정!
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 z-[10000] animate-in slide-in-from-top-10 fade-in duration-300">
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {status.is_syncing ? (
            <div className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          ) : (
            <div className="w-3.5 h-3.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          )}
          <h3 className="text-[15px] font-bold text-gray-800">
            {status.is_syncing ? 'OneDrive 사진을 가져오는 중입니다' : '사진 동기화 완료!'}
          </h3>
        </div>
        {!status.is_syncing && (
          <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-700 text-lg focus:outline-none">
            ✕
          </button>
        )}
      </div>

      {/* 프로그래스 바 */}
      <div className="w-full h-2.5 bg-gray-100 rounded-full mb-3 overflow-hidden shadow-inner">
        <div 
          className={`h-full transition-all duration-500 ease-out rounded-full ${status.is_syncing ? 'bg-blue-500' : 'bg-green-500'}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-between text-[13px] text-gray-500 mb-3 px-1">
        <span>처리 진행률</span>
        <span className="font-bold">{status.processed_count} / {status.total_detected} 장 ({percent}%)</span>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-[13px] flex justify-between border border-gray-100">
        <span className="text-gray-600">
          ✅ 앨범 추가됨: <span className="font-bold text-green-600">{status.saved_count}</span>장
        </span>
        <span className="text-gray-600">
          ⛔ 조건 미달 (제외): <span className="font-bold text-red-500">{status.filtered_count}</span>장
        </span>
      </div>
      
    </div>
  );
}