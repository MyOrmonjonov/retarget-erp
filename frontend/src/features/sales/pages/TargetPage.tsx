'use client';

import { useMemo, useState, useCallback } from 'react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { CircularProgress } from '@/shared/components/CircularProgress';
import { EmptyState } from '@/shared/components/EmptyState';
import { Plus, Target } from 'lucide-react';
import { toast } from 'sonner';
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/shared/types';
import type { Task } from '@/shared/types';
import { TaskForm, type TaskFormData } from '@/features/tasks/components/TaskForm';
import { tasksApi, type TaskDetail, type TaskListItem } from '@/features/tasks/api/tasksApi';
import { useTasks, useCreateTask, useUpdateTask } from '@/features/tasks/hooks/useTasks';
import { useEmployees } from '@/features/employees/hooks/useEmployees';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { useProjects } from '@/features/projects/hooks/useProjects';

export function TargetPage() {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: groups = [] } = useGroups();
  const { data: projects = [] } = useProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isLoading = tasksLoading || employeesLoading;

  const assigneeOptions = useMemo(
    () => employees.map((e) => ({ value: e.userId, label: e.fullName })),
    [employees]
  );
  const projectOptions = useMemo(
    () => projects.map((p) => ({ value: String(p.id), label: p.name })),
    [projects]
  );

  // The task list endpoint never includes assignee names/avatars (only ids) - resolve them
  // from the already-fetched employee list here, same as TasksPage/useDeptTasks do.
  const displayTasks = useMemo(() => {
    const byUserId = new Map(employees.map((e) => [e.userId, e]));
    return tasks.map((t) => {
      if (t.assigneeName || !t.assigneeId) return t;
      const employee = byUserId.get(t.assigneeId);
      return employee ? { ...t, assigneeName: employee.fullName, assigneeAvatar: employee.avatar } : t;
    });
  }, [tasks, employees]);

  // Ported from the reference CRM's Target bo'limi: one column per project (not a status
  // kanban) with its own progress ring, matching how the reference scopes target tasks to a
  // project rather than to a workspace-wide status board.
  const projectColumns = useMemo(() => {
    const byProject = new Map<string, { projectId: string; name: string; tasks: TaskListItem[] }>();
    for (const project of projects) {
      byProject.set(String(project.id), { projectId: String(project.id), name: project.name, tasks: [] });
    }
    for (const task of displayTasks) {
      if (!task.projectId || !byProject.has(task.projectId)) continue;
      byProject.get(task.projectId)!.tasks.push(task);
    }
    return Array.from(byProject.values()).map((col) => {
      const total = col.tasks.length;
      const done = col.tasks.filter((t) => t.status === 'DONE').length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return { ...col, total, done, pct };
    });
  }, [projects, displayTasks]);

  const overallProgress = useMemo(() => {
    const total = projectColumns.reduce((sum, c) => sum + c.total, 0);
    const done = projectColumns.reduce((sum, c) => sum + c.done, 0);
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [projectColumns]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDetail | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [createForProjectId, setCreateForProjectId] = useState<string | undefined>();

  const handleOpenCreateForm = useCallback((projectId?: string) => {
    setEditingTask(null);
    setCreateForProjectId(projectId);
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
    setCreateForProjectId(undefined);
  }, []);

  const handleFormSubmit = useCallback(async (data: TaskFormData) => {
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, data });
    } else {
      await createTask.mutateAsync({ ...data, projectId: data.projectId ?? createForProjectId });
    }
    handleCloseForm();
  }, [editingTask, updateTask, createTask, createForProjectId, handleCloseForm]);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-caption text-[var(--color-text-secondary)]">
          Loyihalar bo'yicha target vazifalari
        </p>
        <Button variant="primary" onClick={() => handleOpenCreateForm(undefined)}>
          <Plus className="h-4 w-4" />
          Yangi task
        </Button>
      </div>

      {!isLoading && (
        <Card className="p-4 inline-flex items-center gap-4 w-fit">
          <CircularProgress value={overallProgress.pct} size={64} strokeWidth={5} variant="accent" />
          <div>
            <p className="text-body font-semibold text-[var(--color-text-primary)]">Umumiy target progress</p>
            <p className="text-caption text-[var(--color-text-muted)]">{overallProgress.done}/{overallProgress.total} task bajarilgan</p>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[420px] w-[280px] flex-shrink-0 rounded-[14px]" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {projectColumns.map((col) => (
            <div key={col.projectId} className="min-w-[280px] max-w-[280px] flex-shrink-0">
              <Card className="p-3 h-full flex flex-col">
                <div className="flex items-center gap-3 pb-3 mb-3 border-b border-[var(--color-bg-border)]">
                  <CircularProgress value={col.pct} size={40} strokeWidth={4} variant="accent" showLabel={false} />
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-semibold text-[var(--color-text-primary)] truncate">{col.name}</p>
                    <p className="text-caption text-[var(--color-text-muted)]">{col.total} ta task &middot; {col.done} bajarildi</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenCreateForm(col.projectId)}
                    aria-label="Task qo'shish"
                    className="w-7 h-7 rounded-full bg-[var(--color-bg-hover)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 space-y-2 min-h-[80px]">
                  {col.tasks.length === 0 ? (
                    <div className="rounded-lg bg-[var(--color-bg-hover)] p-3 text-center">
                      <p className="text-caption text-[var(--color-text-secondary)]">Bu loyihada target task yo'q</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Yangi task qo'shib ustunni to'ldirish mumkin.</p>
                    </div>
                  ) : (
                    col.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleOpenEditForm(task)}
                        className="rounded-lg border border-[var(--color-bg-border)] bg-[var(--color-bg-surface)] p-2.5 space-y-1.5 cursor-pointer hover:border-[var(--color-text-muted)]"
                      >
                        <p className="text-caption font-medium text-[var(--color-text-primary)] line-clamp-2">{task.title}</p>
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant={TASK_PRIORITY_COLORS[task.priority]} size="sm">{TASK_PRIORITY_LABELS[task.priority]}</Badge>
                          <Avatar name={task.assigneeName} src={task.assigneeAvatar} size="xs" />
                        </div>
                        <Badge variant={TASK_STATUS_COLORS[task.status]} size="sm" dot>{TASK_STATUS_LABELS[task.status]}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          ))}
          {projectColumns.length === 0 && (
            <Card className="w-full">
              <EmptyState icon={Target} title="Hali loyiha yo'q" description="Loyiha yaratilgach, uning target tasklari shu yerda ko'rinadi." />
            </Card>
          )}
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
        projects={projectOptions}
      />
    </div>
  );
}
