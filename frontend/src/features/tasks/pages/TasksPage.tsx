'use client';

import { useMemo, useState, useCallback } from 'react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';
import { FilterPills } from '@/shared/components/FilterPills';
import { Plus, Search, Trash2, Check, ListChecks, Paperclip, List, LayoutGrid } from 'lucide-react';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/shared/types';
import type { Task, TaskPriority, TaskStatus } from '@/shared/types';
import { KanbanBoard, TARGET_COLUMNS } from '@/shared/components/Kanban';
import { TaskForm, type TaskFormData } from '../components/TaskForm';
import type { TaskListItem, TaskDetail } from '../api/tasksApi';
import { tasksApi } from '../api/tasksApi';
import { useTasks, useCreateTask, useUpdateTask, useChangeTaskStatus, useDeleteTask } from '../hooks/useTasks';
import { useEmployees } from '@/features/employees/hooks/useEmployees';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useUser } from '@/features/auth/store/authStore';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';
import { toast } from 'sonner';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const priorityDotColor: Record<TaskPriority, string> = {
  LOW: 'bg-[var(--color-text-muted)]',
  MEDIUM: 'bg-[var(--color-warning)]',
  HIGH: 'bg-[var(--color-error)]',
  URGENT: 'bg-[var(--color-error)]',
};

const priorityTextColor: Record<TaskPriority, string> = {
  LOW: 'text-[var(--color-text-muted)]',
  MEDIUM: 'text-[var(--color-warning)]',
  HIGH: 'text-[var(--color-error)]',
  URGENT: 'text-[var(--color-error)]',
};

function isSameDay(dateStr: string, ref: Date) {
  const d = new Date(dateStr);
  return d.toDateString() === ref.toDateString();
}

type FilterValue = 'FAOL' | 'MENIKI' | 'BUGUN' | 'MUDDATI_OTGAN';

