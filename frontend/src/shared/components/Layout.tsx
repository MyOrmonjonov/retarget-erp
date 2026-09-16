'use client';

import { Outlet } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSyncEmployeeRole, useSyncPreferences } from '@/features/auth/hooks/useAuth';
import { DebugErrorBoundary } from '@/app/routes/DebugErrorBoundary';

export function Layout() {
  const { isSidebarCollapsed } = useAuthStore();
  useSyncEmployeeRole();
  useSyncPreferences();

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <Sidebar />
      <Header />
      <main
        id="main-content"
        className={cn(
          'pt-[72px] min-h-[calc(100vh-72px)] transition-all duration-300',
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        )}
        role="main"
      >
        <div className="p-4 lg:p-6 max-w-[1800px] mx-auto">
          <DebugErrorBoundary>
            <Outlet />
          </DebugErrorBoundary>
        </div>
      </main>
    </div>
  );
}