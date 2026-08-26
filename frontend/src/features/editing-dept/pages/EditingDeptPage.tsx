'use client';

import { useState, useCallback } from 'react';
import { KanbanBoard, EDITING_DEPT_COLUMNS } from '@/shared/components/Kanban';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '@/shared/types';

const mockEmployees = [
  { id: '1', fullName: 'Bekzod Tursunov' },
  { id: '2', fullName: 'Jasur Nazarov' },
];

const mockProjects = [
  { id: '1', name: 'Coffee Lab' },
  { id: '2', name: 'UrbanFit' },
  { id: '3', name: 'NovaTech' },
  { id: '4', name: 'MegaGroup' },
  { id: '5', name: 'Trendy Wear' },
];

const initialTasks: Task[] = [
  { id: '1', title: 'Coffee Lab — Reels #12', description: '', priority: 'MEDIUM', status: 'BACKLOG', assigneeId: '1', assigneeName: 'Bekzod Tursunov', assigneeAvatar: undefined, projectId: '1', projectName: 'Coffee Lab', dueDate: '2026-08-26', tags: ['Reels'], estimatedHours: 10, loggedHours: 1, createdAt: '', updatedAt: '' },
  { id: '2', title: 'Coffee Lab — Ustaxona videosi', description: '', priority: 'LOW', status: 'BACKLOG', assigneeId: '2', assigneeName: 'Jasur Nazarov', assigneeAvatar: undefined, projectId: '1', projectName: 'Coffee Lab', dueDate: '2026-08-27', tags: ['Video'], estimatedHours: 10, loggedHours: 2, createdAt: '', updatedAt: '' },
  { id: '3', title: 'UrbanFit — Winter promo', description: '', priority: 'HIGH', status: 'IN_PROGRESS', assigneeId: '2', assigneeName: 'Jasur Nazarov', assigneeAvatar: undefined, projectId: '2', projectName: 'UrbanFit', dueDate: '2026-08-27', tags: ['Video'], estimatedHours: 10, loggedHours: 6, createdAt: '', updatedAt: '' },
  { id: '4', title: 'NovaTech — Mahsulot demo', description: '', priority: 'MEDIUM', status: 'IN_PROGRESS', assigneeId: '1', assigneeName: 'Bekzod Tursunov', assigneeAvatar: undefined, projectId: '3', projectName: 'NovaTech', dueDate: '2026-08-25', tags: ['Video'], estimatedHours: 10, loggedHours: 4, createdAt: '', updatedAt: '' },
  { id: '5', title: 'Trendy Wear — Sound dizayn', description: '', priority: 'LOW', status: 'IN_PROGRESS', assigneeId: '2', assigneeName: 'Jasur Nazarov', assigneeAvatar: undefined, projectId: '5', projectName: 'Trendy Wear', dueDate: '2026-08-26', tags: ['Audio'], estimatedHours: 10, loggedHours: 5, createdAt: '', updatedAt: '' },
  { id: '6', title: 'NovaTech — Launch video', description: '', priority: 'HIGH', status: 'REVIEW', assigneeId: '1', assigneeName: 'Bekzod Tursunov', assigneeAvatar: undefined, projectId: '3', projectName: 'NovaTech', dueDate: '2026-08-25', tags: ['Video'], estimatedHours: 10, loggedHours: 9, createdAt: '', updatedAt: '' },
  { id: '7', title: 'MegaGroup — Corporate video', description: '', priority: 'HIGH', status: 'BLOCKED', assigneeId: '2', assigneeName: 'Jasur Nazarov', assigneeAvatar: undefined, projectId: '4', projectName: 'MegaGroup', dueDate: '2026-08-28', tags: ['Video'], estimatedHours: 10, loggedHours: 5, createdAt: '', updatedAt: '' },
  { id: '8', title: 'Trendy Wear — Reels cover', description: '', priority: 'LOW', status: 'DONE', assigneeId: '1', assigneeName: 'Bekzod Tursunov', assigneeAvatar: undefined, projectId: '5', projectName: 'Trendy Wear', dueDate: '2026-08-20', tags: ['Reels'], estimatedHours: 10, loggedHours: 10, createdAt: '', updatedAt: '' },
  { id: '9', title: 'Coffee Lab — Mahsulot foto video', description: '', priority: 'LOW', status: 'DONE', assigneeId: '2', assigneeName: 'Jasur Nazarov', assigneeAvatar: undefined, projectId: '1', projectName: 'Coffee Lab', dueDate: '2026-08-19', tags: ['Video'], estimatedHours: 10, loggedHours: 10, createdAt: '', updatedAt: '' },
  { id: '10', title: 'UrbanFit — TikTok montaj', description: '', priority: 'LOW', status: 'DONE', assigneeId: '1', assigneeName: 'Bekzod Tursunov', assigneeAvatar: undefined, projectId: '2', projectName: 'UrbanFit', dueDate: '2026-08-18', tags: ['Video'], estimatedHours: 10, loggedHours: 10, createdAt: '', updatedAt: '' },
  { id: '11', title: 'MegaGroup — Intervyu montaj', description: '', priority: 'MEDIUM', status: 'DONE', assigneeId: '2', assigneeName: 'Jasur Nazarov', assigneeAvatar: undefined, projectId: '4', projectName: 'MegaGroup', dueDate: '2026-08-17', tags: ['Video'], estimatedHours: 10, loggedHours: 10, createdAt: '', updatedAt: '' },
];

