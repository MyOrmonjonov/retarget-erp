'use client';

import { useMemo, useState, useCallback } from 'react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { FilterPills } from '@/shared/components/FilterPills';
import { Plus, Search, Trash2 } from 'lucide-react';
import type { Task } from '@/shared/types';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/shared/types';
import { TaskForm } from '../components/TaskForm';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';

const CURRENT_USER_ID = '1';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const iso = (d: Date, time: string) => `${d.toISOString().slice(0, 10)}T${time}:00`;

const mockTasks: Task[] = [
  { id: '1', title: 'Instagram post dizayni', description: '', priority: 'HIGH', status: 'IN_PROGRESS', assigneeId: '1', assigneeName: 'Nodira', assigneeAvatar: undefined, projectId: '1', projectName: 'Coffee Lab', dueDate: iso(today, '18:00'), createdAt: '', updatedAt: '' },
  { id: '2', title: 'Mijoz bilan qo\'ng\'iroq', description: '', priority: 'MEDIUM', status: 'TODO', assigneeId: '2', assigneeName: 'Aziz', assigneeAvatar: undefined, projectId: '2', projectName: 'UrbanFit', dueDate: iso(today, '15:30'), createdAt: '', updatedAt: '' },
  { id: '3', title: 'Video export qilish', description: '', priority: 'LOW', status: 'BLOCKED', assigneeId: '3', assigneeName: 'Bekzod', assigneeAvatar: undefined, projectId: '3', projectName: 'NovaTech', dueDate: iso(today, '20:00'), createdAt: '', updatedAt: '' },
  { id: '4', title: 'Reklama byudjetini yangilash', description: '', priority: 'MEDIUM', status: 'TODO', assigneeId: '2', assigneeName: 'Aziz', assigneeAvatar: undefined, projectId: '1', projectName: 'Coffee Lab', dueDate: iso(tomorrow, '12:00'), createdAt: '', updatedAt: '' },
  { id: '5', title: 'Syomka rejasini tasdiqlash', description: '', priority: 'HIGH', status: 'TODO', assigneeId: '1', assigneeName: 'Nodira', assigneeAvatar: undefined, projectId: '3', projectName: 'NovaTech', dueDate: iso(tomorrow, '10:00'), createdAt: '', updatedAt: '' },
];

const mockAssignees = [
  { value: '1', label: 'Nodira' },
  { value: '2', label: 'Aziz' },
  { value: '3', label: 'Bekzod' },
];

const mockProjects = [
  { value: '1', label: 'Coffee Lab' },
  { value: '2', label: 'UrbanFit' },
  { value: '3', label: 'NovaTech' },
];

const priorityDotColor: Record<Task['priority'], string> = {
  LOW: 'bg-[var(--color-text-muted)]',
  MEDIUM: 'bg-[var(--color-warning)]',
  HIGH: 'bg-[var(--color-error)]',
  URGENT: 'bg-[var(--color-error)]',
};

const priorityTextColor: Record<Task['priority'], string> = {
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

function TaskRow({ task, onEdit, onDelete }: { task: Task; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card className="p-4 flex items-center gap-4">
      <button
        type="button"
        className="w-5 h-5 rounded-full border-2 border-[var(--color-bg-border)] flex-shrink-0"
        aria-label="Bajarildi deb belgilash"
        onClick={onEdit}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--color-text-primary)] truncate">{task.title}</p>
        <span className="inline-flex items-center gap-1.5 mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full ${priorityDotColor[task.priority]}`} />
          <span className={`text-caption ${priorityTextColor[task.priority]}`}>{TASK_PRIORITY_LABELS[task.priority]}</span>
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <Avatar name={task.assigneeName} src={task.assigneeAvatar} size="sm" />
        <span className="text-caption text-[var(--color-text-secondary)]">{task.assigneeName}</span>
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
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Delete confirmation states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      switch (filter) {
        case 'FAOL':
          return t.status !== 'DONE';
        case 'MENIKI':
          return t.assigneeId === CURRENT_USER_ID;
        case 'BUGUN':
          return isSameDay(t.dueDate, today);
        case 'MUDDATI_OTGAN':
          return new Date(t.dueDate) < today && t.status !== 'DONE';
        default:
          return true;
      }
    });
  }, [tasks, search, filter]);

  const todayTasks = filteredTasks.filter((t) => isSameDay(t.dueDate, today));
  const tomorrowTasks = filteredTasks.filter((t) => isSameDay(t.dueDate, tomorrow));
  const otherTasks = filteredTasks.filter((t) => !isSameDay(t.dueDate, today) && !isSameDay(t.dueDate, tomorrow));

  const handleOpenCreateForm = useCallback(() => {
    setEditingTask(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditForm = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingTask(null);
  }, []);

  const handleFormSubmit = useCallback(async (data: TaskFormData) => {
    setIsFormLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const estimatedHours = data.estimatedHours ? Number(data.estimatedHours) : undefined;
    const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, ...data, estimatedHours, tags, updatedAt: new Date().toISOString() }
            : t
        )
      );
    } else {
      const newTask: Task = {
        id: String(Date.now()),
        ...data,
        estimatedHours,
        tags,
        assigneeName: mockAssignees.find((a) => a.value === data.assigneeId)?.label || '',
        assigneeAvatar: undefined,
        projectName: mockProjects.find((p) => p.value === data.projectId)?.label || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    handleCloseForm();
    setIsFormLoading(false);
  }, [editingTask, handleCloseForm]);

  const handleOpenDelete = useCallback((task: Task) => {
    setDeletingTask(task);
    setIsDeleteOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setIsDeleteOpen(false);
    setDeletingTask(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingTask) return;
    setIsDeleteLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
    handleCloseDelete();
    setIsDeleteLoading(false);
  }, [deletingTask, handleCloseDelete]);

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
      </div>

      <div className="space-y-6">
        {todayTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-caption font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Bugun ({todayTasks.length})
            </h3>
            {todayTasks.map((task) => (
              <TaskRow key={task.id} task={task} onEdit={() => handleOpenEditForm(task)} onDelete={() => handleOpenDelete(task)} />
            ))}
          </div>
        )}

        {tomorrowTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-caption font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Ertaga ({tomorrowTasks.length})
            </h3>
            {tomorrowTasks.map((task) => (
              <TaskRow key={task.id} task={task} onEdit={() => handleOpenEditForm(task)} onDelete={() => handleOpenDelete(task)} />
            ))}
          </div>
        )}

        {otherTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-caption font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Boshqa ({otherTasks.length})
            </h3>
            {otherTasks.map((task) => (
              <TaskRow key={task.id} task={task} onEdit={() => handleOpenEditForm(task)} onDelete={() => handleOpenDelete(task)} />
            ))}
          </div>
        )}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-[var(--color-text-secondary)]">Vazifalar topilmadi</p>
        </Card>
      )}

      {/* Create/Edit Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
        isLoading={isFormLoading}
        assignees={mockAssignees}
        projects={mockProjects}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleteLoading}
        title="Vazifani o'chirish"
        description="Bu vazifa doimiy o'chiriladi. Davom etishni xohlaysizmi?"
        itemName={deletingTask?.title}
      />
    </div>
  );
}

// Import type for the form data
import type { TaskFormData } from '../components/TaskForm';
