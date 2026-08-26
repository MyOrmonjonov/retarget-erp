'use client';

import { cn } from '@/shared/lib/utils';

export interface FilterPillOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterPillsProps<T extends string> {
  options: FilterPillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterPills<T extends string>({ options, value, onChange, className }: FilterPillsProps<T>) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-body font-medium transition-colors',
              isActive
                ? 'bg-[var(--color-accent)] text-[var(--color-bg-primary)]'
                : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-bg-border)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={cn('text-caption', isActive ? 'opacity-70' : 'text-[var(--color-text-muted)]')}>
                ({option.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
