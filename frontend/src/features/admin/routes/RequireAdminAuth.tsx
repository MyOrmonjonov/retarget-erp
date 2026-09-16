'use client';

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';

export function RequireAdminAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
