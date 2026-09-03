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
        <CardContent className="p-[18px] space-y-2.5">
          <Skeleton className="h-6 w-1/3 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
          <Skeleton className="h-3 w-2/3 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-[18px]">
        <p className={cn('text-[24px] font-extrabold leading-none text-[var(--color-text-primary)]', valueClassName)}>{value}</p>
        <p className="mt-2 text-[13px] font-bold text-[var(--color-text-primary)]">{title}</p>
        {subtitle && <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
