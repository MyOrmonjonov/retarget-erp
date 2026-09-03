'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, type SelectOption } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';
import type { ShootingEvent, ShootingEventStatus, ShootingEventType } from '@/shared/types';
import {
  useShootingEvents, useCreateShootingEvent, useUpdateShootingEvent, useDeleteShootingEvent,
} from '../hooks/useShootingEvents';
import { shootingApi } from '../api/shootingApi';
import { useProjects } from '@/features/projects/hooks/useProjects';

const statusBadgeVariant: Record<ShootingEventStatus, 'default' | 'warning' | 'success' | 'error'> = {
  PLANNING: 'default',
  SCHEDULED: 'warning',
  CONFIRMED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

const statusLabels: Record<ShootingEventStatus, string> = {
  PLANNING: 'Rejalashtirilmoqda',
  SCHEDULED: 'Rejalashtirildi',
  CONFIRMED: 'Tasdiqlangan',
  COMPLETED: 'Yakunlangan',
  CANCELLED: 'Bekor qilingan',
};

export function ShootingPage() {
  const { data: events = [], isLoading } = useShootingEvents();
  const { data: projects = [] } = useProjects();
  const createEvent = useCreateShootingEvent();
  const updateEvent = useUpdateShootingEvent();
  const deleteEvent = useDeleteShootingEvent();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ShootingEvent | null>(null);
  const [createForProjectId, setCreateForProjectId] = useState<string | undefined>();
  const [deletingEvent, setDeletingEvent] = useState<ShootingEvent | null>(null);

  // Ported from the reference CRM's Syomka kalendari: one column per project (biriktirilgan
  // loyihalar), not a week/day view - a project's shooting schedule lives on its own column.
  const projectColumns = useMemo(() => {
    const byProject = new Map<string, { projectId: string; name: string; events: ShootingEvent[] }>();
    for (const project of projects) {
      byProject.set(String(project.id), { projectId: String(project.id), name: project.name, events: [] });
    }
    for (const event of events) {
      if (!event.projectId || !byProject.has(event.projectId)) continue;
      byProject.get(event.projectId)!.events.push(event);
    }
    byProject.forEach((col) => col.events.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)));
    return Array.from(byProject.values());
  }, [projects, events]);

  const projectOptions: SelectOption[] = useMemo(
    () => projects.map((p) => ({ value: String(p.id), label: p.name })),
    [projects]
  );

  const handleOpenCreateForm = useCallback((projectId?: string) => {
    setEditingEvent(null);
    setCreateForProjectId(projectId);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditForm = useCallback((event: ShootingEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingEvent(null);
    setCreateForProjectId(undefined);
  }, []);

  const handleFormSubmit = useCallback(async (data: ShootingEventFormData) => {
    const input = {
      projectId: data.projectId || createForProjectId,
      title: data.title,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      type: data.type,
      description: data.description || undefined,
    };
    if (editingEvent) {
      await updateEvent.mutateAsync({ id: String(editingEvent.id), input });
      if (data.status !== editingEvent.status) {
        await shootingApi.changeStatus(String(editingEvent.id), data.status);
      }
    } else {
      await createEvent.mutateAsync(input);
    }
    handleCloseForm();
  }, [editingEvent, createEvent, updateEvent, createForProjectId, handleCloseForm]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingEvent) return;
    await deleteEvent.mutateAsync(String(deletingEvent.id));
    setDeletingEvent(null);
  }, [deletingEvent, deleteEvent]);

  return (
    <div className="space-y-6 animate-in">
      <p className="text-caption text-[var(--color-text-secondary)]">
        Biriktirilgan loyihalar bo'yicha syomka jadvali
      </p>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[320px] w-[280px] flex-shrink-0 rounded-[14px]" />
          ))}
        </div>
      ) : projectColumns.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-[var(--color-text-secondary)]">Hali loyiha yo'q</p>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {projectColumns.map((col) => (
            <div key={col.projectId} className="min-w-[280px] max-w-[280px] flex-shrink-0">
              <Card className="p-3 h-full flex flex-col">
                <div className="pb-3 mb-3 border-b border-[var(--color-bg-border)]">
                  <p className="text-body font-semibold text-[var(--color-text-primary)] truncate">{col.name}</p>
                  <p className="text-caption text-[var(--color-text-muted)]">{col.events.length} ta syomka</p>
                </div>
                <div className="flex-1 space-y-2 min-h-[60px]">
                  {col.events.length === 0 ? (
                    <p className="text-caption text-[var(--color-text-muted)] text-center py-6">Syomka yo'q</p>
                  ) : (
                    col.events.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-lg border border-[var(--color-bg-border)] bg-[var(--color-bg-surface)] p-2.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-caption font-medium text-[var(--color-text-primary)] truncate">{event.title}</p>
                          <Badge variant={statusBadgeVariant[event.status]} size="sm">{statusLabels[event.status]}</Badge>
                        </div>
                        <p className="text-[11px] text-[var(--color-text-muted)]">
                          {event.date} &middot; {event.startTime}
                        </p>
                        {event.location && <p className="text-[11px] text-[var(--color-text-muted)]">{event.location}</p>}
                        {event.team.length > 0 && (
                          <div className="flex items-center gap-1">
                            {event.team.slice(0, 3).map((memberId) => (
                              <Avatar key={memberId} name={`#${memberId}`} size="xs" />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3 pt-1">
                          <button type="button" onClick={() => handleOpenEditForm(event)} className="text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] inline-flex items-center gap-1">
                            <Pencil className="h-3 w-3" /> Tahrirlash
                          </button>
                          <button type="button" onClick={() => setDeletingEvent(event)} className="text-[11px] font-medium text-[var(--color-error)] inline-flex items-center gap-1">
                            <Trash2 className="h-3 w-3" /> O'chirish
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenCreateForm(col.projectId)}
                  className="mt-2 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-[var(--color-bg-border)] text-caption text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <Plus className="h-3.5 w-3.5" /> Syomka qo'shish
                </button>
              </Card>
            </div>
          ))}
        </div>
      )}

      <EventForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingEvent}
        defaultProjectId={createForProjectId}
        projectOptions={projectOptions}
        isLoading={createEvent.isPending || updateEvent.isPending}
      />

      <DeleteConfirmation
        isOpen={!!deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteEvent.isPending}
        title="Syomkani o'chirish"
        description="Bu syomka doimiy o'chiriladi. Davom etishni xohlaysizmi?"
        itemName={deletingEvent?.title}
      />
    </div>
  );
}

