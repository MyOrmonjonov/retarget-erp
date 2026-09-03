'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Ported from the reference CRM's EmptyState: icon + bold title + a lighter description line,
 * instead of a single plain sentence - used everywhere a list/table has nothing to show yet. */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 px-6', className)}>
      <Icon className="h-8 w-8 mx-auto mb-3 text-[var(--color-text-muted)]" strokeWidth={1.5} />
      <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{title}</p>
      {description && <p className="mt-1.5 text-[13px] text-[var(--color-text-secondary)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
