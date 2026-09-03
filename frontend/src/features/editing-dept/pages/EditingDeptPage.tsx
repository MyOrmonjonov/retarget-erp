'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Select } from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { Plus, Check, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { FilterPills } from '@/shared/components/FilterPills';
import type { Task, TaskStatus } from '@/shared/types';
import { TaskForm, type TaskFormData } from '@/features/tasks/components/TaskForm';
import { tasksApi, type TaskDetail, type TaskListItem } from '@/features/tasks/api/tasksApi';
import { useTasks, useCreateTask, useUpdateTask, useReassignTask, useApproveTask, useRequestTaskRevision } from '@/features/tasks/hooks/useTasks';
import { useEmployees } from '@/features/employees/hooks/useEmployees';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { useUser } from '@/features/auth/store/authStore';

const DEPARTMENT_KEYWORDS = ['montaj', 'video', 'edit'];
const VIDEO_KEYWORDS = ['video', 'montaj', 'rolik', 'reels', 'clip', 'klip'];
const UNASSIGNED_COLUMN = 'unassigned';

const MONTAJ_STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: 'Kutilmoqda',
  TODO: 'Kutilmoqda',
  IN_PROGRESS: 'Jarayonda',
  EDITING: 'Montajda',
  REVIEW: "Ko'rib chiqilmoqda",
  BLOCKED: 'Qayta ishlash',
  DONE: 'Bajarildi',
};

const MONTAJ_STATUS_COLORS: Record<TaskStatus, 'default' | 'success' | 'warning' | 'error'> = {
  BACKLOG: 'default',
  TODO: 'default',
  IN_PROGRESS: 'success',
  EDITING: 'success',
  REVIEW: 'warning',
  BLOCKED: 'error',
  DONE: 'success',
};

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

