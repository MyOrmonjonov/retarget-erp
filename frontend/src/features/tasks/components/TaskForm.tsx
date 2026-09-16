'use client';

import { useEffect, useState } from 'react';
import { Plus, X, Paperclip, Check } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select, type SelectOption } from '@/shared/ui/select';
import { DatePicker } from '@/shared/ui/date-picker';
import { Textarea } from '@/shared/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import type { TaskPriority, TaskStatus } from '@/shared/types';
import type { TaskDetail, TaskInput, TaskSubtask } from '../api/tasksApi';
import type { Group } from '@/features/groups/api/groupsApi';
import { useGroupTopics } from '@/features/groups/hooks/useGroups';
import { useCreateTask, useChangeTaskStatus, useDeleteTask } from '../hooks/useTasks';
import { InlineTaskStatusSelect } from '@/shared/components/InlineTaskStatusSelect';
import { Avatar } from '@/shared/ui/avatar';
import { CommentThread } from './CommentThread';

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
  /** Dizayn bo'limi only - shows format/platform fields, ported from the reference CRM's
   * Design page (its task model has these; ours doesn't for tasks in general). */
  showDesignFields?: boolean;
  /** Optional project picker - omitted entirely when not passed (e.g. from a project's own
   * detail page, where the link is implied). */
  projects?: SelectOption[];
  /** Status to pre-select when creating a new task (e.g. "+" clicked on a specific Kanban
   * column) - ignored when editing an existing task, which always uses its own status. */
  defaultStatus?: TaskStatus;
  /** Department-board context (Dizayn/Montaj bo'limi pages): the board's name plus the user ids
   * of that department's employees. The board only shows tasks assigned to those people, so
   * when every chosen assignee falls outside this list the task would silently never appear on
   * the board the user is creating it from - warn instead of letting it vanish. */
  deptBoardName?: string;
  deptMemberIds?: string[];
}

const DESIGN_FORMAT_OPTIONS: SelectOption[] = [
  { value: '', label: "Tanlanmagan" },
  { value: 'Banner', label: 'Banner' },
  { value: 'Post', label: 'Post' },
  { value: 'Reels', label: 'Reels' },
  { value: 'Story', label: 'Story' },
  { value: 'Logo', label: 'Logo' },
  { value: 'Prezentatsiya', label: 'Prezentatsiya' },
  { value: 'Boshqa', label: 'Boshqa' },
];

const DESIGN_PLATFORM_OPTIONS: SelectOption[] = [
  { value: '', label: "Tanlanmagan" },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Telegram', label: 'Telegram' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'Boshqa', label: 'Boshqa' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'LOW', label: 'Past' },
  { value: 'MEDIUM', label: "O'rta" },
  { value: 'HIGH', label: 'Yuqori' },
  { value: 'URGENT', label: 'Shoshilinch' },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'Yangi' },
  { value: 'IN_PROGRESS', label: 'Jarayonda' },
  { value: 'EDITING', label: 'Montajda' },
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

function emptyForm(defaultStatus: TaskStatus = 'TODO'): TaskFormData {
  return {
    title: '',
    description: '',
    assigneeIds: [],
    priority: 'MEDIUM',
    status: defaultStatus,
    dueDate: '',
    checklist: [],
    reminderMinutes: undefined,
    files: [],
    groupId: undefined,
    topicId: undefined,
    format: '',
    platform: '',
    projectId: undefined,
    links: [],
  };
}

export function TaskForm({ isOpen, onClose, onSubmit, initialData, isLoading, assignees = [], groups = [],
                          showDesignFields = false, projects, defaultStatus,
                          deptBoardName, deptMemberIds }: TaskFormProps) {
  const isEdit = !!initialData;
  const [form, setForm] = useState<TaskFormData>(emptyForm());
  const [checklistDraft, setChecklistDraft] = useState('');
  const [linkDraft, setLinkDraft] = useState('');
  const [titleError, setTitleError] = useState<string | undefined>();
  const [dueDateError, setDueDateError] = useState<string | undefined>();
  const [assigneeError, setAssigneeError] = useState<string | undefined>();
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [subtaskDraftTitle, setSubtaskDraftTitle] = useState('');
  const [subtaskDraftAssignee, setSubtaskDraftAssignee] = useState('');

  const createSubtask = useCreateTask();
  const changeSubtaskStatus = useChangeTaskStatus();
  const deleteSubtask = useDeleteTask();

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
        format: initialData.tags?.[0] ?? '',
        platform: initialData.platform ?? '',
        projectId: initialData.projectId || undefined,
        links: initialData.links ?? [],
      });
    } else {
      setForm(emptyForm(defaultStatus));
    }
    setChecklistDraft('');
    setLinkDraft('');
    setTitleError(undefined);
    setDueDateError(undefined);
    setAssigneeError(undefined);
    setSubtasks(initialData?.subtasks ?? []);
    setSubtaskDraftTitle('');
    setSubtaskDraftAssignee('');
  }, [isOpen, initialData, defaultStatus]);

  const toggleAssignee = (id: string) => {
    setForm((f) => ({
      ...f,
      assigneeIds: f.assigneeIds.includes(id) ? f.assigneeIds.filter((a) => a !== id) : [...f.assigneeIds, id],
    }));
    setAssigneeError(undefined);
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

  const addLink = () => {
    const url = linkDraft.trim();
    if (!url || (form.links ?? []).length >= 5) return;
    setForm((f) => ({ ...f, links: [...(f.links ?? []), url] }));
    setLinkDraft('');
  };

  const removeLink = (index: number) => {
    setForm((f) => ({ ...f, links: (f.links ?? []).filter((_, i) => i !== index) }));
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setForm((f) => ({ ...f, files: [...(f.files ?? []), ...Array.from(fileList)] }));
  };

  const removeFile = (index: number) => {
    setForm((f) => ({ ...f, files: (f.files ?? []).filter((_, i) => i !== index) }));
  };

  const addSubtask = async () => {
    const title = subtaskDraftTitle.trim();
    if (!title || !initialData) return;
    const created = await createSubtask.mutateAsync({
      title,
      description: '',
      assigneeIds: subtaskDraftAssignee ? [subtaskDraftAssignee] : [],
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: form.dueDate,
      parentTaskId: initialData.id,
    });
    setSubtasks((s) => [...s, {
      id: created.id,
      title: created.title,
      status: created.status,
      assigneeId: created.assigneeId,
      assigneeName: created.assigneeName,
    }]);
    setSubtaskDraftTitle('');
    setSubtaskDraftAssignee('');
  };

  const changeSubtaskStatusLocal = (subtaskId: string, status: TaskStatus) => {
    setSubtasks((s) => s.map((item) => (item.id === subtaskId ? { ...item, status } : item)));
    changeSubtaskStatus.mutate({ id: subtaskId, status });
  };

  const removeSubtask = (subtaskId: string) => {
    setSubtasks((s) => s.filter((item) => item.id !== subtaskId));
    deleteSubtask.mutate(subtaskId);
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
    if (form.assigneeIds.length === 0) {
      setAssigneeError('Kamida bitta ijrochi tanlang');
      valid = false;
    } else {
      setAssigneeError(undefined);
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

  const selectedGroup = form.groupId ? linkedGroups.find((g) => String(g.id) === form.groupId) : undefined;
  // A GROUP-placed task can only be assigned to that group's own members (the backend rejects
  // anyone else) - once a group is picked, swap the assignee picker to just its member list.
  const assigneeOptions: SelectOption[] = selectedGroup
    ? selectedGroup.memberList.map((m) => ({ value: String(m.id), label: m.name }))
    : assignees;

  const handleGroupChange = (value: string) => {
    const group = value ? linkedGroups.find((g) => String(g.id) === value) : undefined;
    const validIds = group ? new Set(group.memberList.map((m) => String(m.id))) : null;
    setForm((f) => ({
      ...f,
      groupId: value || undefined,
      topicId: undefined,
      assigneeIds: validIds ? f.assigneeIds.filter((id) => validIds.has(id)) : f.assigneeIds,
    }));
  };

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

          {projects && projects.length > 0 && (
            <Select
              value={form.projectId ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value || undefined }))}
              label="Loyihaga bog'lash (ixtiyoriy)"
              options={[{ value: '', label: "Bog'lanmagan" }, ...projects]}
            />
          )}

          {linkedGroups.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={form.groupId ?? ''}
                onChange={(e) => handleGroupChange(e.target.value)}
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
            <label className="block text-body font-medium text-[var(--color-text-primary)] mb-1.5">
              Ijrochilar{selectedGroup && <span className="text-[var(--color-text-muted)] font-normal"> - {selectedGroup.title} a'zolari</span>}
            </label>
            {assigneeOptions.length === 0 ? (
              <p className="text-caption text-[var(--color-text-muted)]">
                {selectedGroup ? "Bu guruhda a'zo topilmadi" : 'Xodimlar topilmadi'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {assigneeOptions.map((option) => {
                  const active = form.assigneeIds.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleAssignee(option.value)}
                      className={`px-3 py-1.5 rounded-full text-caption transition-colors ${
                        active
                          ? 'bg-[var(--color-accent)] text-white font-medium'
                          : 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
            {assigneeError && <p className="text-caption text-[var(--color-error)] mt-1.5">{assigneeError}</p>}
            {deptBoardName && deptMemberIds && form.assigneeIds.length > 0
              && !form.assigneeIds.some((id) => deptMemberIds.includes(id)) && (
              <p className="text-caption text-[var(--color-warning)] mt-1.5">
                Diqqat: tanlangan ijrochilar orasida {deptBoardName} xodimi yo'q - bu vazifa {deptBoardName} doskasida ko'rinmaydi (faqat umumiy Vazifalar sahifasida chiqadi)
              </p>
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

          {showDesignFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={form.format ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
                label="Format"
                options={DESIGN_FORMAT_OPTIONS}
              />
              <Select
                value={form.platform ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                label="Platforma"
                options={DESIGN_PLATFORM_OPTIONS}
              />
            </div>
          )}

          {showDesignFields && (
            <div>
              <label className="block text-body font-medium text-[var(--color-text-primary)] mb-1.5">Havolalar</label>
              <div className="space-y-1.5">
                {(form.links ?? []).map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <a href={url} target="_blank" rel="noreferrer"
                       className="flex-1 text-body text-[var(--color-accent)] truncate hover:underline">
                      {url}
                    </a>
                    <button type="button" onClick={() => removeLink(index)} aria-label="O'chirish">
                      <X className="w-4 h-4 text-[var(--color-text-muted)] hover:text-[var(--color-error)]" />
                    </button>
                  </div>
                ))}
              </div>
              {(form.links ?? []).length < 5 && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={linkDraft}
                    onChange={(e) => setLinkDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <Button type="button" variant="secondary" onClick={addLink}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              value={form.dueDate}
              onChange={(value) => setForm((f) => ({ ...f, dueDate: value }))}
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

          {isEdit && initialData && (
            <div>
              <label className="block text-body font-medium text-[var(--color-text-primary)] mb-1.5">Ichki vazifalar</label>
              <div className="space-y-1.5">
                {subtasks.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[var(--color-bg-hover)]">
                    <span className="flex-1 text-body text-[var(--color-text-primary)] truncate">{item.title}</span>
                    {item.assigneeName && (
                      <span className="flex items-center gap-1.5 flex-shrink-0">
                        <Avatar name={item.assigneeName} size="xs" />
                        <span className="text-caption text-[var(--color-text-secondary)] hidden sm:inline">{item.assigneeName}</span>
                      </span>
                    )}
                    <InlineTaskStatusSelect status={item.status} onChange={(status) => changeSubtaskStatusLocal(item.id, status)} />
                    <button type="button" onClick={() => removeSubtask(item.id)} aria-label="O'chirish">
                      <X className="w-4 h-4 text-[var(--color-text-muted)] hover:text-[var(--color-error)]" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Input
                  value={subtaskDraftTitle}
                  onChange={(e) => setSubtaskDraftTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                  placeholder="Ichki vazifa nomi..."
                  className="flex-1"
                />
                <Select
                  value={subtaskDraftAssignee}
                  onChange={(e) => setSubtaskDraftAssignee(e.target.value)}
                  options={[{ value: '', label: 'Ijrochisiz' }, ...assigneeOptions]}
                  className="sm:w-48"
                />
                <Button type="button" variant="secondary" onClick={addSubtask} disabled={createSubtask.isPending}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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

          {isEdit && initialData && (
            <div>
              <label className="block text-body font-medium text-[var(--color-text-primary)] mb-1.5">Izohlar</label>
              <CommentThread taskId={initialData.id} />
            </div>
          )}

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
