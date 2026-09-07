'use client';

import type { TaskStatus } from '@/shared/types';
import { TASK_STATUS_LABELS } from '@/shared/types';

// Matches the Kanban board's own per-status colors (Kanban.tsx's TARGET_COLUMNS) so a task's
// status reads the same color everywhere in the app - the task list, the project detail page's
// list view, and the Kanban board itself.
export const TASK_STATUS_COLOR: Record<TaskStatus, string> = {
  BACKLOG: '#6B7280',
  TODO: '#6B7280',
  IN_PROGRESS: '#0071E3',
  EDITING: '#5856D6',
  REVIEW: '#FF9F0A',
  DONE: '#34C759',
  BLOCKED: '#FF3B30',
};

const STATUS_SELECT_OPTIONS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'EDITING', 'REVIEW', 'DONE', 'BLOCKED'];

export function InlineTaskStatusSelect({ status, onChange }: { status: TaskStatus; onChange: (status: TaskStatus) => void }) {
  const color = TASK_STATUS_COLOR[status];
  return (
    <select
      value={status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
      className="text-caption font-bold rounded-full pl-3 pr-1.5 py-1 border-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      style={{ backgroundColor: `${color}1F`, borderColor: `${color}55`, color }}
    >
      {STATUS_SELECT_OPTIONS.map((s) => (
        <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}