function EditorTaskCard({ task, canClaim, onClaim, onOpen, onApprove, onRequestRevision }: {
  task: TaskListItem;
  canClaim: boolean;
  onClaim: () => void;
  onOpen: () => void;
  onApprove: () => void;
  onRequestRevision: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/task-id', task.id)}
      className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-lg p-3 space-y-2 cursor-grab active:cursor-grabbing hover:border-[var(--color-text-muted)] transition-colors"
    >
      <div className="flex items-start justify-between gap-2" onClick={onOpen} role="button" tabIndex={0}>
        <p className="text-body font-medium text-[var(--color-text-primary)] line-clamp-2 cursor-pointer">{task.title}</p>
        <Badge variant={MONTAJ_STATUS_COLORS[task.status]} size="sm" className="flex-shrink-0">
          {MONTAJ_STATUS_LABELS[task.status]}
        </Badge>
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
  const reassignTask = useReassignTask();
  const approveTask = useApproveTask();
  const requestRevision = useRequestTaskRevision();

  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDetail | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

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

  const tasksByColumn = useMemo(() => {
    const grouped = new Map<string, TaskListItem[]>();
    grouped.set(UNASSIGNED_COLUMN, []);
    for (const editor of editors) grouped.set(editor.userId, []);
    for (const task of videoTasks) {
      const editorAssignee = task.assigneeIds.find((id) => editorIds.has(id));
      const columnId = editorAssignee ?? UNASSIGNED_COLUMN;
      if (!grouped.has(columnId)) grouped.set(columnId, []);
      grouped.get(columnId)!.push(task);
    }
    return grouped;
  }, [videoTasks, editors, editorIds]);

  // Ported from the reference CRM's Montaj page: KPI rewards finished videos, meeting the
  // deadline, and getting approved on the first try; each revision counts against it.
  const editorKpi = useMemo(() => {
    return editors.map((editor) => {
      const tasks = videoTasks.filter((t) => t.assigneeIds.includes(editor.userId));
      const done = tasks.filter((t) => t.status === 'DONE');
      const deadlineMet = done.filter((t) => t.finishedAt && new Date(t.finishedAt) <= new Date(t.dueDate));
      const firstApproval = done.filter((t) => t.revisionCount === 0);
      const totalRevisions = tasks.reduce((sum, t) => sum + t.revisionCount, 0);
      const kpi = Math.min(100, Math.max(0,
        done.length * 10 + deadlineMet.length * 5 + firstApproval.length * 8 - totalRevisions * 3));
      return { name: editor.fullName, kpi, done: done.length, revisions: totalRevisions, active: tasks.length - done.length };
    }).sort((a, b) => b.kpi - a.kpi);
  }, [editors, videoTasks]);

  const canSeeKpiPanel = currentUser?.role === 'CEO' || currentUser?.role === 'MENEJER' || currentUser?.role === 'BOSHQARUVCHI';

  const assigneeOptions = useMemo(() => editors.map((e) => ({ value: e.userId, label: e.fullName })), [editors]);

  const handleOpenCreateForm = useCallback(() => {
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
  }, []);

  const handleFormSubmit = useCallback(async (data: TaskFormData) => {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, data });
    } else {
      await createTask.mutateAsync(data);
    }
    handleCloseForm();
  }, [editingTask, updateTask, createTask, handleCloseForm]);

  const handleDrop = useCallback((columnId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/task-id');
    if (!taskId) return;
    reassignTask.mutate({ id: taskId, assigneeIds: columnId === UNASSIGNED_COLUMN ? [] : [columnId] });
  }, [reassignTask]);

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
        <Button variant="primary" onClick={handleOpenCreateForm}>
          <Plus className="h-4 w-4" />
          Yangi vazifa
        </Button>
      </div>

      {canSeeKpiPanel && editorKpi.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="!text-[16px] !font-bold">Montajorlar KPI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {editorKpi.map((e) => (
                <div key={e.name} className="rounded-[10px] bg-[var(--color-bg-hover)] p-3">
                  <p className="text-body font-medium text-[var(--color-text-primary)] truncate">{e.name}</p>
                  <p className="text-h2 font-bold text-[var(--color-accent)]">{e.kpi}%</p>
                  <p className="text-caption text-[var(--color-text-muted)]">
                    Bajarildi: {e.done} &middot; Faol: {e.active} &middot; Qayta: {e.revisions}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[420px] w-[300px] flex-shrink-0 rounded-[14px]" />
          ))}
        </div>
      ) : editors.length === 0 ? (
        <Card className="py-12 text-center px-6">
          <p className="text-[var(--color-text-secondary)]">
            "Montaj" departmentiga biriktirilgan xodim topilmadi. Hodimlar bo'limida xodim profilida
            departmentni "Montaj" deb belgilang.
          </p>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4" role="region" aria-label="Montaj doskasi">
          {[{ id: UNASSIGNED_COLUMN, label: 'Tayinlanmagan', avatar: undefined as string | undefined }, ...editors.map((e) => ({ id: e.userId, label: e.fullName, avatar: e.avatar }))].map((col) => {
            const tasks = tasksByColumn.get(col.id) ?? [];
            return (
              <div
                key={col.id}
                onDragOver={(e) => { e.preventDefault(); setDragOverColumn(col.id); }}
                onDragLeave={() => setDragOverColumn((c) => (c === col.id ? null : c))}
                onDrop={(e) => handleDrop(col.id, e)}
                className={`flex flex-col min-w-[300px] max-w-[300px] flex-shrink-0 rounded-lg p-2 transition-colors ${
                  dragOverColumn === col.id ? 'bg-[var(--color-accent-muted)]' : ''
                }`}
              >
                <div className="flex items-center gap-2 px-1 py-2">
                  {col.id !== UNASSIGNED_COLUMN && <Avatar name={col.label} src={col.avatar} size="xs" />}
                  <h3 className="text-caption font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    {col.label} ({tasks.length})
                  </h3>
                </div>
                <div className="flex-1 space-y-2 px-1 pb-2 min-h-[80px]">
                  {tasks.map((task) => (
                    <EditorTaskCard
                      key={task.id}
                      task={task}
                      canClaim={col.id === UNASSIGNED_COLUMN && isCurrentUserEditor}
                      onClaim={() => currentUser && reassignTask.mutate({ id: task.id, assigneeIds: [currentUser.id] })}
                      onOpen={() => handleOpenEditForm(task)}
                      onApprove={() => approveTask.mutate(task.id)}
                      onRequestRevision={() => requestRevision.mutate(task.id)}
                    />
                  ))}
                  {tasks.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-[var(--color-bg-border)] rounded-lg flex items-center justify-center text-caption text-[var(--color-text-muted)]">
                      Vazifalar yo'q
                    </div>
                  )}
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
        isLoading={isFormLoading || createTask.isPending || updateTask.isPending}
        assignees={assigneeOptions}
        groups={groups}
      />
    </div>
  );
}
