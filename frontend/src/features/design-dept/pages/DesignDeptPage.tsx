'use client';

import { useState, useCallback, useMemo } from 'react';
import { KanbanBoard, DESIGN_DEPT_COLUMNS } from '@/shared/components/Kanban';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import { Select } from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { Button } from '@/shared/ui/button';
import { FilterPills } from '@/shared/components/FilterPills';
import { StatCard } from '@/shared/components/StatCard';
import { CircularProgress } from '@/shared/components/CircularProgress';
import { Plus, List, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import type { Task, TaskStatus } from '@/shared/types';
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/shared/types';
import { TaskForm, type TaskFormData } from '@/features/tasks/components/TaskForm';
import { tasksApi, type TaskDetail, type TaskListItem } from '@/features/tasks/api/tasksApi';
import { useDeptTasks } from '@/features/tasks/hooks/useDeptTasks';
import { useCreateTask, useUpdateTask, useChangeTaskStatus } from '@/features/tasks/hooks/useTasks';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { formatShortDate } from '@/shared/lib/utils';

const DEPARTMENT_KEYWORDS = ['dizayn', 'design'];

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

type StatusFilter = 'ALL' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Barchasi' },
  { value: 'IN_PROGRESS', label: 'Jarayonda' },
  { value: 'REVIEW', label: "Ko'rib chiqilmoqda" },
  { value: 'DONE', label: 'Yakunlandi' },
];

function InlineDesignStatusSelect({ task, onChange }: { task: TaskListItem; onChange: (status: TaskStatus) => void }) {
  return (
    <Select
      value={task.status}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
      className="!h-8 !py-1 text-caption w-[150px] flex-shrink-0"
      options={[
        { value: 'TODO', label: TASK_STATUS_LABELS.TODO },
        { value: 'IN_PROGRESS', label: TASK_STATUS_LABELS.IN_PROGRESS },
        { value: 'REVIEW', label: TASK_STATUS_LABELS.REVIEW },
        { value: 'DONE', label: TASK_STATUS_LABELS.DONE },
        { value: 'BLOCKED', label: TASK_STATUS_LABELS.BLOCKED },
      ]}
    />
  );
}

