import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-body font-medium text-[var(--color-text-primary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full bg-[var(--color-bg-primary)] border border-[var(--color-bg-border)] rounded-md px-3 py-2 text-body text-[var(--color-text-primary)] transition-all duration-150 resize-y min-h-[80px]',
            'placeholder:text-[var(--color-text-muted)]',
            'focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-muted)] focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:border-[var(--color-text-muted)]',
            error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error-muted)]',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1.5 text-caption text-[var(--color-error)]" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="mt-1.5 text-caption text-[var(--color-text-muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };