'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { cn } from '@/shared/lib/utils';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { uz } from 'date-fns/locale';
import type { ShootingEvent, ShootingEventStatus, ShootingEventType } from '@/shared/types';

type EventWithOperator = ShootingEvent & { operatorName: string };

const mockEvents: EventWithOperator[] = [
  { id: '1', title: 'Coffee Lab — Mahsulot foto', date: '2026-08-28', startTime: '10:00', endTime: '12:00', location: 'Studio A · Mahsulot foto', type: 'PHOTO', status: 'CONFIRMED', team: ['1'], operatorName: 'Jasur', description: '', createdAt: '', updatedAt: '' },
  { id: '2', title: 'UrbanFit — Winter kampaniya video', date: '2026-08-28', startTime: '13:30', endTime: '17:00', location: 'Tashqi maydon · Video', type: 'VIDEO', status: 'SCHEDULED', team: ['2'], operatorName: 'Bekzod', description: '', createdAt: '', updatedAt: '' },
  { id: '3', title: 'NovaTech — Ofis intervyu', date: '2026-08-28', startTime: '16:00', endTime: '17:30', location: 'Mijoz ofisi · Intervyu', type: 'INTERVIEW', status: 'PLANNING', team: ['1'], operatorName: 'Jasur', description: '', createdAt: '', updatedAt: '' },
  { id: '4', title: 'Trendy Wear — Lookbook', date: '2026-08-29', startTime: '09:00', endTime: '13:00', location: 'Studio B · Foto', type: 'PHOTO', status: 'SCHEDULED', team: ['2'], operatorName: 'Bekzod', description: '', createdAt: '', updatedAt: '' },
  { id: '5', title: 'MegaGroup — Korporativ tadbir', date: '2026-08-26', startTime: '10:00', endTime: '15:00', location: 'Ofis · Tadbir', type: 'EVENT', status: 'CONFIRMED', team: ['1', '2'], operatorName: 'Jasur', description: '', createdAt: '', updatedAt: '' },
];

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

const weekdayLabels = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];

export function ShootingPage() {
  const [events, setEvents] = useState<EventWithOperator[]>(mockEvents);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(2026, 7, 28), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 7, 28));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ShootingEvent | null>(null);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const dayEvents = useMemo(() => {
    return events
      .filter((e) => isSameDay(new Date(e.date), selectedDate))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, selectedDate]);

  const handlePrevWeek = useCallback(() => setWeekStart((d) => addDays(d, -7)), []);
  const handleNextWeek = useCallback(() => setWeekStart((d) => addDays(d, 7)), []);

  const handleOpenCreateForm = useCallback(() => {
    setEditingEvent(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditForm = useCallback((event: ShootingEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingEvent(null);
  }, []);

  const handleFormSubmit = useCallback((data: ShootingEventFormData) => {
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e))
      );
    } else {
      const newEvent: EventWithOperator = {
        id: String(Date.now()),
        ...data,
        operatorName: 'Siz',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEvents((prev) => [...prev, newEvent]);
    }
    handleCloseForm();
  }, [editingEvent, handleCloseForm]);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-end flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-caption text-[var(--color-text-secondary)]">
            <button type="button" onClick={handlePrevWeek} aria-label="Oldingi hafta" className="hover:text-[var(--color-text-primary)]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {format(weekStart, 'MMMM yyyy', { locale: uz })}
            <button type="button" onClick={handleNextWeek} aria-label="Keyingi hafta" className="hover:text-[var(--color-text-primary)]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Button variant="primary" onClick={handleOpenCreateForm}>
            <Plus className="h-4 w-4" />
            Yangi syomka
          </Button>
        </div>
      </div>

      {/* Week strip */}
      <div>
        <div className="flex items-center gap-2">
          {weekDays.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={cn(
                  'flex-1 flex flex-col items-start gap-1 rounded-lg px-4 py-2.5 transition-colors',
                  isSelected
                    ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]'
                )}
              >
                <span className="text-caption">{weekdayLabels[i]}</span>
                <span className="text-body font-semibold">{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day events */}
      <div>
        <h3 className="text-body font-semibold text-[var(--color-text-primary)] mb-3">
          {format(selectedDate, 'EEEE, d-MMMM', { locale: uz })} syomkalari
        </h3>
        <div className="space-y-3">
          {dayEvents.length === 0 ? (
            <Card className="py-10 text-center">
              <p className="text-[var(--color-text-secondary)]">Bu kunga syomka rejalashtirilmagan</p>
            </Card>
          ) : (
            dayEvents.map((event) => (
              <Card key={event.id} className="cursor-pointer" onClick={() => handleOpenEditForm(event)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="text-body font-semibold text-[var(--color-accent)] w-14 flex-shrink-0">
                    {event.startTime}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-text-primary)] truncate">{event.title}</p>
                    <p className="text-caption text-[var(--color-text-muted)] truncate">{event.location}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <Avatar name={event.operatorName} size="sm" />
                    <span className="text-caption text-[var(--color-text-secondary)]">{event.operatorName}</span>
                  </div>
                  <Badge variant={statusBadgeVariant[event.status]}>{statusLabels[event.status]}</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Event Form Modal */}
      <EventForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingEvent}
        defaultDate={selectedDate}
      />
    </div>
  );
}

// Event Form Component
interface ShootingEventFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: ShootingEventType;
  status: ShootingEventStatus;
  team: string[];
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

function EventForm({ isOpen, onClose, onSubmit, initialData, defaultDate }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShootingEventFormData) => void;
  initialData: ShootingEvent | null;
  defaultDate: Date | null;
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
            title: fd.get('title') as string,
            date: fd.get('date') as string,
            startTime: fd.get('startTime') as string,
            endTime: fd.get('endTime') as string,
            location: fd.get('location') as string,
            type: fd.get('type') as ShootingEventType,
            status: fd.get('status') as ShootingEventStatus,
            team: [],
            description: fd.get('description') as string,
          });
        }} className="p-4 space-y-4">
          <Input name="title" label="Loyiha" placeholder="Mas: Coffee Lab — Mahsulot foto" value={initialData?.title || ''} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="date" type="date" label="Sana" value={initialData?.date || (defaultDate ? format(defaultDate, 'yyyy-MM-dd') : '')} required />
            <div className="grid grid-cols-2 gap-2">
              <Input name="startTime" type="time" label="Vaqt" value={initialData?.startTime || ''} required />
              <Input name="endTime" type="time" label="Tugash" value={initialData?.endTime || ''} required />
            </div>
          </div>
          <Input name="location" label="Manzil" placeholder="Mas: Studio A" value={initialData?.location || ''} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select name="type" label="Tur" options={typeOptions} value={initialData?.type || 'PHOTO'} required />
            <Select name="status" label="Holati" options={statusOptions} value={initialData?.status || 'PLANNING'} required />
          </div>
          <textarea name="description" className="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-bg-border)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none" rows={3} placeholder="Tavsif">{initialData?.description || ''}</textarea>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-bg-border)]">
            <Button type="button" variant="secondary" onClick={onClose}>Bekor qilish</Button>
            <Button type="submit" variant="primary">{isEdit ? 'Saqlash' : 'Saqlash'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