export function DesignDeptPage() {
  const { displayTasks, assigneeOptions, hasDeptEmployees, isLoading } = useDeptTasks(DEPARTMENT_KEYWORDS);
  const { data: groups = [] } = useGroups();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const changeStatus = useChangeTaskStatus();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDetail | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [projectFilter, setProjectFilter] = useState<string | null>(null);

  const currentMonth = useMemo(() => monthKey(new Date().toISOString()), []);
  const [activeMonth, setActiveMonth] = useState(currentMonth);

  const availableMonths = useMemo(() => {
    const keys = new Set(displayTasks.map((t) => monthKey(t.dueDate)));
    keys.add(currentMonth);
    return Array.from(keys).sort().reverse();
  }, [displayTasks, currentMonth]);

  const monthTasks = useMemo(
    () => displayTasks.filter((t) => monthKey(t.dueDate) === activeMonth),
    [displayTasks, activeMonth]
  );

  const overallStats = useMemo(() => {
    const total = monthTasks.length;
    const inProgress = monthTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const review = monthTasks.filter((t) => t.status === 'REVIEW').length;
    const done = monthTasks.filter((t) => t.status === 'DONE').length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, inProgress, review, done, pct };
  }, [monthTasks]);

  const projectGroups = useMemo(() => {
    const byProject = new Map<string, { projectId: string; name: string; tasks: TaskListItem[] }>();
    for (const task of monthTasks) {
      if (!task.projectId) continue;
      if (!byProject.has(task.projectId)) {
        byProject.set(task.projectId, { projectId: task.projectId, name: task.projectName || 'Loyiha', tasks: [] });
      }
      byProject.get(task.projectId)!.tasks.push(task);
    }
    return Array.from(byProject.values())
      .map((group) => {
        const total = group.tasks.length;
        const done = group.tasks.filter((t) => t.status === 'DONE').length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const counts = new Map<TaskStatus, number>();
        for (const t of group.tasks) counts.set(t.status, (counts.get(t.status) ?? 0) + 1);
        const dominant = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'TODO';
        return { ...group, total, done, pct, dominant };
      })
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  }, [monthTasks]);

  const kanbanTasks = useMemo(
    () => (projectFilter ? monthTasks.filter((t) => t.projectId === projectFilter) : monthTasks),
    [monthTasks, projectFilter]
  );

  const listGroups = useMemo(() => {
    const groups = projectFilter ? projectGroups.filter((g) => g.projectId === projectFilter) : projectGroups;
    if (statusFilter === 'ALL') return groups;
    return groups
      .map((g) => ({ ...g, tasks: g.tasks.filter((t) => t.status === statusFilter) }))
      .filter((g) => g.tasks.length > 0);
  }, [projectGroups, projectFilter, statusFilter]);

  // Ported from the reference CRM's Design page: per-designer load, normalized against
  // whoever on the team currently has the most design tasks this month (not a fixed cap).
  const designerLoad = useMemo(() => {
    const counts = new Map<string, number>();
    for (const task of monthTasks) {
      for (const id of task.assigneeIds) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    const maxTotal = Math.max(...assigneeOptions.map((a) => counts.get(a.value) ?? 0), 0);
    return assigneeOptions
      .map((a) => {
        const total = counts.get(a.value) ?? 0;
        return { name: a.label, total, loadPct: maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0 };
      })
      .sort((a, b) => b.loadPct - a.loadPct);
  }, [monthTasks, assigneeOptions]);

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

      <FilterPills
        options={availableMonths.map((m) => ({ value: m, label: monthLabel(m) }))}
        value={activeMonth}
        onChange={setActiveMonth}
      />

      {!isLoading && hasDeptEmployees && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex items-center justify-center py-4">
            <CircularProgress value={overallStats.pct} size={72} strokeWidth={5} variant="accent" />
          </Card>
          <StatCard title="Jami TZ" value={overallStats.total} subtitle={`${projectGroups.length} ta loyiha`} />
          <StatCard title="Jarayonda" value={overallStats.inProgress} subtitle={`Tasdiq kutmoqda: ${overallStats.review}`} />
          <StatCard title="Yakunlandi" value={overallStats.done} valueClassName="text-[var(--color-success)]" />
        </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <p className="text-body font-semibold text-[var(--color-text-primary)]">
                {projectFilter ? projectGroups.find((g) => g.projectId === projectFilter)?.name ?? 'Barcha TZlar' : 'Barcha TZlar'}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {viewMode === 'list' && (
                  <FilterPills options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
                )}
                <div className="flex items-center gap-1 rounded-lg bg-[var(--color-bg-hover)] p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('kanban')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-caption font-medium transition-colors ${
                      viewMode === 'kanban' ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-secondary)]'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" /> Kanban
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
              </div>
            </div>

            {viewMode === 'list' && projectFilter && (
              <button
                type="button"
                onClick={() => setProjectFilter(null)}
                className="text-caption font-medium text-[var(--color-accent)] mb-3"
              >
                ← Barcha loyihalarga qaytish
              </button>
            )}

            {viewMode === 'kanban' ? (
              <KanbanBoard
                columns={DESIGN_DEPT_COLUMNS}
                tasks={kanbanTasks}
                onTaskMove={handleMove}
                onTaskClick={handleOpenEditForm}
              />
            ) : listGroups.length === 0 ? (
              <p className="text-center text-[var(--color-text-secondary)] py-12">
                {monthLabel(activeMonth)} uchun mos TZ topilmadi
              </p>
            ) : (
              <div className="space-y-5">
                {listGroups.map((group) => (
                  <div key={group.projectId}>
                    <div className="flex items-center gap-3 pb-2 mb-2 border-b border-[var(--color-bg-border)]">
                      <CircularProgress value={group.pct} size={36} strokeWidth={4} variant="accent" showLabel={false} />
                      <div className="flex-1 min-w-0">
                        <p className="text-body font-semibold text-[var(--color-text-primary)] truncate">{group.name}</p>
                        <p className="text-caption text-[var(--color-text-muted)]">{group.total} ta TZ &middot; {group.done} bajarildi</p>
                      </div>
                      <Badge variant={TASK_STATUS_COLORS[group.dominant]} size="sm">{TASK_STATUS_LABELS[group.dominant]}</Badge>
                    </div>
                    <div className="space-y-1">
                      {group.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-[var(--color-bg-hover)] cursor-pointer"
                          onClick={() => handleOpenEditForm(task)}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${task.status === 'DONE' ? 'bg-[var(--color-success)]' : task.status === 'REVIEW' ? 'bg-[var(--color-warning)]' : task.status === 'BLOCKED' ? 'bg-[var(--color-error)]' : 'bg-[var(--color-accent)]'}`} />
                          <p className={`flex-1 min-w-0 truncate text-body ${task.status === 'DONE' ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'}`}>
                            {task.title}
                          </p>
                          <Badge variant={TASK_PRIORITY_COLORS[task.priority]} size="sm">{TASK_PRIORITY_LABELS[task.priority]}</Badge>
                          <Avatar name={task.assigneeName} src={task.assigneeAvatar} size="xs" />
                          <div onClick={(e) => e.stopPropagation()}>
                            <InlineDesignStatusSelect task={task} onChange={(status) => handleMove(task.id, status)} />
                          </div>
                          <span className="text-caption text-[var(--color-text-muted)] w-16 text-right flex-shrink-0">
                            {formatShortDate(task.dueDate)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="!text-[16px] !font-bold">Loyihalar bo'yicha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  type="button"
                  onClick={() => setProjectFilter(null)}
                  className={`w-full flex items-center gap-3 p-2 rounded-md border text-left ${
                    projectFilter === null ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]' : 'border-transparent bg-[var(--color-bg-hover)]'
                  }`}
                >
                  <CircularProgress value={overallStats.pct} size={44} strokeWidth={4} variant="accent" showLabel={false} />
                  <div className="flex-1 min-w-0">
                    <p className="text-caption font-semibold text-[var(--color-text-primary)]">Barchasi</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{overallStats.done}/{overallStats.total} TZ bajarildi</p>
                    <Progress value={overallStats.pct} max={100} variant="accent" size="sm" className="mt-1.5" />
                  </div>
                </button>
                {projectGroups.map((group) => (
                  <button
                    key={group.projectId}
                    type="button"
                    onClick={() => setProjectFilter((cur) => (cur === group.projectId ? null : group.projectId))}
                    className={`w-full flex items-center gap-3 p-2 rounded-md border text-left ${
                      projectFilter === group.projectId ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]' : 'border-transparent bg-[var(--color-bg-hover)]'
                    }`}
                  >
                    <CircularProgress value={group.pct} size={44} strokeWidth={4} variant="accent" showLabel={false} />
                    <div className="flex-1 min-w-0">
                      <p className="text-caption font-semibold text-[var(--color-text-primary)] truncate">{group.name}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{group.done}/{group.total} TZ bajarildi</p>
                      <Progress value={group.pct} max={100} variant="accent" size="sm" className="mt-1.5" />
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {designerLoad.length > 0 && (
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
          </div>
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
        showDesignFields
      />
    </div>
  );
}
