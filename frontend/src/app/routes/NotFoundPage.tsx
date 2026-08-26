'use client';

import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="text-center">
        <p className="text-h1 text-[var(--color-accent)]">404</p>
        <h1 className="mt-2 text-h2 text-[var(--color-text-primary)]">Sahifa topilmadi</h1>
        <p className="mt-2 text-body text-[var(--color-text-secondary)]">
          Siz izlagan sahifa mavjud emas yoki ko'chirilgan.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" className="mt-6">
            Bosh sahifaga qaytish
          </Button>
        </Link>
      </div>
    </div>
  );
}
