'use client';

import * as React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Task, TaskStatus, KanbanColumn } from '@/shared/types';
import { formatShortDate } from '@/shared/lib/utils';

interface KanbanColumnProps {
  column: KanbanColumn;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  isLoading?: boolean;
}

function KanbanColumnComponent({ column, tasks, onTaskMove, isLoading }: KanbanColumnProps) {
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
              <KanbanTaskCard key={task.id} task={task} />
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
}

function KanbanTaskCard({ task }: KanbanTaskCardProps) {
  const category = task.tags?.[0];
  const extraCount = (String(task.id).split('').reduce((sum: number, ch: string) => sum + ch.charCodeAt(0), 0) % 4) + 1;
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
          'active:cursor-grabbing'
        )}
        role="listitem"
        aria-label={task.title}
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

        {/* Actions Menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="mt-1.5 px-1 text-caption text-[var(--color-text-muted)]">+{extraCount} boshqa</p>
    </div>
  );
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  isLoading?: boolean;
  className?: string;
}

export function KanbanBoard({ columns, tasks, onTaskMove, isLoading, className }: KanbanBoardProps) {
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
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

// Default column configurations for Design Dept
export const DESIGN_DEPT_COLUMNS: KanbanColumn[] = [
  { id: 'new-tz', title: 'Yangi TZ', status: 'BACKLOG', color: '#9A9A9A' },
  { id: 'in-progress', title: 'Jarayonda', status: 'IN_PROGRESS', color: '#C6FF3D' },
  { id: 'review', title: 'Ko\'rib chiqilmoqda', status: 'REVIEW', color: '#FF9F0A' },
  { id: 'approved', title: 'Tasdiqlandi', status: 'TODO', color: '#34C759' },
  { id: 'done', title: 'Yakunlandi', status: 'DONE', color: '#007AFF' },
];

// Default column configurations for Editing Dept
export const EDITING_DEPT_COLUMNS: KanbanColumn[] = [
  { id: 'pending', title: 'Kutilmoqda', status: 'BACKLOG', color: '#9A9A9A' },
  { id: 'editing', title: 'Montajda', status: 'IN_PROGRESS', color: '#C6FF3D' },
  { id: 'review', title: 'Ko\'rib chiqilmoqda', status: 'REVIEW', color: '#FF9F0A' },
  { id: 'rework', title: 'Qayta ishlash', status: 'BLOCKED', color: '#FF3B30' },
  { id: 'done', title: 'Bajarildi', status: 'DONE', color: '#34C759' },
];