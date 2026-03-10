"use client";

import { useState, useEffect } from 'react';
import { translations, LanguageCode } from '@/locales/translations';

export const useTranslation = () => {
  // 기본값은 'ko'
  const [lang, setLang] = useState<LanguageCode>('ko');

  useEffect(() => {
    // 브라우저에 저장된 사장님의 언어 설정을 가져옵니다.
    // (온보딩이 끝나거나 로그인할 때 localStorage.setItem('language', 'en') 처럼 저장했다고 가정)
    const savedLang = localStorage.getItem('language') as LanguageCode;
    if (savedLang && (savedLang === 'ko' || savedLang === 'en')) {
      setLang(savedLang);
    }
  }, []);

  // 현재 언어에 맞는 사전 뭉치를 꺼냅니다.
  const t = translations[lang];

  return { t, lang };
};