'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card } from '@/shared/ui/card';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Select } from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { Plus, Check, RotateCcw, Video } from 'lucide-react';
import { toast } from 'sonner';
import { FilterPills } from '@/shared/components/FilterPills';
import { EmptyState } from '@/shared/components/EmptyState';
import { InlineTaskStatusSelect } from '@/shared/components/InlineTaskStatusSelect';
import type { Task, TaskStatus } from '@/shared/types';
import { TaskForm, type TaskFormData } from '@/features/tasks/components/TaskForm';
import { tasksApi, type TaskDetail, type TaskListItem } from '@/features/tasks/api/tasksApi';
import { useTasks, useCreateTask, useUpdateTask, useChangeTaskStatus, useReassignTask, useApproveTask, useRequestTaskRevision, useDeleteTask } from '@/features/tasks/hooks/useTasks';
import { useEmployees } from '@/features/employees/hooks/useEmployees';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { useUser } from '@/features/auth/store/authStore';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';
import { EDITING_DEPT_KEYWORDS } from '@/shared/constants/departmentKeywords';

const DEPARTMENT_KEYWORDS = EDITING_DEPT_KEYWORDS;
const VIDEO_KEYWORDS = ['video', 'montaj', 'rolik', 'reels', 'clip', 'klip'];

const MONTAJ_STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: 'Kutilmoqda',
  TODO: 'Kutilmoqda',
  IN_PROGRESS: 'Jarayonda',
  EDITING: 'Montajda',
  REVIEW: "Ko'rib chiqilmoqda",
  BLOCKED: 'Qayta ishlash',
  DONE: 'Bajarildi',
};

// Status-based columns (not per-editor) - every status a Montaj task can be in gets its own
// column, so a task never becomes invisible just because of which status it's created with.
const MONTAJ_COLUMNS: { status: TaskStatus; color: string }[] = [
  { status: 'TODO', color: '#6B7280' },
  { status: 'IN_PROGRESS', color: '#0071E3' },
  { status: 'EDITING', color: '#5856D6' },
  { status: 'REVIEW', color: '#FF9F0A' },
  { status: 'BLOCKED', color: '#FF3B30' },
  { status: 'DONE', color: '#34C759' },
];

function isVideoTask(task: TaskListItem): boolean {
  const haystack = `${task.title} ${task.description ?? ''}`.toLowerCase();
  return VIDEO_KEYWORDS.some((k) => haystack.includes(k));
}

const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

function monthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return `${UZ_MONTHS[month - 1]} ${year}`;
}

function EditorTaskCard({ task, canClaim, onClaim, onOpen, onChangeStatus, onApprove, onRequestRevision, onDelete }: {
  task: TaskListItem;
  canClaim: boolean;
  onClaim: () => void;
  onOpen: () => void;
  onChangeStatus: (status: TaskStatus) => void;
  onApprove: () => void;
  onRequestRevision: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/task-id', task.id)}
      className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-lg p-3 space-y-2 cursor-grab active:cursor-grabbing hover:border-[var(--color-text-muted)] transition-colors"
    >
      <div className="flex items-start justify-between gap-2" onClick={onOpen} role="button" tabIndex={0}>
        <p className="text-body font-medium text-[var(--color-text-primary)] line-clamp-2 cursor-pointer">{task.title}</p>
      </div>
      <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <InlineTaskStatusSelect status={task.status} onChange={onChangeStatus} />
      </div>
      <div className="flex items-center gap-1.5 text-caption text-[var(--color-text-secondary)]">
        <Avatar name={task.assigneeName || 'Tayinlanmagan'} src={task.assigneeAvatar} size="xs" />
        <span className="truncate">{task.assigneeName || 'Tayinlanmagan'}</span>
      </div>
      {task.revisionCount > 0 && (
        <p className="text-caption text-[var(--color-warning)]">Qayta ishlangan: {task.revisionCount} marta</p>
      )}
      {canClaim && (
        <Button variant="secondary" size="sm" onClick={onClaim} className="w-full">
          Olish
        </Button>
      )}
      {task.status === 'REVIEW' && (
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={onApprove} className="flex-1">
            <Check className="h-3.5 w-3.5" />
            Bajarildi
          </Button>
          <Button variant="secondary" size="sm" onClick={onRequestRevision} className="flex-1">
            <RotateCcw className="h-3.5 w-3.5" />
            Qayta ishlash
          </Button>
        </div>
      )}
      <div className="flex items-center gap-3 pt-1">
        <button type="button" onClick={onOpen} className="text-caption font-medium text-[var(--color-accent)] hover:underline">
          Tahrirlash
        </button>
        <button type="button" onClick={onDelete} className="ml-auto text-caption font-medium text-[var(--color-error)] hover:underline">
          O'chirish
        </button>
      </div>
    </div>
  );
}

