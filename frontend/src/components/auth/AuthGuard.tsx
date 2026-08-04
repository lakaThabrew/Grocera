"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

function hasExpiredToken(token: string) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(normalizedPayload)) as { exp?: number };
    return typeof exp !== 'number' || exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);
  const [isReady, setIsReady] = useState(false);
  const hasValidSession = Boolean(
    isAuthenticated && accessToken && !hasExpiredToken(accessToken),
  );

  useEffect(() => {
    setIsReady(true);
    if (!hasValidSession) {
      logout();
      router.replace('/login');
    }
  }, [hasValidSession, logout, router]);

  if (!isReady || !hasValidSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" aria-label="Checking your session">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
