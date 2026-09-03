'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LoadingScreen } from '@/shared/components/LoadingScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function AppProviders() {
  // Shows the reference CRM's boot loader on every fresh app open (Telegram Mini App
  // launches reload the page each time) - not conditioned on auth state, since a returning
  // user with a persisted session skips AuthGatePage's own loader entirely.
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 900);
    return () => clearTimeout(timer);
  }, []);

  if (booting) {
    return <LoadingScreen label="CRM yuklanmoqda..." />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster
        theme="dark"
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-bg-border)',
            color: 'var(--color-text-primary)',
          },
        }}
      />
    </QueryClientProvider>
  );
}
