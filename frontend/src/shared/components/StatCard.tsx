'use client';

import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  valueClassName?: string;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  valueClassName,
  isLoading = false,
  className,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-5 space-y-2.5">
          <Skeleton className="h-3 w-1/2 rounded" />
          <Skeleton className="h-7 w-1/3 rounded" />
          <Skeleton className="h-3 w-2/3 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-5">
        <p className="text-[12px] text-[var(--color-text-secondary)]">{title}</p>
        <p className={cn('mt-1.5 text-[28px] font-bold leading-tight text-[var(--color-text-primary)]', valueClassName)}>{value}</p>
        {subtitle && <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
