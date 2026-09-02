'use client';

import { useMemo, useState, useCallback } from 'react';
import { KanbanBoard, TARGET_COLUMNS } from '@/shared/components/Kanban';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Task, TaskStatus } from '@/shared/types';
import { TaskForm, type TaskFormData } from '@/features/tasks/components/TaskForm';
import { tasksApi, type TaskDetail } from '@/features/tasks/api/tasksApi';
import { useTasks, useCreateTask, useUpdateTask, useChangeTaskStatus } from '@/features/tasks/hooks/useTasks';
import { useEmployees } from '@/features/employees/hooks/useEmployees';
import { useGroups } from '@/features/groups/hooks/useGroups';

export function TargetPage() {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: groups = [] } = useGroups();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const changeStatus = useChangeTaskStatus();

  const isLoading = tasksLoading || employeesLoading;

  const assigneeOptions = useMemo(
    () => employees.map((e) => ({ value: e.userId, label: e.fullName })),
    [employees]
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

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDetail | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const handleMove = useCallback((taskId: string, newStatus: TaskStatus) => {
    changeStatus.mutate({ id: taskId, status: newStatus });
  }, [changeStatus]);

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

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-caption text-[var(--color-text-secondary)]">
          Barcha vazifalar status bo'yicha
        </p>
        <Button variant="primary" onClick={handleOpenCreateForm}>
          <Plus className="h-4 w-4" />
          Yangi task
        </Button>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[420px] w-[300px] flex-shrink-0 rounded-[14px]" />
          ))}
        </div>
      ) : (
        <KanbanBoard
          columns={TARGET_COLUMNS}
          tasks={displayTasks}
          onTaskMove={handleMove}
          onTaskClick={handleOpenEditForm}
        />
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
