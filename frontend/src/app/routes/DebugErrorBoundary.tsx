'use client';

import * as React from 'react';
import { Button } from '@/shared/ui/button';

interface State {
  hasError: boolean;
}

/** Catches a render crash anywhere under it and shows a calm, on-brand fallback instead of a
 * blank page or a router-level 404. Logs full details to the console for debugging, but never
 * shows raw error text to the viewer. */
export class DebugErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Render error caught by boundary:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-h2 text-[var(--color-text-primary)] mb-2">Nimadir xato ketdi</p>
            <p className="text-body text-[var(--color-text-secondary)] mb-6">
              Bu sahifani ko'rsatishda kutilmagan xatolik yuz berdi. Qayta urinib ko'ring.
            </p>
            <Button variant="primary" onClick={() => window.location.assign('/dashboard')}>
              Bosh sahifaga qaytish
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
