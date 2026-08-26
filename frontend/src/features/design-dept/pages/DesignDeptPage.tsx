'use client';

import { useState, useCallback } from 'react';
import { KanbanBoard, DESIGN_DEPT_COLUMNS } from '@/shared/components/Kanban';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Task, TaskStatus } from '@/shared/types';
import { TaskForm, type TaskFormData } from '@/features/tasks/components/TaskForm';
import { tasksApi, type TaskDetail } from '@/features/tasks/api/tasksApi';
import { useDeptTasks } from '@/features/tasks/hooks/useDeptTasks';
import { useCreateTask, useUpdateTask, useChangeTaskStatus } from '@/features/tasks/hooks/useTasks';
import { useGroups } from '@/features/groups/hooks/useGroups';

const DEPARTMENT_KEYWORDS = ['dizayn', 'design'];

export function DesignDeptPage() {
  const { displayTasks, assigneeOptions, hasDeptEmployees, isLoading } = useDeptTasks(DEPARTMENT_KEYWORDS);
  const { data: groups = [] } = useGroups();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const changeStatus = useChangeTaskStatus();

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
          "Dizayn" departmentidagi xodimlarga biriktirilgan vazifalar
        </p>
        <Button variant="primary" onClick={handleOpenCreateForm}>
          <Plus className="h-4 w-4" />
          Yangi TZ
        </Button>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[420px] w-[300px] flex-shrink-0 rounded-[14px]" />
          ))}
        </div>
      ) : !hasDeptEmployees ? (
        <Card className="py-12 text-center px-6">
          <p className="text-[var(--color-text-secondary)]">
            "Dizayn" departmentiga biriktirilgan xodim topilmadi. Hodimlar bo'limida xodim profilida
            departmentni "Dizayn" deb belgilang.
          </p>
        </Card>
      ) : (
        <KanbanBoard
          columns={DESIGN_DEPT_COLUMNS}
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
