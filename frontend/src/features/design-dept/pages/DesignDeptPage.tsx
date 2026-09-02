'use client';

import { useState, useCallback, useMemo } from 'react';
import { KanbanBoard, DESIGN_DEPT_COLUMNS } from '@/shared/components/Kanban';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
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

  // Ported from the reference CRM's Design page: per-designer load, normalized against
  // whoever on the team currently has the most design tasks (not a fixed cap).
  const designerLoad = useMemo(() => {
    const counts = new Map<string, number>();
    for (const task of displayTasks) {
      for (const id of task.assigneeIds) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    const maxTotal = Math.max(...assigneeOptions.map((a) => counts.get(a.value) ?? 0), 0);
    return assigneeOptions
      .map((a) => {
        const total = counts.get(a.value) ?? 0;
        return { name: a.label, total, loadPct: maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0 };
      })
      .sort((a, b) => b.loadPct - a.loadPct);
  }, [displayTasks, assigneeOptions]);

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

      {!isLoading && hasDeptEmployees && designerLoad.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="!text-[16px] !font-bold">Dizaynerlar yuklamasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {designerLoad.map((d) => (
              <div key={d.name}>
                <div className="flex items-center justify-between text-caption mb-1">
                  <span className="text-[var(--color-text-primary)]">{d.name}</span>
                  <span className="text-[var(--color-text-muted)]">{d.total} ta TZ &middot; {d.loadPct}%</span>
                </div>
                <Progress value={d.loadPct} max={100} variant="accent" size="sm" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
        showDesignFields
      />
    </div>
  );
}