export function EditingDeptPage() {
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: groups = [] } = useGroups();
  const currentUser = useUser();
  const isLoading = tasksLoading || employeesLoading;

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const changeStatus = useChangeTaskStatus();
  const reassignTask = useReassignTask();
  const approveTask = useApproveTask();
  const requestRevision = useRequestTaskRevision();
  const deleteTask = useDeleteTask();

  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDetail | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus | undefined>(undefined);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskListItem | null>(null);

  const editors = useMemo(
    () => employees.filter((e) => DEPARTMENT_KEYWORDS.some((k) => e.department?.toLowerCase().includes(k))),
    [employees]
  );
  const byUserId = useMemo(() => new Map(employees.map((e) => [e.userId, e])), [employees]);
  const editorIds = useMemo(() => new Set(editors.map((e) => e.userId)), [editors]);
  const isCurrentUserEditor = !!currentUser && editorIds.has(currentUser.id);

  const currentMonth = useMemo(() => monthKey(new Date().toISOString()), []);
  const [activeMonth, setActiveMonth] = useState(currentMonth);

  const allVideoTasks = useMemo(() => {
    return allTasks
      .filter(isVideoTask)
      .map((t) => {
        if (t.assigneeName || !t.assigneeId) return t;
        const employee = byUserId.get(t.assigneeId);
        return employee ? { ...t, assigneeName: employee.fullName, assigneeAvatar: employee.avatar } : t;
      });
  }, [allTasks, byUserId]);

  const availableMonths = useMemo(() => {
    const keys = new Set(allVideoTasks.map((t) => monthKey(t.dueDate)));
    keys.add(currentMonth);
    return Array.from(keys).sort().reverse();
  }, [allVideoTasks, currentMonth]);

  const videoTasks = useMemo(() => {
    return allVideoTasks
      .filter((t) => monthKey(t.dueDate) === activeMonth)
      .filter((t) => statusFilter === 'ALL' || t.status === statusFilter);
  }, [allVideoTasks, activeMonth, statusFilter]);

  const tasksByStatus = useMemo(() => {
    const grouped = new Map<TaskStatus, TaskListItem[]>();
    for (const column of MONTAJ_COLUMNS) grouped.set(column.status, []);
    for (const task of videoTasks) {
      if (!grouped.has(task.status)) grouped.set(task.status, []);
      grouped.get(task.status)!.push(task);
    }
    return grouped;
  }, [videoTasks]);

  const assigneeOptions = useMemo(() => editors.map((e) => ({ value: e.userId, label: e.fullName })), [editors]);

  const handleOpenCreateForm = useCallback((status?: TaskStatus) => {
    setCreateDefaultStatus(status);
    setEditingTask(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditForm = useCallback(async (task: Task) => {
    setIsFormLoading(true);
    setIsFormOpen(true);
    try {
      setEditingTask(await tasksApi.detail(String(task.id)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Vazifa ma'lumotini olishda xatolik yuz berdi");
      setIsFormOpen(false);
    } finally {
      setIsFormLoading(false);
    }
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingTask(null);
    setCreateDefaultStatus(undefined);
  }, []);

  const handleFormSubmit = useCallback(async (data: TaskFormData) => {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, data });
    } else {
      await createTask.mutateAsync(data);
    }
    handleCloseForm();
  }, [editingTask, updateTask, createTask, handleCloseForm]);

  const handleConfirmDeleteTask = useCallback(async () => {
    if (!deletingTask) return;
    await deleteTask.mutateAsync(deletingTask.id);
    setDeletingTask(null);
  }, [deletingTask, deleteTask]);

  const handleDrop = useCallback((status: TaskStatus, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/task-id');
    if (!taskId) return;
    changeStatus.mutate({ id: taskId, status });
  }, [changeStatus]);

  return (
    <div className="space-y-6 animate-in">
      <FilterPills
        options={availableMonths.map((m) => ({ value: m, label: monthLabel(m) }))}
        value={activeMonth}
        onChange={setActiveMonth}
      />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <p className="text-caption text-[var(--color-text-secondary)]">
            Barcha loyihalardagi video/montaj vazifalari
          </p>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | TaskStatus)}
            options={[
              { value: 'ALL', label: 'Barcha statuslar' },
              { value: 'TODO', label: MONTAJ_STATUS_LABELS.TODO },
              { value: 'IN_PROGRESS', label: MONTAJ_STATUS_LABELS.IN_PROGRESS },
              { value: 'EDITING', label: MONTAJ_STATUS_LABELS.EDITING },
              { value: 'REVIEW', label: MONTAJ_STATUS_LABELS.REVIEW },
              { value: 'BLOCKED', label: MONTAJ_STATUS_LABELS.BLOCKED },
              { value: 'DONE', label: MONTAJ_STATUS_LABELS.DONE },
            ]}
            className="w-44"
          />
        </div>
        <Button variant="primary" onClick={() => handleOpenCreateForm()}>
          <Plus className="h-4 w-4" />
          Yangi vazifa
        </Button>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[420px] w-[300px] flex-shrink-0 rounded-[14px]" />
          ))}
        </div>
      ) : editors.length === 0 ? (
        <Card>
          <EmptyState
            icon={Video}
            title="Montaj departmentiga xodim biriktirilmagan"
            description={'Hodimlar bo\'limida xodim profilida departmentni "Montaj" deb belgilang.'}
          />
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 touch-pan-x kanban-scroll" role="region" aria-label="Montaj doskasi">
          {MONTAJ_COLUMNS.map((col) => {
            const tasks = tasksByStatus.get(col.status) ?? [];
            return (
              <div
                key={col.status}
                onDragOver={(e) => { e.preventDefault(); setDragOverColumn(col.status); }}
                onDragLeave={() => setDragOverColumn((c) => (c === col.status ? null : c))}
                onDrop={(e) => handleDrop(col.status, e)}
                className={`flex flex-col min-w-[300px] max-w-[300px] min-h-[160px] flex-shrink-0 rounded-xl border p-2 transition-colors ${
                  dragOverColumn === col.status
                    ? 'bg-[var(--color-accent-muted)] border-[var(--color-accent)]/40'
                    : 'bg-[var(--color-bg-hover)] border-[var(--color-bg-border)]'
                }`}
              >
                <div className="flex items-center gap-2 px-1 py-2">
                  <h3 className="text-caption font-semibold uppercase tracking-wider" style={{ color: col.color }}>
                    {MONTAJ_STATUS_LABELS[col.status]} ({tasks.length})
                  </h3>
                </div>
                <div className="flex-1 space-y-2 px-1 pb-2 min-h-[80px]">
                  {tasks.map((task) => (
                    <EditorTaskCard
                      key={task.id}
                      task={task}
                      canClaim={task.assigneeIds.length === 0 && isCurrentUserEditor}
                      onClaim={() => currentUser && reassignTask.mutate({ id: task.id, assigneeIds: [currentUser.id] })}
                      onOpen={() => handleOpenEditForm(task)}
                      onChangeStatus={(status) => changeStatus.mutate({ id: task.id, status })}
                      onApprove={() => approveTask.mutate(task.id)}
                      onRequestRevision={() => requestRevision.mutate(task.id)}
                      onDelete={() => setDeletingTask(task)}
                    />
                  ))}
                  {tasks.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-[var(--color-bg-border)] rounded-lg flex items-center justify-center text-caption text-[var(--color-text-muted)]">
                      Vazifalar yo'q
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenCreateForm(col.status)}
                    className="flex items-center justify-center gap-1.5 w-full h-10 rounded-lg border-2 border-dashed text-caption font-semibold transition-colors hover:bg-[var(--color-bg-surface)]"
                    style={{ borderColor: `${col.color}66`, color: col.color }}
                  >
                    <Plus className="h-4 w-4" />
                    Vazifa qo'shish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
        defaultStatus={createDefaultStatus}
        isLoading={isFormLoading || createTask.isPending || updateTask.isPending}
        assignees={assigneeOptions}
        groups={groups}
        deptBoardName="Montaj bo'limi"
        deptMemberIds={assigneeOptions.map((a) => a.value)}
      />

      <DeleteConfirmation
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDeleteTask}
        isLoading={deleteTask.isPending}
        title="Vazifani o'chirish"
        description="Bu vazifa arxivlanadi. Davom etishni xohlaysizmi?"
        itemName={deletingTask?.title}
      />
    </div>
  );
}