// Event Form Component
interface ShootingEventFormData {
  projectId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: ShootingEventType;
  status: ShootingEventStatus;
  description: string;
}

const typeOptions = [
  { value: 'PHOTO', label: 'Foto' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'EVENT', label: 'Tadbir' },
  { value: 'INTERVIEW', label: 'Intervyu' },
];

const statusOptions = [
  { value: 'PLANNING', label: 'Rejalashtirilmoqda' },
  { value: 'SCHEDULED', label: 'Rejalashtirildi' },
  { value: 'CONFIRMED', label: 'Tasdiqlangan' },
  { value: 'COMPLETED', label: 'Yakunlangan' },
  { value: 'CANCELLED', label: 'Bekor qilingan' },
];

function EventForm({ isOpen, onClose, onSubmit, initialData, defaultProjectId, projectOptions, isLoading }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShootingEventFormData) => void;
  initialData: ShootingEvent | null;
  defaultProjectId?: string;
  projectOptions: SelectOption[];
  isLoading?: boolean;
}) {
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
        className="bg-[var(--color-bg-surface)] rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-top-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-bg-border)]">
          <h2 className="text-h3">{isEdit ? 'Syomkani tahrirlash' : 'Yangi syomka qo\'shish'}</h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onSubmit({
            projectId: fd.get('projectId') as string,
            title: fd.get('title') as string,
            date: fd.get('date') as string,
            startTime: fd.get('startTime') as string,
            endTime: fd.get('endTime') as string,
            location: fd.get('location') as string,
            type: fd.get('type') as ShootingEventType,
            status: fd.get('status') as ShootingEventStatus,
            description: fd.get('description') as string,
          });
        }} className="p-4 space-y-4">
          {projectOptions.length > 0 && (
            <Select
              name="projectId"
              label="Loyiha"
              options={[{ value: '', label: "Loyiha tanlanmagan" }, ...projectOptions]}
              defaultValue={initialData?.projectId ?? defaultProjectId ?? ''}
            />
          )}
          <Input name="title" label="Sarlavha" placeholder="Mas: Mahsulot foto" defaultValue={initialData?.title || ''} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="date" type="date" label="Sana" defaultValue={initialData?.date || format(new Date(), 'yyyy-MM-dd')} required />
            <div className="grid grid-cols-2 gap-2">
              <Input name="startTime" type="time" label="Vaqt" defaultValue={initialData?.startTime || ''} required />
              <Input name="endTime" type="time" label="Tugash" defaultValue={initialData?.endTime || ''} required />
            </div>
          </div>
          <Input name="location" label="Manzil" placeholder="Mas: Studio A" defaultValue={initialData?.location || ''} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="type" label="Tur" options={typeOptions} defaultValue={initialData?.type || 'PHOTO'} required />
            <Select name="status" label="Holati" options={statusOptions} defaultValue={initialData?.status || 'PLANNING'} required />
          </div>
          <textarea name="description" defaultValue={initialData?.description || ''} className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-bg-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none" rows={3} placeholder="Tavsif" />
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-bg-border)]">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Bekor qilish</Button>
            <Button type="submit" variant="primary" loading={isLoading}>Saqlash</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