export function EditingDeptPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleMove = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date().toISOString() } : task
      )
    );
  }, []);

  const handleOpenCreateForm = useCallback(() => {
    setEditingTask(null);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingTask(null);
  }, []);

  const handleFormSubmit = useCallback((data: TaskFormData) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...data, updatedAt: new Date().toISOString() }
            : task
        )
      );
    } else {
      const newTask: Task = {
        id: String(Date.now()),
        ...data,
        assigneeName: mockEmployees.find((e) => e.id === data.assigneeId)?.fullName || '',
        projectName: mockProjects.find((p) => p.id === data.projectId)?.name || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    handleCloseForm();
  }, [editingTask, handleCloseForm]);

  const assigneeOptions = mockEmployees.map((e) => ({ value: e.id, label: e.fullName }));
  const projectOptions = mockProjects.map((p) => ({ value: p.id, label: p.name }));

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-end flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="text-caption text-[var(--color-text-secondary)]">‹ Avgust 2026 ›</span>
          <Button variant="ghost" size="icon" onClick={handleOpenCreateForm} aria-label="Yangi vazifa">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard columns={EDITING_DEPT_COLUMNS} tasks={tasks} onTaskMove={handleMove} />

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
        assigneeOptions={assigneeOptions}
        projectOptions={projectOptions}
      />
    </div>
  );
}

// Task Form Component
interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string;
  projectId: string;
  dueDate: string;
  tags: string[];
}

const statusOptions = [
  { value: 'BACKLOG', label: 'Kutilmoqda' },
  { value: 'IN_PROGRESS', label: 'Montajda' },
  { value: 'REVIEW', label: "Ko'rib chiqilmoqda" },
  { value: 'BLOCKED', label: 'Qayta ishlash' },
  { value: 'DONE', label: 'Bajarildi' },
];

const priorityOptionsForm = [
  { value: 'LOW', label: 'Past' },
  { value: 'MEDIUM', label: "O'rta" },
  { value: 'HIGH', label: 'Yuqori' },
  { value: 'URGENT', label: 'Shoshilinch' },
];

function TaskForm({ isOpen, onClose, onSubmit, initialData, assigneeOptions, projectOptions }: { isOpen: boolean; onClose: () => void; onSubmit: (data: TaskFormData) => void; initialData: Task | null; assigneeOptions: { value: string; label: string }[]; projectOptions: { value: string; label: string }[] }) {
  const isEdit = !!initialData;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/50 backdrop-blur-sm
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-bg-surface)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-top-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-bg-border)]">
          <h2 className="text-h3">{isEdit ? 'Vazifani tahrirlash' : 'Yangi vazifa yaratish'}</h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const tags = fd.getAll('tags').filter(Boolean) as string[]; onSubmit({ title: fd.get('title') as string, description: fd.get('description') as string, priority: fd.get('priority') as TaskPriority, status: fd.get('status') as TaskStatus, assigneeId: fd.get('assigneeId') as string, projectId: fd.get('projectId') as string, dueDate: fd.get('dueDate') as string, tags }); }} className="p-4 space-y-4">
          <Input name="title" label="Nomi" placeholder="Mas: Coffee Lab — Reels #12" value={initialData?.title || ''} required />
          <textarea name="description" className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-bg-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none" rows={3} placeholder="Tavsif">{initialData?.description || ''}</textarea>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="priority" label="Prioritet" options={priorityOptionsForm} value={initialData?.priority || 'MEDIUM'} required />
            <Select name="status" label="Holati" options={statusOptions} value={initialData?.status || 'BACKLOG'} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="assigneeId" label="Ijrochi" options={assigneeOptions} value={initialData?.assigneeId || ''} required />
            <Select name="projectId" label="Loyiha" options={projectOptions} value={initialData?.projectId || ''} required />
          </div>
          <Input name="dueDate" type="date" label="Muddat" value={initialData?.dueDate || ''} required />
          <div>
            <label className="block text-caption text-[var(--color-text-secondary)] mb-2">Kategoriya</label>
            <Input name="tags" placeholder="Video, Reels, Audio..." value={initialData?.tags?.join(', ') || ''} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-bg-border)]">
            <Button type="button" variant="secondary" onClick={onClose}>Bekor qilish</Button>
            <Button type="submit" variant="primary">{isEdit ? 'Saqlash' : 'Yaratish'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
