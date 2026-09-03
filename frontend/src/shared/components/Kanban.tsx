'use client';

import * as React from 'react';
import type {
  DragEndEvent} from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import type { Task, TaskStatus, KanbanColumn } from '@/shared/types';
import { formatShortDate } from '@/shared/lib/utils';

interface KanbanColumnProps {
  column: KanbanColumn;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
  isLoading?: boolean;
}

function KanbanColumnComponent({ column, tasks, onTaskMove, onTaskClick, isLoading }: KanbanColumnProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      onTaskMove(taskId, column.status);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col min-w-[300px] max-w-[300px] flex-shrink-0">
          {/* Column Header */}
          <div className="flex items-center justify-between px-3 py-2.5">
            <h3
              className="text-caption font-semibold uppercase tracking-wider"
              style={{ color: column.color }}
            >
              {column.title} ({tasks.length})
            </h3>
            {column.limit && tasks.length >= column.limit && (
              <Badge variant="warning" size="sm">
                Limit
              </Badge>
            )}
          </div>

          {/* Tasks List */}
          <div
            className="flex-1 overflow-y-auto space-y-2 px-2 pb-4 pr-3"
            role="list"
            aria-label={`${column.title} vazifalari`}
          >
            {tasks.map((task) => (
              <KanbanTaskCard key={task.id} task={task} onClick={onTaskClick ? () => onTaskClick(task) : undefined} />
            ))}

            {/* Empty State / Drop Zone */}
            {tasks.length === 0 && (
              <div
                className="h-24 border-2 border-dashed border-[var(--color-bg-border)] rounded-lg flex items-center justify-center text-caption text-[var(--color-text-muted)] transition-colors"
                data-placeholder="true"
              >
                Vazifalar yo'q
              </div>
            )}

            {isLoading && (
              <div className="space-y-2" aria-busy="true">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-[var(--color-bg-border)]/50 rounded-lg animate-pulse" />
                ))}
              </div>
            )}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface KanbanTaskCardProps {
  task: Task;
  onClick?: () => void;
}

function KanbanTaskCard({ task, onClick }: KanbanTaskCardProps) {
  const category = task.tags?.[0];
  const hasProgress = !!task.estimatedHours && task.loggedHours !== undefined;
  const progressPct = hasProgress
    ? Math.min(100, Math.round(((task.loggedHours ?? 0) / (task.estimatedHours ?? 1)) * 100))
    : 0;

  return (
    <div>
      <div
        className={cn(
          'group relative bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-lg p-3 transition-all duration-200',
          'hover:shadow-lg hover:border-[var(--color-text-muted)]',
          onClick && 'cursor-pointer',
          'active:cursor-grabbing'
        )}
        role="listitem"
        aria-label={task.title}
        onClick={onClick}
      >
        {/* Category badge */}
        {category && (
          <Badge variant="accent" size="sm" className="mb-2">
            {category}
          </Badge>
        )}

        {/* Title */}
        <h4 className="text-body font-medium text-[var(--color-text-primary)] line-clamp-2 mb-2 pr-4">
          {task.title}
        </h4>

        {hasProgress && (
          <div className="h-1 bg-[var(--color-bg-border)] rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[var(--color-accent)]" style={{ width: `${progressPct}%` }} />
          </div>
        )}
        {!hasProgress && <div className="mb-1" />}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-caption text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1.5">
            <Avatar name={task.assigneeName} src={task.assigneeAvatar} size="xs" />
            {task.assigneeName}
          </span>
          {task.dueDate && <span>{formatShortDate(task.dueDate)}</span>}
        </div>
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
  isLoading?: boolean;
  className?: string;
}

export function KanbanBoard({ columns, tasks, onTaskMove, onTaskClick, isLoading, className }: KanbanBoardProps) {
  const tasksByColumn = React.useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    columns.forEach((col) => {
      grouped[col.id] = tasks.filter((t) => t.status === col.status);
    });
    return grouped;
  }, [columns, tasks]);

  return (
    <div
      className={cn('flex gap-4 overflow-x-auto pb-4', className)}
      role="region"
      aria-label="Kanban doskasi"
    >
      {columns.map((column) => (
        <KanbanColumnComponent
          key={column.id}
          column={column}
          tasks={tasksByColumn[column.id] || []}
          onTaskMove={onTaskMove}
          onTaskClick={onTaskClick}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

// Default column configurations for Design Dept - status values match the backend's real
// task statuses 1:1 (via shared/types' TaskStatus mapping) so real tasks land in a column;
// there's no backend concept of a separate "approved" sub-stage before IN_PROGRESS.
export const DESIGN_DEPT_COLUMNS: KanbanColumn[] = [
  { id: 'new-tz', title: 'Yangi TZ', status: 'TODO', color: '#6B7280' },
  { id: 'in-progress', title: 'Jarayonda', status: 'IN_PROGRESS', color: '#2563EB' },
  { id: 'review', title: 'Ko\'rib chiqilmoqda', status: 'REVIEW', color: '#D97706' },
  { id: 'blocked', title: 'Bloklangan', status: 'BLOCKED', color: '#DC2626' },
  { id: 'done', title: 'Yakunlandi', status: 'DONE', color: '#16A34A' },
];

// Default column configurations for Editing Dept
export const EDITING_DEPT_COLUMNS: KanbanColumn[] = [
  { id: 'pending', title: 'Kutilmoqda', status: 'TODO', color: '#6B7280' },
  { id: 'editing', title: 'Montajda', status: 'IN_PROGRESS', color: '#2563EB' },
  { id: 'review', title: 'Ko\'rib chiqilmoqda', status: 'REVIEW', color: '#D97706' },
  { id: 'rework', title: 'Qayta ishlash', status: 'BLOCKED', color: '#DC2626' },
  { id: 'done', title: 'Bajarildi', status: 'DONE', color: '#16A34A' },
];

// Default column configurations for the Target (all-tasks) board
export const TARGET_COLUMNS: KanbanColumn[] = [
  { id: 'new', title: 'Yangi', status: 'TODO', color: '#6B7280' },
  { id: 'in-progress', title: 'Jarayonda', status: 'IN_PROGRESS', color: '#2563EB' },
  { id: 'editing', title: 'Montajda', status: 'EDITING', color: '#7C3AED' },
  { id: 'review', title: 'Ko\'rib chiqilmoqda', status: 'REVIEW', color: '#D97706' },
  { id: 'blocked', title: 'Bloklangan', status: 'BLOCKED', color: '#DC2626' },
  { id: 'done', title: 'Bajarildi', status: 'DONE', color: '#16A34A' },
];