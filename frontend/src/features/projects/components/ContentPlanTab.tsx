'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Skeleton } from '@/shared/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';
import { formatShortDate } from '@/shared/lib/utils';
import {
  useContentPlan, useCreateContentPlanItem, useUpdateContentPlanItem, useDeleteContentPlanItem,
} from '../hooks/useContentPlan';
import type { ContentPlanItem, ContentPlanItemInput } from '../api/contentPlanApi';

interface ContentPlanTabProps {
  projectId: string;
  assigneeOptions: { value: string; label: string }[];
}

const PLATFORM_OPTIONS = ['Instagram', 'Telegram', 'Facebook', 'TikTok', 'Boshqa'];
const STATUS_OPTIONS = ["G'oya", 'Ssenariy', 'Suratga olish', 'Montaj', 'Tasdiqlash', 'Post qilindi'];

function emptyForm(): ContentPlanItemInput {
  return { date: '', topic: '', caption: '', note: '', format: '', platforms: [], statuses: [], ownerIds: [] };
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function ChipToggle({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`px-3 py-1.5 rounded-full text-caption transition-colors ${
              active ? 'bg-[var(--color-accent)] text-white font-medium' : 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function ContentPlanItemForm({ isOpen, onClose, onSubmit, initialData, isLoading, assigneeOptions }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContentPlanItemInput) => Promise<void>;
  initialData?: ContentPlanItem | null;
  isLoading?: boolean;
  assigneeOptions: { value: string; label: string }[];
}) {
  const [form, setForm] = useState<ContentPlanItemInput>(emptyForm());
  const [dateError, setDateError] = useState<string | undefined>();

  useEffect(() => {
    if (!isOpen) return;
    setForm(initialData
      ? {
          date: initialData.date.split('T')[0],
          topic: initialData.topic,
          caption: initialData.caption,
          note: initialData.note,
          format: initialData.format,
          platforms: initialData.platforms,
          statuses: initialData.statuses,
          ownerIds: initialData.ownerIds,
        }
      : emptyForm());
    setDateError(undefined);
  }, [isOpen, initialData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.date) {
      setDateError('Sanani kiriting');
      return;
    }
    setDateError(undefined);
    await onSubmit(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Bandni tahrirlash' : "Yangi band qo'shish"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              label="Sana"
              error={dateError}
            />
            <Input
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              label="Mavzu"
              placeholder="Mas: Mahsulot tanishtiruvi"
            />
          </div>

          <Textarea
            value={form.caption}
            onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
            label="Caption"
            rows={2}
          />
          <Textarea
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            label="Izoh"
            rows={2}
          />

          <Input
            value={form.format}
            onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
            label="Format"
            placeholder="Mas: Reels, Post, Story"
          />

          <div>
            <label className="block text-body font-medium text-[var(--color-text-primary)] mb-1.5">Platformalar</label>
            <ChipToggle options={PLATFORM_OPTIONS} selected={form.platforms} onToggle={(v) => setForm((f) => ({ ...f, platforms: toggle(f.platforms, v) }))} />
          </div>

          <div>
            <label className="block text-body font-medium text-[var(--color-text-primary)] mb-1.5">Status</label>
            <ChipToggle options={STATUS_OPTIONS} selected={form.statuses} onToggle={(v) => setForm((f) => ({ ...f, statuses: toggle(f.statuses, v) }))} />
          </div>

          {assigneeOptions.length > 0 && (
            <div>
              <label className="block text-body font-medium text-[var(--color-text-primary)] mb-1.5">Mas'ullar</label>
              <ChipToggle
                options={assigneeOptions.map((a) => a.value)}
                selected={form.ownerIds}
                onToggle={(v) => setForm((f) => ({ ...f, ownerIds: toggle(f.ownerIds, v) }))}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Bekor qilish</Button>
            <Button type="submit" variant="primary" loading={isLoading}>{initialData ? 'Saqlash' : 'Qo\'shish'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ContentPlanTab({ projectId, assigneeOptions }: ContentPlanTabProps) {
  const { data: items = [], isLoading } = useContentPlan(projectId);
  const createItem = useCreateContentPlanItem(projectId);
  const updateItem = useUpdateContentPlanItem(projectId);
  const deleteItem = useDeleteContentPlanItem(projectId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentPlanItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ContentPlanItem | null>(null);

  const byUserId = new Map(assigneeOptions.map((a) => [a.value, a.label]));

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: ContentPlanItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (data: ContentPlanItemInput) => {
    if (editingItem) {
      await updateItem.mutateAsync({ itemId: editingItem.id, data });
    } else {
      await createItem.mutateAsync(data);
    }
    handleClose();
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    await deleteItem.mutateAsync(deletingItem.id);
    setDeletingItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Yangi band
        </Button>
      </div>

      <Card className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
        ) : items.length === 0 ? (
          <p className="text-center text-[var(--color-text-secondary)] py-12">
            Kontent reja hali bo'sh - "Yangi band" tugmasi orqali qo'shing
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sana</TableHead>
                <TableHead>Mavzu</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Platformalar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mas'ullar</TableHead>
                <TableHead>Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">{formatShortDate(item.date)}</TableCell>
                  <TableCell className="font-medium text-[var(--color-text-primary)]">{item.topic || '-'}</TableCell>
                  <TableCell>{item.format || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.platforms.map((p) => <Badge key={p} variant="outline" size="sm">{p}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.statuses.map((s) => <Badge key={s} variant="accent" size="sm">{s}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.ownerIds.map((id) => <Badge key={id} variant="default" size="sm">{byUserId.get(id) ?? id}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => handleOpenEdit(item)} aria-label="Tahrirlash">
                        <Pencil className="h-4 w-4 text-[var(--color-text-muted)] hover:text-[var(--color-accent)]" />
                      </button>
                      <button type="button" onClick={() => setDeletingItem(item)} aria-label="O'chirish">
                        <Trash2 className="h-4 w-4 text-[var(--color-text-muted)] hover:text-[var(--color-error)]" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <ContentPlanItemForm
        isOpen={isFormOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        initialData={editingItem}
        isLoading={createItem.isPending || updateItem.isPending}
        assigneeOptions={assigneeOptions}
      />

      <DeleteConfirmation
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteItem.isPending}
        title="Bandni o'chirish"
        description="Bu band doimiy o'chiriladi. Davom etishni xohlaysizmi?"
        itemName={deletingItem?.topic || undefined}
      />
    </div>
  );
}
