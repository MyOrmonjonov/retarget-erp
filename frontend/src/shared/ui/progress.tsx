'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/shared/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'accent' | 'info';
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, value = 0, max = 100, variant = 'default', size = 'md', ...props }, ref) => {
  const variants = {
    default: 'bg-[var(--color-accent)]',
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    error: 'bg-[var(--color-error)]',
    accent: 'bg-[var(--color-accent)]',
    info: 'bg-[var(--color-role-supervisor)]',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const percentage = max > 0 ? Math.min(100, Math.max(0, ((value ?? 0) / max) * 100)) : 0;

  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      max={max}
      className={cn(
        'relative w-full overflow-hidden rounded-full bg-[var(--color-bg-border)]',
        sizes[size],
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full w-full flex-1 transition-all duration-300 ease-out rounded-full',
          variants[variant]
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };