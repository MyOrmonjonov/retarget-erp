'use client';

import { useEffect, useState } from 'react';
import { Plus, X, Paperclip, Check } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, type SelectOption } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import type { TaskPriority, TaskStatus } from '@/shared/types';
import type { TaskDetail, TaskInput } from '../api/tasksApi';
import type { Group } from '@/features/groups/api/groupsApi';
import { useGroupTopics } from '@/features/groups/hooks/useGroups';

export type TaskFormData = TaskInput;

function FilePreviewCard({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = file.type.startsWith('image/');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  if (isImage) {
    return (
      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-[var(--color-bg-hover)] flex-shrink-0">
        {previewUrl && <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />}
        <button
          type="button"
          onClick={onRemove}
          aria-label="O'chirish"
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--color-bg-hover)]">
      <Paperclip className="h-3.5 w-3.5 text-[var(--color-text-muted)] flex-shrink-0" />
      <span className="text-caption text-[var(--color-text-secondary)] truncate max-w-[160px]">{file.name}</span>
      <button type="button" onClick={onRemove} aria-label="O'chirish">
        <X className="w-4 h-4 text-[var(--color-text-muted)] hover:text-[var(--color-error)]" />
      </button>
    </div>
  );
}

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: TaskDetail | null;
  isLoading?: boolean;
  assignees?: SelectOption[];
  groups?: Group[];
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'LOW', label: 'Past' },
  { value: 'MEDIUM', label: "O'rta" },
  { value: 'HIGH', label: 'Yuqori' },
  { value: 'URGENT', label: 'Shoshilinch' },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'Yangi' },
  { value: 'IN_PROGRESS', label: 'Jarayonda' },
  { value: 'REVIEW', label: "Ko'rib chiqilmoqda" },
  { value: 'DONE', label: 'Bajarildi' },
  { value: 'BLOCKED', label: 'Bloklangan' },
];

const REMINDER_OPTIONS = [
  { value: '', label: 'Eslatma yo\'q' },
  { value: '15', label: '15 daqiqa oldin' },
  { value: '60', label: '1 soat oldin' },
  { value: '1440', label: '1 kun oldin' },
];

function emptyForm(): TaskFormData {
  return {
    title: '',
    description: '',
    assigneeIds: [],
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
    checklist: [],
    reminderMinutes: undefined,
    files: [],
    groupId: undefined,
    topicId: undefined,
  };
}

