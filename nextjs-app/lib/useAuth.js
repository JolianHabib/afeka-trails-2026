'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';

export function useAuth() {
  const router = useRouter();
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace('/auth/login');
    }
  }, [router]);
}