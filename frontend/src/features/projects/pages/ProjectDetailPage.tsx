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
import { FilterPills } from '@/shared/components/FilterPills';
import { ArrowLeft, Plus, List, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import {
  PROJECT_STATUS_LABELS, PROJECT_PRIORITY_LABELS, PROJECT_PRIORITY_COLORS,
  TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS, TASK_STATUS_LABELS,
  type Task, type TaskStatus,
} from '@/shared/types';
import { formatShortDate } from '@/shared/lib/utils';
import { useProjects, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { ProjectForm, type ProjectFormData } from '../components/ProjectForm';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';
import { useTasks, useCreateTask, useUpdateTask, useChangeTaskStatus } from '@/features/tasks/hooks/useTasks';
import { tasksApi, type TaskDetail } from '@/features/tasks/api/tasksApi';
import { TaskForm, type TaskFormData as TaskFormValues } from '@/features/tasks/components/TaskForm';
import { useEmployees } from '@/features/employees/hooks/useEmployees';
import { ContentPlanTab } from '../components/ContentPlanTab';

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

  const currentMonth = useMemo(() => monthKey(new Date().toISOString()), []);
  const [activeMonth, setActiveMonth] = useState(currentMonth);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const availableMonths = useMemo(() => {
    const keys = new Set(projectTasks.map((t) => monthKey(t.dueDate)));
    keys.add(currentMonth);
    return Array.from(keys).sort().reverse();
  }, [projectTasks, currentMonth]);

  const monthTasks = useMemo(
    () => projectTasks.filter((t) => monthKey(t.dueDate) === activeMonth),
    [projectTasks, activeMonth]
  );

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

      <FilterPills
        options={availableMonths.map((m) => ({ value: m, label: monthLabel(m) }))}
        value={activeMonth}
        onChange={setActiveMonth}
      />

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Topshiriqlar</TabsTrigger>
          <TabsTrigger value="content-plan">Kontent reja</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-[var(--color-bg-hover)] p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-caption font-medium transition-colors ${
                    viewMode === 'kanban' ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" /> Doska
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-caption font-medium transition-colors ${
                    viewMode === 'list' ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  <List className="h-4 w-4" /> Ro'yxat
                </button>
              </div>
              <Button variant="primary" onClick={handleOpenCreateTask}>
                <Plus className="h-4 w-4" />
                Yangi vazifa
              </Button>
            </div>
            {tasksLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-[380px] w-[300px] flex-shrink-0 rounded-[14px]" />)}
              </div>
            ) : viewMode === 'kanban' ? (
              <KanbanBoard
                columns={TARGET_COLUMNS}
                tasks={monthTasks}
                onTaskMove={handleMove}
                onTaskClick={handleOpenEditTask}
              />
            ) : monthTasks.length === 0 ? (
              <Card className="py-12 text-center">
                <p className="text-[var(--color-text-secondary)]">{monthLabel(activeMonth)} uchun vazifa topilmadi</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {monthTasks.map((task) => (
                  <Card key={task.id} className="p-3 flex items-center gap-3 cursor-pointer hover:border-[var(--color-text-muted)]" onClick={() => handleOpenEditTask(task)}>
                    <p className="flex-1 min-w-0 truncate text-body text-[var(--color-text-primary)]">{task.title}</p>
                    <Badge variant={TASK_PRIORITY_COLORS[task.priority]} size="sm">{TASK_PRIORITY_LABELS[task.priority]}</Badge>
                    <Avatar name={task.assigneeName} src={task.assigneeAvatar} size="xs" />
                    <Badge size="sm">{TASK_STATUS_LABELS[task.status]}</Badge>
                    <span className="text-caption text-[var(--color-text-muted)] w-16 text-right flex-shrink-0">{formatShortDate(task.dueDate)}</span>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="content-plan">
          {id && <ContentPlanTab projectId={id} assigneeOptions={assigneeOptions} activeMonth={activeMonth} />}
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
