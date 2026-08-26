import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/shared/lib/utils';

type ButtonHTMLAttributes = React.ButtonHTMLAttributes<HTMLButtonElement>;
type SlotProps = React.ComponentPropsWithoutRef<typeof Slot>;

// Merge button and slot props, avoiding duplicate 'onAbort' conflict
type MergedButtonProps = Omit<ButtonHTMLAttributes, 'color' | 'asChild'> & Omit<SlotProps, 'color'> & { asChild?: boolean };

export interface ButtonProps extends MergedButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)] disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-[var(--color-accent)] text-[var(--color-bg-primary)] hover:bg-[var(--color-accent-hover)] active:scale-[0.98] shadow-[0_0_0_1px_var(--color-accent)]',
      secondary: 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-bg-border)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-text-muted)]',
      ghost: 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]',
      destructive: 'bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90 active:scale-[0.98]',
      outline: 'border border-[var(--color-bg-border)] bg-transparent hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-text-muted)]',
      accent: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent)]/10 hover:border-[var(--color-accent)]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-caption',
      md: 'h-10 px-4 text-body',
      lg: 'h-12 px-6 text-body',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };