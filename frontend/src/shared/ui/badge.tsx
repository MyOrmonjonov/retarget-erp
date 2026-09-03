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
          // Matches the reference CRM's StatusBadge/PriorityBadge: bold weight and a border
          // in the same color as the text (at reduced opacity) - a soft-fill badge with no
          // border reads flat; this border-current/25 is what makes every badge in the app
          // (variant-based or a custom style="" override) look like a bold, defined signal.
          'inline-flex items-center gap-1.5 font-bold rounded-full border border-current/25',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          // bg-current means this works identically whether the badge got its color from a
          // `variant` class or a custom `style={{ color: ... }}` override - no per-variant
          // color lookup needed.
          <span
            className={cn(
              'rounded-full bg-current flex-shrink-0',
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