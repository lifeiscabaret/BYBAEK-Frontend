"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/settings'); }, []);
  return null;
}