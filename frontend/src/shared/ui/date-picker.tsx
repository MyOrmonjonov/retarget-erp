'use client';

import * as React from 'react';
import { format, isValid, parse } from 'date-fns';
import { uz } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { MonthCalendar } from '@/shared/components/MonthCalendar';

export interface DatePickerProps {
  /** yyyy-MM-dd, matching <input type="date">'s value shape - same as everywhere else this app
   *  passes dates around, so callers don't need to change their state handling. */
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

/** App-styled replacement for the browser's native <input type="date"> popup, built on the
 *  existing MonthCalendar grid (no external date-picker library in this project). */
export function DatePicker({ value, onChange, label, error, placeholder = 'Sanani tanlang', className, id }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const generatedId = React.useId();
  const inputId = id || generatedId;

  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : null;
  const validSelected = selectedDate && isValid(selectedDate) ? selectedDate : null;

  React.useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className="block text-body font-medium text-[var(--color-text-primary)] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={inputId}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            'w-full flex items-center justify-between gap-2 bg-[var(--color-bg-primary)] border border-[var(--color-bg-border)] rounded-md px-3 py-2 text-body text-left transition-all duration-150',
            'focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-muted)] focus:outline-none',
            'hover:border-[var(--color-text-muted)]',
            error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error-muted)]',
            className
          )}
        >
          <span className={validSelected ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}>
            {validSelected ? format(validSelected, 'd-MMMM yyyy', { locale: uz }) : placeholder}
          </span>
          <CalendarDays className="h-4 w-4 text-[var(--color-text-muted)] flex-shrink-0" />
        </button>
        {open && (
          <div className="absolute z-[var(--z-popover)] mt-1.5 p-3 bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-md shadow-lg w-[300px]">
            <MonthCalendar
              selected={validSelected ?? new Date()}
              onSelect={(date) => {
                onChange(format(date, 'yyyy-MM-dd'));
                setOpen(false);
              }}
            />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-caption text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
