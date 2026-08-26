import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent' | 'info' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot, children, ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--color-bg-border)] text-[var(--color-text-secondary)]',
      success: 'bg-[var(--color-success-muted)] text-[var(--color-success)]',
      warning: 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]',
      error: 'bg-[var(--color-error-muted)] text-[var(--color-error)]',
      accent: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]',
      info: 'bg-[var(--color-role-supervisor)]/20 text-[var(--color-role-supervisor)]',
      outline: 'border border-[var(--color-bg-border)] bg-transparent text-[var(--color-text-secondary)]',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-[10px]',
      md: 'px-2.5 py-1 text-caption',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-full',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'rounded-full',
              variant === 'success' && 'bg-[var(--color-success)]',
              variant === 'warning' && 'bg-[var(--color-warning)]',
              variant === 'error' && 'bg-[var(--color-error)]',
              variant === 'accent' && 'bg-[var(--color-accent)]',
              variant === 'info' && 'bg-[var(--color-role-supervisor)]',
              variant === 'default' && 'bg-[var(--color-text-muted)]',
              variant === 'outline' && 'bg-[var(--color-text-muted)]',
              size === 'sm' && 'w-1.5 h-1.5',
              size === 'md' && 'w-2 h-2'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };