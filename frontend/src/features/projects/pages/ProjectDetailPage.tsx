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
import { ArrowLeft, Plus, List, LayoutGrid, FolderKanban, CheckSquare, Calendar, Users, Wallet } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { toast } from 'sonner';
import {
  PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, PROJECT_PRIORITY_LABELS, PROJECT_PRIORITY_COLORS,
  TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS, TASK_STATUS_LABELS, TASK_STATUS_COLORS,
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
import { useContentPlan } from '../hooks/useContentPlan';
import { useProjectMonths, useUpsertProjectMonth, useDeleteProjectMonth } from '../hooks/useProjectMonths';
import { ContentPlanTab } from '../components/ContentPlanTab';
import { Archive, CheckCircle2, Pencil, Trash2, Check, X } from 'lucide-react';

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
  const { data: contentItems = [] } = useContentPlan(id ?? '');
  const { data: persistedMonths = [] } = useProjectMonths(id ?? '');
  const upsertMonth = useUpsertProjectMonth(id ?? '');
  const deleteMonth = useDeleteProjectMonth(id ?? '');
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
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus | undefined>();

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
  const [isRenamingMonth, setIsRenamingMonth] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const monthMetaByKey = useMemo(
    () => new Map(persistedMonths.map((m) => [m.monthKey, m])),
    [persistedMonths]
  );

  const availableMonths = useMemo(() => {
    const keys = new Set(projectTasks.map((t) => monthKey(t.dueDate)));
    contentItems.forEach((c) => keys.add(monthKey(c.date)));
    persistedMonths.forEach((m) => keys.add(m.monthKey));
    keys.add(currentMonth);
    return Array.from(keys).sort().reverse();
  }, [projectTasks, contentItems, persistedMonths, currentMonth]);

  const monthDisplayLabel = useCallback(
    (key: string) => monthMetaByKey.get(key)?.displayName || monthLabel(key),
    [monthMetaByKey]
  );

  const activeMonthMeta = monthMetaByKey.get(activeMonth);

  const handleAddNextMonth = useCallback(() => {
    const [latestYear, latestMonth] = availableMonths[0].split('-').map(Number);
    const next = new Date(latestYear, latestMonth, 1); // JS months are 0-based, so this is +1
    const nextKey = monthKey(next.toISOString());
    upsertMonth.mutate({ monthKey: nextKey }, { onSuccess: () => setActiveMonth(nextKey) });
  }, [availableMonths, upsertMonth]);

  const handleStartRename = useCallback(() => {
    setRenameValue(monthDisplayLabel(activeMonth));
    setIsRenamingMonth(true);
  }, [activeMonth, monthDisplayLabel]);

  const handleConfirmRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== monthLabel(activeMonth)) {
      upsertMonth.mutate({ monthKey: activeMonth, data: { displayName: trimmed } });
    }
    setIsRenamingMonth(false);
  }, [activeMonth, renameValue, upsertMonth]);

  const handleToggleArchive = useCallback(() => {
    const nextStatus = activeMonthMeta?.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
    upsertMonth.mutate({ monthKey: activeMonth, data: { status: nextStatus } });
  }, [activeMonth, activeMonthMeta, upsertMonth]);

  const handleDeleteMonth = useCallback(() => {
    if (!activeMonthMeta) return;
    deleteMonth.mutate(activeMonth);
  }, [activeMonth, activeMonthMeta, deleteMonth]);

  const monthTasks = useMemo(
    () => projectTasks.filter((t) => monthKey(t.dueDate) === activeMonth),
    [projectTasks, activeMonth]
  );

  const monthContentItems = useMemo(
    () => contentItems.filter((c) => monthKey(c.date) === activeMonth),
    [contentItems, activeMonth]
  );

  const monthStats = useMemo(() => {
    const doneTasks = monthTasks.filter((t) => t.status === 'DONE').length;
    const doneContent = monthContentItems.filter((c) => c.statuses.includes('Post qilindi')).length;
    const total = monthTasks.length + monthContentItems.length;
    const done = doneTasks + doneContent;
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [monthTasks, monthContentItems]);

  const manager = byUserId.get(project?.managerId ?? '');

  const handleMove = useCallback((taskId: string, newStatus: TaskStatus) => {
    changeStatus.mutate({ id: taskId, status: newStatus });
  }, [changeStatus]);

  const handleOpenCreateTask = useCallback((status?: TaskStatus) => {
    setCreateDefaultStatus(status);
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
    setCreateDefaultStatus(undefined);
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
      <Card>
        <EmptyState
          icon={FolderKanban}
          title="Loyiha topilmadi"
          action={<Button variant="secondary" onClick={() => navigate('/projects')}>Loyihalarga qaytish</Button>}
        />
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
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-start gap-4 min-w-0">
            <CircularProgress
              value={project.progress}
              size={64}
              strokeWidth={6}
              variant={project.progress > 0 ? 'success' : 'default'}
              caption={project.progressTotal > 0 ? `${project.progressDone}/${project.progressTotal}` : undefined}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-h2 font-bold text-[var(--color-text-primary)]">{project.name}</h1>
                <Badge variant={PROJECT_STATUS_COLORS[project.status]} size="sm">
                  {PROJECT_STATUS_LABELS[project.status]}
                </Badge>
                <Badge variant={PROJECT_PRIORITY_COLORS[project.priority]} size="sm">
                  {PROJECT_PRIORITY_LABELS[project.priority]}
                </Badge>
              </div>
              <p className="text-caption text-[var(--color-text-secondary)] mt-1">
                {project.client} &middot; {project.type}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-caption text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {project.startDate ? formatShortDate(project.startDate) : '—'} &rarr; {project.deadline ? formatShortDate(project.deadline) : '—'}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {project.team.length} kishi
                </span>
                {project.budget != null && (
                  <span className="flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5" />
                    {project.budget.toLocaleString('en-US')} so'm
                  </span>
                )}
              </div>
              {project.team.length > 0 && (
                <div className="flex items-center mt-2">
                  {project.team.map((member, index) => (
                    <div key={member.userId} style={{ marginLeft: index ? -8 : 0 }} className="ring-2 ring-[var(--color-bg-surface)] rounded-full">
                      <Avatar name={member.name} src={member.avatar} size="xs" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            <div>
              <p className="text-caption text-[var(--color-text-muted)] mb-1">Manager</p>
              <div className="flex items-center gap-2">
                <Avatar name={project.managerName} src={project.managerAvatar} size="sm" />
                <div>
                  <p className="text-body font-medium text-[var(--color-text-primary)]">{project.managerName}</p>
                  {manager?.position && <p className="text-caption text-[var(--color-text-muted)]">{manager.position}</p>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(true)}>Tahrirlash</Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteOpen(true)}
                className="bg-[var(--color-error-muted)] text-[var(--color-error)] hover:bg-[var(--color-error-muted)]"
              >
                O'chirish
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <FilterPills
          options={availableMonths.map((m) => ({ value: m, label: monthDisplayLabel(m) }))}
          value={activeMonth}
          onChange={setActiveMonth}
        />
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="accent" size="sm" onClick={handleAddNextMonth}>
            <Plus className="h-4 w-4" />
            Yangi oy
          </Button>
          <Button variant="secondary" size="sm" onClick={handleStartRename}>
            <Pencil className="h-3.5 w-3.5" />
            Nomlash
          </Button>
          <Button variant="secondary" size="sm" onClick={handleToggleArchive}>
            {activeMonthMeta?.status === 'ARCHIVED' ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Faol qilish
              </>
            ) : (
              <>
                <Archive className="h-3.5 w-3.5" />
                Arxivlash
              </>
            )}
          </Button>
          {activeMonthMeta && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteMonth}
              className="bg-[var(--color-error-muted)] text-[var(--color-error)] hover:bg-[var(--color-error-muted)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              O'chirish
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="tasks">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 min-w-0">
              <CircularProgress
                value={monthStats.pct}
                size={56}
                strokeWidth={5}
                variant={monthStats.pct > 0 ? 'accent' : 'default'}
                caption={monthStats.total > 0 ? `${monthStats.done}/${monthStats.total}` : undefined}
              />
              <div className="min-w-0">
                {isRenamingMonth ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRename();
                        if (e.key === 'Escape') setIsRenamingMonth(false);
                      }}
                      className="font-bold text-[var(--color-text-primary)] bg-transparent border-b border-[var(--color-accent)] focus:outline-none min-w-0 max-w-[180px]"
                    />
                    <button type="button" onClick={handleConfirmRename} aria-label="Saqlash" className="text-[var(--color-success)]">
                      <Check className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setIsRenamingMonth(false)} aria-label="Bekor qilish" className="text-[var(--color-text-muted)]">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-[var(--color-text-primary)] truncate">{monthDisplayLabel(activeMonth)}</p>
                    {activeMonthMeta?.status === 'ARCHIVED' && <Badge size="sm">Arxiv</Badge>}
                  </div>
                )}
                <TabsList className="mt-1.5">
                  <TabsTrigger value="tasks">Topshiriqlar</TabsTrigger>
                  <TabsTrigger value="content-plan">Kontent reja</TabsTrigger>
                </TabsList>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="rounded-lg bg-[var(--color-bg-hover)] px-4 py-2.5 text-center min-w-[72px]">
                <p className="text-h3 font-bold text-[var(--color-accent)]">{monthTasks.length}</p>
                <p className="text-caption text-[var(--color-text-muted)]">Task</p>
              </div>
              <div className="rounded-lg bg-[var(--color-bg-hover)] px-4 py-2.5 text-center min-w-[72px]">
                <p className="text-h3 font-bold text-[var(--color-success)]">{monthContentItems.length}</p>
                <p className="text-caption text-[var(--color-text-muted)]">Kontent</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-bg-border)]">
            <span className="text-caption text-[var(--color-text-muted)]">{project.team.length} kishi biriktirilgan</span>
            <Badge variant={PROJECT_STATUS_COLORS[project.status]} size="sm">{PROJECT_STATUS_LABELS[project.status]}</Badge>
          </div>
        </Card>
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
              <Button variant="primary" onClick={() => handleOpenCreateTask()}>
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
                onAddTask={handleOpenCreateTask}
              />
            ) : monthTasks.length === 0 ? (
              <Card>
                <EmptyState icon={CheckSquare} title="Vazifa topilmadi" description={`${monthDisplayLabel(activeMonth)} uchun vazifa yo'q.`} />
              </Card>
            ) : (
              <div className="space-y-2">
                {monthTasks.map((task) => (
                  <Card key={task.id} className="p-3 flex items-center gap-3 cursor-pointer hover:border-[var(--color-text-muted)]" onClick={() => handleOpenEditTask(task)}>
                    <p className="flex-1 min-w-0 truncate text-body text-[var(--color-text-primary)]">{task.title}</p>
                    <Badge variant={TASK_PRIORITY_COLORS[task.priority]} size="sm">{TASK_PRIORITY_LABELS[task.priority]}</Badge>
                    <Avatar name={task.assigneeName} src={task.assigneeAvatar} size="xs" />
                    <Badge variant={TASK_STATUS_COLORS[task.status]} size="sm" dot>{TASK_STATUS_LABELS[task.status]}</Badge>
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
        defaultStatus={createDefaultStatus}
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