function TaskRow({ task, onEdit, onComplete, onDelete }: { task: TaskListItem; onEdit: () => void; onComplete: () => void; onDelete: () => void }) {
  const isDone = task.status === 'DONE';
  const extraAssignees = task.assigneeIds.length - 1;
  const [checklistDone, checklistTotal] = task.checklistSummary.split('/').map(Number);

  return (
    <Card className="p-4 flex items-center gap-4">
      <button
        type="button"
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          isDone ? 'bg-[var(--color-success)] border-[var(--color-success)]' : 'border-[var(--color-bg-border)]'
        }`}
        aria-label="Bajarildi deb belgilash"
        onClick={onComplete}
        disabled={isDone}
      >
        {isDone && <Check className="w-3 h-3 text-white" />}
      </button>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
        <p className="font-medium text-[var(--color-text-primary)] truncate">{task.title}</p>
        <span className="inline-flex items-center gap-2 mt-0.5">
          <span className="inline-flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${priorityDotColor[task.priority]}`} />
            <span className={`text-caption ${priorityTextColor[task.priority]}`}>{TASK_PRIORITY_LABELS[task.priority]}</span>
          </span>
          {checklistTotal > 0 && (
            <span className="inline-flex items-center gap-1 text-caption text-[var(--color-text-muted)]">
              <ListChecks className="h-3 w-3" />{checklistDone}/{checklistTotal}
            </span>
          )}
          {task.fileCount > 0 && (
            <span className="inline-flex items-center gap-1 text-caption text-[var(--color-text-muted)]">
              <Paperclip className="h-3 w-3" />{task.fileCount}
            </span>
          )}
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <Avatar name={task.assigneeName} src={task.assigneeAvatar} size="sm" />
        <span className="text-caption text-[var(--color-text-secondary)]">
          {task.assigneeName}{extraAssignees > 0 && ` +${extraAssignees}`}
        </span>
      </div>
      <span className="hidden sm:block text-caption text-[var(--color-text-muted)] w-12">
        {new Date(task.dueDate).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
      </span>
      <Badge variant={TASK_STATUS_COLORS[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
      <Button variant="ghost" size="icon" onClick={onDelete} aria-label="O'chirish">
        <Trash2 className="h-4 w-4 text-[var(--color-error)]" />
      </Button>
    </Card>
  );
}

export function TasksPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterValue>('FAOL');
  const [view, setView] = useState<'list' | 'board'>('list');

  const currentUser = useUser();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: employees = [] } = useEmployees();
  const { data: groups = [] } = useGroups();
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const changeStatus = useChangeTaskStatus();
  const deleteTask = useDeleteTask();

  const assigneeOptions = useMemo(
    () => employees.map((e) => ({ value: e.userId, label: e.fullName })),
    [employees]
  );
  const projectOptions = useMemo(
    () => projects.map((p) => ({ value: String(p.id), label: p.name })),
    [projects]
  );

  // The task list endpoint never includes assignee names/avatars (only ids) - resolve them
  // from the already-fetched employee list here rather than making per-task detail calls.
  const displayTasks = useMemo(() => {
    const byUserId = new Map(employees.map((e) => [e.userId, e]));
    return tasks.map((t) => {
      if (t.assigneeName || !t.assigneeId) return t;
      const employee = byUserId.get(t.assigneeId);
      return employee
        ? { ...t, assigneeName: employee.fullName, assigneeAvatar: employee.avatar }
        : { ...t, assigneeName: "Noma'lum" };
    });
  }, [tasks, employees]);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDetail | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Delete confirmation states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<TaskListItem | null>(null);

  const filteredTasks = useMemo(() => {
    return displayTasks.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      switch (filter) {
        case 'FAOL':
          return t.status !== 'DONE';
        case 'MENIKI':
          return currentUser != null && t.assigneeIds.includes(currentUser.id);
        case 'BUGUN':
          return isSameDay(t.dueDate, today);
        case 'MUDDATI_OTGAN':
          return new Date(t.dueDate) < today && t.status !== 'DONE';
        default:
          return true;
      }
    });
  }, [displayTasks, search, filter, currentUser]);

  const todayTasks = filteredTasks.filter((t) => isSameDay(t.dueDate, today));
  const tomorrowTasks = filteredTasks.filter((t) => isSameDay(t.dueDate, tomorrow));
  const otherTasks = filteredTasks.filter((t) => !isSameDay(t.dueDate, today) && !isSameDay(t.dueDate, tomorrow));

  const handleOpenCreateForm = useCallback(() => {
    setEditingTask(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditForm = useCallback(async (task: Task) => {
    setIsFormLoading(true);
    setIsFormOpen(true);
    try {
      const detail = await tasksApi.detail(String(task.id));
      setEditingTask(detail);
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

  const handleComplete = useCallback((task: TaskListItem) => {
    if (task.status === 'DONE') return;
    changeStatus.mutate({ id: task.id, status: 'DONE' });
  }, [changeStatus]);

  const handleMove = useCallback((taskId: string, newStatus: TaskStatus) => {
    changeStatus.mutate({ id: taskId, status: newStatus });
  }, [changeStatus]);

  const handleOpenDelete = useCallback((task: TaskListItem) => {
    setDeletingTask(task);
    setIsDeleteOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setIsDeleteOpen(false);
    setDeletingTask(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingTask) return;
    await deleteTask.mutateAsync(deletingTask.id);
    handleCloseDelete();
  }, [deletingTask, deleteTask, handleCloseDelete]);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-end">
        <Button variant="primary" onClick={handleOpenCreateForm}>
          <Plus className="h-4 w-4" />
          Yangi vazifa
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <FilterPills
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'FAOL', label: 'Faol' },
            { value: 'MENIKI', label: 'Meniki' },
            { value: 'BUGUN', label: 'Bugun' },
            { value: 'MUDDATI_OTGAN', label: "Muddati o'tgan" },
          ]}
        />
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <Input placeholder="Vazifa qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-[var(--color-bg-hover)] p-1">
          <button
            type="button"
            onClick={() => setView('list')}
            aria-label="Ro'yxat ko'rinishi"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-caption font-medium transition-colors ${
              view === 'list' ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            <List className="h-4 w-4" /> Ro'yxat
          </button>
          <button
            type="button"
            onClick={() => setView('board')}
            aria-label="Doska ko'rinishi"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-caption font-medium transition-colors ${
              view === 'board' ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            <LayoutGrid className="h-4 w-4" /> Doska
          </button>
        </div>
      </div>

      {isLoading ? (
        view === 'board' ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[380px] w-[300px] flex-shrink-0 rounded-[14px]" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[68px] w-full rounded-[14px]" />
            ))}
          </div>
        )
      ) : view === 'board' ? (
        <KanbanBoard
          columns={TARGET_COLUMNS}
          tasks={filteredTasks}
          onTaskMove={handleMove}
          onTaskClick={handleOpenEditForm}
        />
      ) : (
        <div className="space-y-6">
          {todayTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-caption font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Bugun ({todayTasks.length})
              </h3>
              {todayTasks.map((task) => (
                <TaskRow key={task.id} task={task} onEdit={() => handleOpenEditForm(task)} onComplete={() => handleComplete(task)} onDelete={() => handleOpenDelete(task)} />
              ))}
            </div>
          )}

          {tomorrowTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-caption font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Ertaga ({tomorrowTasks.length})
              </h3>
              {tomorrowTasks.map((task) => (
                <TaskRow key={task.id} task={task} onEdit={() => handleOpenEditForm(task)} onComplete={() => handleComplete(task)} onDelete={() => handleOpenDelete(task)} />
              ))}
            </div>
          )}

          {otherTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-caption font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Boshqa ({otherTasks.length})
              </h3>
              {otherTasks.map((task) => (
                <TaskRow key={task.id} task={task} onEdit={() => handleOpenEditForm(task)} onComplete={() => handleComplete(task)} onDelete={() => handleOpenDelete(task)} />
              ))}
            </div>
          )}

          {filteredTasks.length === 0 && (
            <Card className="py-12 text-center">
              <p className="text-[var(--color-text-secondary)]">Vazifalar topilmadi</p>
            </Card>
          )}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
        isLoading={isFormLoading || createTask.isPending || updateTask.isPending}
        assignees={assigneeOptions}
        groups={groups}
        projects={projectOptions}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteTask.isPending}
        title="Vazifani o'chirish"
        description="Bu vazifa doimiy o'chiriladi. Davom etishni xohlaysizmi?"
        itemName={deletingTask?.title}
      />
    </div>
  );
}