export function TaskForm({ isOpen, onClose, onSubmit, initialData, isLoading, assignees = [], groups = [] }: TaskFormProps) {
  const isEdit = !!initialData;
  const [form, setForm] = useState<TaskFormData>(emptyForm());
  const [checklistDraft, setChecklistDraft] = useState('');
  const [titleError, setTitleError] = useState<string | undefined>();
  const [dueDateError, setDueDateError] = useState<string | undefined>();

  const selectedGroupId = form.groupId ? Number(form.groupId) : null;
  const { data: topics = [] } = useGroupTopics(selectedGroupId);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      const status: TaskStatus = initialData.status === 'BACKLOG' ? 'TODO' : initialData.status;
      setForm({
        title: initialData.title,
        description: initialData.description || '',
        assigneeIds: initialData.assigneeIds,
        priority: initialData.priority,
        status,
        dueDate: initialData.dueDate.split('T')[0],
        checklist: initialData.checklistItems ?? [],
        reminderMinutes: initialData.reminderMinutes,
        files: [],
        groupId: initialData.groupId,
        topicId: initialData.topicId,
      });
    } else {
      setForm(emptyForm());
    }
    setChecklistDraft('');
    setTitleError(undefined);
    setDueDateError(undefined);
  }, [isOpen, initialData]);

  const toggleAssignee = (id: string) => {
    setForm((f) => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(id) ? f.assigneeIds.filter((a) => a !== id) : [...f.assigneeIds, id],
    }));
  };

  const addChecklistItem = () => {
    const text = checklistDraft.trim();
    if (!text) return;
    setForm((f) => ({ ...f, checklist: [...(f.checklist ?? []), { text, done: false }] }));
    setChecklistDraft('');
  };

  const toggleChecklistItem = (index: number) => {
    setForm((f) => ({
      ...f,
      checklist: (f.checklist ?? []).map((item, i) => (i === index ? { ...item, done: !item.done } : item)),
    }));
  };

  const removeChecklistItem = (index: number) => {
    setForm((f) => ({ ...f, checklist: (f.checklist ?? []).filter((_, i) => i !== index) }));
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setForm((f) => ({ ...f, files: [...(f.files ?? []), ...Array.from(fileList)] }));
  };

  const removeFile = (index: number) => {
    setForm((f) => ({ ...f, files: (f.files ?? []).filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    let valid = true;
    if (form.title.trim().length < 2) {
      setTitleError("Nomi kamida 2 ta belgi bo'lishi kerak");
      valid = false;
    } else {
      setTitleError(undefined);
    }
    if (!form.dueDate) {
      setDueDateError('Muddatni kiriting');
      valid = false;
    } else {
      setDueDateError(undefined);
    }
    if (!valid) return;
    await onSubmit(form);
  };

  const linkedGroups = groups.filter((g) => g.botConnected);
  // A real (selectable) "no group" option, not the Select's disabled placeholder - otherwise
  // there'd be no way back to "no group" once a real one had been picked.
  const groupOptions: SelectOption[] = [
    { value: '', label: 'Ish maydonida (guruhsiz)' },
    ...linkedGroups.map((g) => ({ value: String(g.id), label: g.title })),
  ];
  const topicOptions: SelectOption[] = [
    { value: '', label: 'Umumiy' },
    ...topics.map((t) => ({ value: String(t.id), label: t.name })),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Vazifani tahrirlash' : 'Yangi vazifa yaratish'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          <Input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            label="Vazifa nomi"
            placeholder="Mas: Logo design for Coffee House"
            error={titleError}
          />
          <Textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            label="Tavsif"
            placeholder="Vazifa haqida batafsil ma'lumot..."
            rows={3}
          />

          <div>
            <label className="block text-body font-medium text-[var(--color-text-primary)] mb-1.5">Ijrochilar</label>
            {assignees.length === 0 ? (
              <p className="text-caption text-[var(--color-text-muted)]">Xodimlar topilmadi</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {assignees.map((option) => {
                  const active = form.assigneeIds.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleAssignee(option.value)}
                      className={`px-3 py-1.5 rounded-full text-caption transition-colors ${
                        active
                          ? 'bg-[var(--color-accent)] text-black font-medium'
                          : 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
              label="Prioritet"
              options={PRIORITY_OPTIONS}
            />
            <Select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
              label="Status"
              options={STATUS_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              type="date"
              label="Tugash muddati"
              error={dueDateError}
            />
            <Select
              value={form.reminderMinutes != null ? String(form.reminderMinutes) : ''}
              onChange={(e) => setForm((f) => ({ ...f, reminderMinutes: e.target.value ? Number(e.target.value) : undefined }))}
              label="Eslatma"
              options={REMINDER_OPTIONS}
            />
          </div>

          {linkedGroups.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={form.groupId ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, groupId: e.target.value || undefined, topicId: undefined }))}
                label="Joylashuv"
                options={groupOptions}
              />
              {form.groupId && (
                <Select
                  value={form.topicId ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, topicId: e.target.value || undefined }))}
                  label="Mavzu"
                  options={topicOptions}
                />
              )}
            </div>
          )}

          <div>
            <label className="block text-body font-medium text-[var(--color-text-primary)] mb-1.5">Checklist</label>
            <div className="space-y-1.5">
              {(form.checklist ?? []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleChecklistItem(index)}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      item.done ? 'bg-[var(--color-success)] border-[var(--color-success)]' : 'border-[var(--color-bg-border)]'
                    }`}
                  >
                    {item.done && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`flex-1 text-body ${item.done ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'}`}>
                    {item.text}
                  </span>
                  <button type="button" onClick={() => removeChecklistItem(index)} aria-label="O'chirish">
                    <X className="w-4 h-4 text-[var(--color-text-muted)] hover:text-[var(--color-error)]" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                value={checklistDraft}
                onChange={(e) => setChecklistDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem(); } }}
                placeholder="Bandni kiriting..."
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={addChecklistItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-body font-medium text-[var(--color-text-primary)] mb-1.5">Fayllar / rasmlar</label>
            {(form.files ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {(form.files ?? []).map((file, index) => (
                  <FilePreviewCard key={`${file.name}-${file.lastModified}-${index}`} file={file} onRemove={() => removeFile(index)} />
                ))}
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-[var(--color-bg-border)] text-caption text-[var(--color-text-secondary)] cursor-pointer hover:border-[var(--color-accent)]">
              <Paperclip className="h-4 w-4" /> Fayl biriktirish
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Bekor qilish
            </Button>
            <Button type="submit" variant="primary" loading={isLoading}>
              {isEdit ? 'Saqlash' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
