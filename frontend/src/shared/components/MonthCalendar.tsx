'use client';

import { useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { uz } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

const WEEKDAY_LABELS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sh', 'Ya'];

export interface MonthCalendarProps {
  selected: Date;
  onSelect: (date: Date) => void;
  /** Optional per-day marker (e.g. a status dot) - keyed by 'yyyy-MM-dd'. */
  markers?: Record<string, 'success' | 'warning' | 'error'>;
  /** Fires whenever the visible month changes (prev/next), so a caller whose markers depend on
   *  the visible month (fetched per-month) can refetch for the new range. */
  onMonthChange?: (monthStart: Date) => void;
  className?: string;
}

const MARKER_COLOR: Record<'success' | 'warning' | 'error', string> = {
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  error: 'bg-[var(--color-error)]',
};

/** A self-contained month-grid date picker (no external calendar library in this project) -
 * used wherever browsing/jumping to an arbitrary past date beats stepping day-by-day. */
export function MonthCalendar({ selected, onSelect, markers, onMonthChange, className }: MonthCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(selected));

  const changeMonth = (next: Date) => {
    setVisibleMonth(next);
    onMonthChange?.(next);
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 }),
  });

  return (
    <div className={cn('select-none', className)}>
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" onClick={() => changeMonth(subMonths(visibleMonth, 1))} aria-label="Oldingi oy">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="text-body font-semibold text-[var(--color-text-primary)] capitalize">
          {format(visibleMonth, 'LLLL yyyy', { locale: uz })}
        </p>
        <Button variant="ghost" size="icon" onClick={() => changeMonth(addMonths(visibleMonth, 1))} aria-label="Keyingi oy">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-caption font-medium text-[var(--color-text-muted)] py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const marker = markers?.[key];
          const inMonth = isSameMonth(day, visibleMonth);
          const active = isSameDay(day, selected);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(day)}
              className={cn(
                'relative aspect-square rounded-lg text-caption font-medium transition-colors flex items-center justify-center',
                !inMonth && 'text-[var(--color-text-muted)]/50',
                inMonth && !active && 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]',
                active && 'bg-[var(--color-accent)] text-white font-bold',
                !active && isToday(day) && 'ring-2 ring-[var(--color-accent)] ring-inset'
              )}
            >
              {format(day, 'd')}
              {marker && !active && (
                <span className={cn('absolute bottom-1 h-1.5 w-1.5 rounded-full', MARKER_COLOR[marker])} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
