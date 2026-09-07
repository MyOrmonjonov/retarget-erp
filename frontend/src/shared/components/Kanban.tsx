'use client';

import * as React from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import type { Task, TaskStatus, KanbanColumn } from '@/shared/types';
import { formatShortDate } from '@/shared/lib/utils';
import { useUser } from '@/features/auth/store/authStore';

/** CEO can drag any card; everyone else can only move tasks assigned to them. */
function useCanDragTask(task: Task): boolean {
  const user = useUser();
  if (!user) return false;
  return user.role === 'CEO' || task.assigneeId === user.id;
}

interface KanbanColumnProps {
  column: KanbanColumn;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  isLoading?: boolean;
}

function KanbanColumnComponent({ column, tasks, onTaskClick, isLoading }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      className="flex flex-col min-w-[300px] max-w-[300px] min-h-[160px] flex-shrink-0 rounded-xl border"
      style={{ backgroundColor: `${column.color}14`, borderColor: `${column.color}33` }}
    >
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

      {/* Tasks List - also the column's drop zone, so dropping on empty space (not just on
          another card) still resolves to this column */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex-1 overflow-y-auto space-y-2 px-2 pb-3 pr-3 rounded-lg transition-colors',
            isOver && 'bg-[var(--color-accent-muted)]/40'
          )}
          role="list"
          aria-label={`${column.title} vazifalari`}
        >
          {tasks.map((task) => (
            <KanbanTaskCard key={task.id} task={task} onClick={onTaskClick ? () => onTaskClick(task) : undefined} />
          ))}

          {/* Empty State / Drop Zone */}
          {tasks.length === 0 && !isLoading && (
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
      </SortableContext>
    </div>
  );
}

interface KanbanTaskCardProps {
  task: Task;
  onClick?: () => void;
  isDragging?: boolean;
  canDrag?: boolean;
}

function KanbanTaskCardBody({ task, onClick, isDragging, canDrag = true }: KanbanTaskCardProps) {
  const category = task.tags?.[0];
  const hasProgress = !!task.estimatedHours && task.loggedHours !== undefined;
  const progressPct = hasProgress
    ? Math.min(100, Math.round(((task.loggedHours ?? 0) / (task.estimatedHours ?? 1)) * 100))
    : 0;

  return (
    <div
      className={cn(
        'group relative bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-lg p-3 transition-all duration-200',
        'hover:shadow-lg hover:border-[var(--color-text-muted)]',
        onClick && 'cursor-pointer',
        canDrag && 'cursor-grab active:cursor-grabbing',
        isDragging && 'shadow-xl'
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
  );
}

function KanbanTaskCard({ task, onClick }: KanbanTaskCardProps) {
  const canDrag = useCanDragTask(task);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !canDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      title={canDrag ? undefined : "Faqat o'zingizga tegishli vazifalarni ko'chirish mumkin"}
      {...attributes}
      {...listeners}
    >
      <KanbanTaskCardBody task={task} onClick={onClick} canDrag={canDrag} />
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

  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const tasksByColumn = React.useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    columns.forEach((col) => {
      grouped[col.id] = tasks.filter((t) => t.status === col.status);
    });
    return grouped;
  }, [columns, tasks]);

  // Maps every visible task id to the id of the column it's currently rendered in, so a drop
  // landing on another task (rather than empty column space) can still resolve its column.
  const taskColumnId = React.useMemo(() => {
    const map = new Map<string, string>();
    columns.forEach((col) => {
      tasksByColumn[col.id].forEach((t) => map.set(String(t.id), col.id));
    });
    return map;
  }, [columns, tasksByColumn]);

  const columnIds = React.useMemo(() => new Set(columns.map((c) => c.id)), [columns]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const overId = String(over.id);
    const targetColumnId = columnIds.has(overId) ? overId : taskColumnId.get(overId);
    if (!targetColumnId) return;

    const targetColumn = columns.find((c) => c.id === targetColumnId);
    if (!targetColumn) return;

    const currentColumnId = taskColumnId.get(taskId);
    if (currentColumnId === targetColumnId) return;

    onTaskMove(taskId, targetColumn.status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
            onTaskClick={onTaskClick}
            isLoading={isLoading}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="max-w-[284px]">
            <KanbanTaskCardBody task={activeTask} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// Default column configurations for Design Dept - status values match the backend's real
// task statuses 1:1 (via shared/types' TaskStatus mapping) so real tasks land in a column;
// there's no backend concept of a separate "approved" sub-stage before IN_PROGRESS.
export const DESIGN_DEPT_COLUMNS: KanbanColumn[] = [
  { id: 'new-tz', title: 'Yangi TZ', status: 'TODO', color: '#6B7280' },
  { id: 'in-progress', title: 'Jarayonda', status: 'IN_PROGRESS', color: '#0071E3' },
  { id: 'review', title: 'Ko\'rib chiqilmoqda', status: 'REVIEW', color: '#FF9F0A' },
  { id: 'blocked', title: 'Bloklangan', status: 'BLOCKED', color: '#FF3B30' },
  { id: 'done', title: 'Yakunlandi', status: 'DONE', color: '#34C759' },
];

// Default column configurations for Editing Dept
export const EDITING_DEPT_COLUMNS: KanbanColumn[] = [
  { id: 'pending', title: 'Kutilmoqda', status: 'TODO', color: '#6B7280' },
  { id: 'editing', title: 'Montajda', status: 'IN_PROGRESS', color: '#0071E3' },
  { id: 'review', title: 'Ko\'rib chiqilmoqda', status: 'REVIEW', color: '#FF9F0A' },
  { id: 'rework', title: 'Qayta ishlash', status: 'BLOCKED', color: '#FF3B30' },
  { id: 'done', title: 'Bajarildi', status: 'DONE', color: '#34C759' },
];

// Default column configurations for the Target (all-tasks) board
export const TARGET_COLUMNS: KanbanColumn[] = [
  { id: 'new', title: 'Yangi', status: 'TODO', color: '#6B7280' },
  { id: 'in-progress', title: 'Jarayonda', status: 'IN_PROGRESS', color: '#0071E3' },
  { id: 'editing', title: 'Montajda', status: 'EDITING', color: '#5856D6' },
  { id: 'review', title: 'Ko\'rib chiqilmoqda', status: 'REVIEW', color: '#FF9F0A' },
  { id: 'blocked', title: 'Bloklangan', status: 'BLOCKED', color: '#FF3B30' },
  { id: 'done', title: 'Bajarildi', status: 'DONE', color: '#34C759' },
];
