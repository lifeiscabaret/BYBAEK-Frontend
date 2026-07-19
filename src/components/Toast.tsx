"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const AUTO_DISMISS_MS = 2500;

const font = { fontFamily: "'NanumSquare Neo', 'NanumSquare', sans-serif" };

// 브랜드 톤(버건디 #800020) 기반. 화려하지 않게, 성공/실패만 미세하게 구분.
const TONE: Record<ToastType, { accent: string; icon: React.ReactNode }> = {
  success: { accent: '#800020', icon: <Check size={16} strokeWidth={2.5} /> },
  error: { accent: '#B23A48', icon: <AlertCircle size={16} strokeWidth={2.5} /> },
  info: { accent: '#5A2A2A', icon: <AlertCircle size={16} strokeWidth={2.5} /> },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type: ToastType, message: string) => {
    const id = ++seq.current;
    // 최대 2개까지만 스택 유지 (오래된 것부터 밀어냄).
    setToasts((prev) => [...prev.slice(-1), { id, type, message }]);
    setTimeout(() => remove(id), AUTO_DISMISS_MS);
  }, [remove]);

  const api: ToastApi = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const tone = TONE[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-white py-2.5 pl-3 pr-4 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
                style={{ ...font, borderLeft: `3px solid ${tone.accent}` }}
                role="status"
                aria-live="polite"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: tone.accent }}
                >
                  {tone.icon}
                </span>
                <span className="text-[0.85rem] font-medium text-[#1A1A1A]">{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
