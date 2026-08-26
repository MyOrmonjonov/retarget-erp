'use client';

import { Navigate, useLocation } from 'react-router-dom';
import { RotateCw, TriangleAlert } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { getTelegramInitData } from '@/shared/lib/telegram';
import { useAuthStore } from '../store/authStore';
import { useAutoTelegramAuth } from '../hooks/useAuth';

export function AuthGatePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeWorkspaceId = useAuthStore((s) => s.activeWorkspaceId);
  const location = useLocation();
  const auth = useAutoTelegramAuth();
  const initData = getTelegramInitData();

  if (isAuthenticated && activeWorkspaceId != null) {
    const from = (location.state as { from?: string })?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="w-full max-w-md animate-in">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-[var(--shadow-glow)]">
            <span className="text-[var(--color-bg-primary)] font-bold text-2xl">R</span>
          </div>
          <div>
            <h1 className="text-h2 font-bold text-[var(--color-text-primary)]">Retarget ERP</h1>
            <p className="text-caption text-[var(--color-text-secondary)]">Boshqaruv tizimi</p>
          </div>
        </div>

        <Card variant="default" className="shadow-lg">
          <CardHeader>
            <CardTitle>Telegram orqali kirish</CardTitle>
            <CardDescription>
              {initData
                ? 'Sessiya tekshirilmoqda...'
                : "Bu ilova faqat Telegram Mini App sifatida ochiladi"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!initData ? (
              <div className="flex items-start gap-3 rounded-[10px] bg-[var(--color-warning-muted)] px-4 py-3">
                <TriangleAlert className="h-5 w-5 shrink-0 text-[var(--color-warning)]" />
                <p className="text-body text-[var(--color-text-secondary)]">
                  Iltimos, ilovani Telegram botdagi Mini App tugmasi orqali oching. Brauzerda to'g'ridan-to'g'ri
                  ochish qo'llab-quvvatlanmaydi.
                </p>
              </div>
            ) : auth.isError ? (
              <>
                <div className="flex items-start gap-3 rounded-[10px] bg-[var(--color-error-muted)] px-4 py-3">
                  <TriangleAlert className="h-5 w-5 shrink-0 text-[var(--color-error)]" />
                  <p className="text-body text-[var(--color-text-secondary)]">
                    {(auth.error as { message?: string })?.message || 'Kirishda xatolik yuz berdi'}
                  </p>
                </div>
                <Button className="w-full" size="lg" onClick={() => auth.mutate(initData)}>
                  <RotateCw className="h-4 w-4" />
                  Qayta urinish
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center py-6">
                <RotateCw className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-caption text-[var(--color-text-muted)]">
          © 2026 Retarget ERP. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  );
}
