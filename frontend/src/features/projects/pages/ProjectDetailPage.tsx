'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import { Skeleton } from '@/shared/ui/skeleton';
import { CircularProgress } from '@/shared/components/CircularProgress';
import { KanbanBoard, TARGET_COLUMNS } from '@/shared/components/Kanban';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  PROJECT_STATUS_LABELS, PROJECT_PRIORITY_LABELS, PROJECT_PRIORITY_COLORS,
  type Task, type TaskStatus,
} from '@/shared/types';
import { useProjects, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { ProjectForm, type ProjectFormData } from '../components/ProjectForm';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';
import { useTasks, useCreateTask, useUpdateTask, useChangeTaskStatus } from '@/features/tasks/hooks/useTasks';
import { tasksApi, type TaskDetail } from '@/features/tasks/api/tasksApi';
import { TaskForm, type TaskFormData as TaskFormValues } from '@/features/tasks/components/TaskForm';
import { useEmployees } from '@/features/employees/hooks/useEmployees';
import { ContentPlanTab } from '../components/ContentPlanTab';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const project = projects.find((p) => String(p.id) === id);

  const { data: allTasks = [], isLoading: tasksLoading } = useTasks();
  const { data: employees = [] } = useEmployees();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const changeStatus = useChangeTaskStatus();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDetail | null>(null);
  const [isTaskFormLoading, setIsTaskFormLoading] = useState(false);

  const byUserId = useMemo(() => new Map(employees.map((e) => [e.userId, e])), [employees]);
  const projectTasks = useMemo(() => {
    return allTasks
      .filter((t) => t.projectId === id)
      .map((t) => {
        if (t.assigneeName || !t.assigneeId) return t;
        const employee = byUserId.get(t.assigneeId);
        return employee ? { ...t, assigneeName: employee.fullName, assigneeAvatar: employee.avatar } : t;
      });
  }, [allTasks, id, byUserId]);

  const assigneeOptions = useMemo(() => employees.map((e) => ({ value: e.userId, label: e.fullName })), [employees]);

  const handleMove = useCallback((taskId: string, newStatus: TaskStatus) => {
    changeStatus.mutate({ id: taskId, status: newStatus });
  }, [changeStatus]);

  const handleOpenCreateTask = useCallback(() => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  }, []);

  const handleOpenEditTask = useCallback(async (task: Task) => {
    setIsTaskFormLoading(true);
    setIsTaskFormOpen(true);
    try {
      setEditingTask(await tasksApi.detail(String(task.id)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Vazifa ma'lumotini olishda xatolik yuz berdi");
      setIsTaskFormOpen(false);
    } finally {
      setIsTaskFormLoading(false);
    }
  }, []);

  const handleCloseTaskForm = useCallback(() => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
  }, []);

  const handleTaskFormSubmit = useCallback(async (data: TaskFormValues) => {
    const withProject = { ...data, projectId: data.projectId ?? id };
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, data: withProject });
    } else {
      await createTask.mutateAsync(withProject);
    }
    handleCloseTaskForm();
  }, [editingTask, updateTask, createTask, handleCloseTaskForm, id]);

  const handleEditSubmit = useCallback(async (data: ProjectFormData) => {
    if (!id) return;
    await updateProject.mutateAsync({ id, data });
    setIsEditOpen(false);
  }, [id, updateProject]);

  const handleConfirmDelete = useCallback(async () => {
    if (!id) return;
    await deleteProject.mutateAsync(id);
    navigate('/projects');
  }, [id, deleteProject, navigate]);

  if (projectsLoading) {
    return (
      <div className="space-y-6 animate-in">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <Card className="py-12 text-center">
        <p className="text-[var(--color-text-secondary)]">Loyiha topilmadi</p>
        <Button variant="secondary" onClick={() => navigate('/projects')} className="mt-4 mx-auto">
          Loyihalarga qaytish
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <button
        type="button"
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-caption text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Loyihalar
      </button>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <CircularProgress value={project.progress} size={64} strokeWidth={5} variant="accent" fillColor="var(--color-bg-hover)" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-h2 font-bold text-[var(--color-text-primary)]">{project.name}</h1>
                <Badge variant={PROJECT_PRIORITY_COLORS[project.priority]} size="sm">
                  {PROJECT_PRIORITY_LABELS[project.priority]}
                </Badge>
              </div>
              <p className="text-caption text-[var(--color-text-secondary)] mt-1">
                {project.client} &middot; {PROJECT_STATUS_LABELS[project.status]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setIsEditOpen(true)}>Tahrirlash</Button>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(true)} className="text-[var(--color-error)]">
              O'chirish
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 pt-5 border-t border-[var(--color-bg-border)]">
          <span className="flex items-center gap-1.5 text-caption text-[var(--color-text-secondary)]">
            <Avatar name={project.managerName} src={project.managerAvatar} size="xs" />
            Mas'ul: {project.managerName}
          </span>
          {project.team.length > 0 && (
            <div className="flex items-center">
              {project.team.map((member, index) => (
                <div key={member.userId} style={{ marginLeft: index ? -8 : 0 }} className="ring-2 ring-[var(--color-bg-surface)] rounded-full">
                  <Avatar name={member.name} src={member.avatar} size="xs" />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Topshiriqlar</TabsTrigger>
          <TabsTrigger value="content-plan">Kontent reja</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="primary" onClick={handleOpenCreateTask}>
                <Plus className="h-4 w-4" />
                Yangi vazifa
              </Button>
            </div>
            {tasksLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[380px] w-[300px] flex-shrink-0 rounded-[14px]" />)}
              </div>
            ) : (
              <KanbanBoard
                columns={TARGET_COLUMNS}
                tasks={projectTasks}
                onTaskMove={handleMove}
                onTaskClick={handleOpenEditTask}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="content-plan">
          {id && <ContentPlanTab projectId={id} assigneeOptions={assigneeOptions} />}
        </TabsContent>
      </Tabs>

      <ProjectForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={project}
        isLoading={updateProject.isPending}
        employees={assigneeOptions}
      />

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={handleCloseTaskForm}
        onSubmit={handleTaskFormSubmit}
        initialData={editingTask}
        isLoading={isTaskFormLoading || createTask.isPending || updateTask.isPending}
        assignees={assigneeOptions}
      />

      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteProject.isPending}
        title="Loyihani o'chirish"
        description="Bu loyiha doimiy o'chiriladi. Davom etishni xohlaysizmi?"
        itemName={project.name}
      />
    </div>
  );
}
