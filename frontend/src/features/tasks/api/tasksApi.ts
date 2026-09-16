import { api } from '@/shared/lib/api';
import { getAuthStore } from '@/features/auth/store/authStore';
import type { Task, TaskPriority, TaskStatus } from '@/shared/types';

type BackendPriority = 'LOW' | 'NORMAL' | 'IMPORTANT' | 'URGENT';
type BackendStatus = 'NEW' | 'IN_PROGRESS' | 'IN_EDITING' | 'REVIEW' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';

interface TaskPersonDto {
  id: number;
  name: string;
  username: string | null;
  photoUrl: string | null;
}

interface TaskChecklistItemDto {
  id: number;
  text: string;
  done: boolean;
}

interface TaskSubtaskDto {
  id: number;
  title: string;
  status: BackendStatus;
  assignees: TaskPersonDto[];
}

interface TaskAttachmentDto {
  id: number;
  name: string;
  contentType: string;
  size: number;
  url: string;
  available: boolean;
}

interface TaskDto {
  id: number;
  title: string;
  description: string | null;
  status: BackendStatus;
  priority: BackendPriority;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
  // The list endpoint always returns assignees/checklistItems/attachments empty (person/item
  // details are only populated on the single-task detail/create/update responses) - assigneeIds,
  // checklist (a "done/total" summary string) and files (a count) are what the list always has.
  assigneeIds: number[];
  assignees: TaskPersonDto[];
  checklist: string;
  files: number;
  checklistItems: TaskChecklistItemDto[];
  attachments: TaskAttachmentDto[];
  reminderMinutes: number | null;
  groupId: number | null;
  topicId: number | null;
  format: string | null;
  platform: string | null;
  revisionCount: number;
  finishedAt: string | null;
  approvedByName: string | null;
  projectId: number | null;
  projectName: string | null;
  parentTaskId: number | null;
  subtasks: TaskSubtaskDto[];
  links: string[];
}

// Backend has no analog for frontend priority MEDIUM/backend NORMAL naming, but the two
// enums line up 1:1 in meaning - this is a pure relabeling, no information loss.
const PRIORITY_TO_FRONTEND: Record<BackendPriority, TaskPriority> = {
  LOW: 'LOW',
  NORMAL: 'MEDIUM',
  IMPORTANT: 'HIGH',
  URGENT: 'URGENT',
};
const PRIORITY_TO_BACKEND: Record<TaskPriority, BackendPriority> = {
  LOW: 'LOW',
  MEDIUM: 'NORMAL',
  HIGH: 'IMPORTANT',
  URGENT: 'URGENT',
};

// Backend has no BACKLOG - both map to NEW. CANCELLED tasks are filtered out before
// reaching this map (the frontend has no UI concept for a cancelled task).
const STATUS_TO_FRONTEND: Record<Exclude<BackendStatus, 'CANCELLED'>, TaskStatus> = {
  NEW: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_EDITING: 'EDITING',
  REVIEW: 'REVIEW',
  BLOCKED: 'BLOCKED',
  COMPLETED: 'DONE',
};
const STATUS_TO_BACKEND: Record<TaskStatus, BackendStatus> = {
  BACKLOG: 'NEW',
  TODO: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  EDITING: 'IN_EDITING',
  REVIEW: 'REVIEW',
  DONE: 'COMPLETED',
  BLOCKED: 'BLOCKED',
};

export interface TaskChecklistItem {
  text: string;
  done: boolean;
}

/** A subtask is a real, independent Task under the hood (its own status/assignee) - this is
 * just the lightweight shape shown nested inside its parent's edit form. */
export interface TaskSubtask {
  id: string;
  title: string;
  status: TaskStatus;
  assigneeId: string;
  assigneeName: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  contentType: string;
  size: number;
  available: boolean;
}

/** The list endpoint's shape: every Task field plus the extra bits the Tasks page's row/form need.
 * `id` is narrowed to `string` (the mapper always produces one) so callers don't need to coerce it. */
export interface TaskListItem extends Omit<Task, 'id'> {
  id: string;
  assigneeIds: string[];
  checklistSummary: string;
  fileCount: number;
  /** Montaj bo'limi only. */
  revisionCount: number;
  finishedAt?: string;
  approvedByName?: string;
}

/** Full detail (fetched on open-to-edit) - includes actual checklist rows and attachment metadata. */
export interface TaskDetail extends TaskListItem {
  checklistItems: TaskChecklistItem[];
  attachments: TaskAttachment[];
  reminderMinutes?: number;
  groupId?: string;
  topicId?: string;
  /** Dizayn bo'limi only - platform (Instagram/Telegram/...) the design is for. Format is
   * folded into `tags[0]` instead, reusing the Kanban card's existing category-badge slot. */
  platform?: string;
  /** Set when this task is itself a subtask of another (never more than one level deep). */
  parentTaskId?: string;
  /** Independent sub-tasks nested under this one (e.g. a Dizayn bo'limi TZ's own deliverables) -
   * each is a real task with its own status/assignee, shown inline in the edit form. */
  subtasks: TaskSubtask[];
  /** Dizayn bo'limi only - reference URLs ("Havolalar"), capped at 5. */
  links: string[];
}

function toTaskListItem(dto: TaskDto): TaskListItem {
  // Prefer the enriched `assignees` list (present on detail/create/update responses); fall back
  // to the bare `assigneeIds` ids (all the list endpoint ever returns) with no name/avatar yet -
  // the caller resolves those from its own employee list.
  const primary = dto.assignees[0];
  const primaryId = primary ? primary.id : dto.assigneeIds[0];
  const assigneeIds = (dto.assignees.length > 0 ? dto.assignees.map((a) => a.id) : dto.assigneeIds).map(String);
  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description ?? undefined,
    priority: PRIORITY_TO_FRONTEND[dto.priority],
    status: STATUS_TO_FRONTEND[dto.status as Exclude<BackendStatus, 'CANCELLED'>],
    assigneeId: primaryId != null ? String(primaryId) : '',
    assigneeName: primary ? primary.name : '',
    assigneeAvatar: primary?.photoUrl ?? undefined,
    assigneeIds,
    projectId: dto.projectId != null ? String(dto.projectId) : '',
    projectName: dto.projectName ?? '',
    dueDate: dto.dueAt ?? dto.createdAt,
    tags: dto.format ? [dto.format] : [],
    checklistSummary: dto.checklist,
    fileCount: dto.files,
    revisionCount: dto.revisionCount,
    finishedAt: dto.finishedAt ?? undefined,
    approvedByName: dto.approvedByName ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function toTaskDetail(dto: TaskDto): TaskDetail {
  return {
    ...toTaskListItem(dto),
    checklistItems: dto.checklistItems.map((item) => ({ text: item.text, done: item.done })),
    attachments: dto.attachments.map((a) => ({
      id: String(a.id),
      name: a.name,
      contentType: a.contentType,
      size: a.size,
      available: a.available,
    })),
    reminderMinutes: dto.reminderMinutes ?? undefined,
    groupId: dto.groupId != null ? String(dto.groupId) : undefined,
    topicId: dto.topicId != null ? String(dto.topicId) : undefined,
    platform: dto.platform ?? undefined,
    parentTaskId: dto.parentTaskId != null ? String(dto.parentTaskId) : undefined,
    subtasks: dto.subtasks.map((s) => {
      const assignee = s.assignees[0];
      return {
        id: String(s.id),
        title: s.title,
        status: STATUS_TO_FRONTEND[s.status as Exclude<BackendStatus, 'CANCELLED'>],
        assigneeId: assignee ? String(assignee.id) : '',
        assigneeName: assignee ? assignee.name : '',
      };
    }),
    links: dto.links,
  };
}

function currentWorkspaceId(): number {
  const { activeWorkspaceId } = getAuthStore();
  if (activeWorkspaceId == null) throw new Error('Ish maydoni tanlanmagan');
  return activeWorkspaceId;
}

/** `<input type="date">` gives yyyy-mm-dd; treat it as end-of-local-day so a due date of
 * "today" still passes the backend's "must be in the future" create validation. */
function toDueAt(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  return new Date(`${dateStr}T23:59:00`).toISOString();
}

export interface TaskInput {
  title: string;
  description?: string;
  assigneeIds: string[];
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  checklist?: TaskChecklistItem[];
  reminderMinutes?: number;
  files?: File[];
  /** Where the task lives: the workspace generally, or a specific linked Telegram group
   * (optionally a topic/thread within it) - matching the task creator's own visibility. */
  groupId?: string;
  topicId?: string;
  /** Dizayn bo'limi only. */
  format?: string;
  platform?: string;
  /** Optional link to a project, shown on that project's detail page. */
  projectId?: string;
  /** Set to make this a subtask nested under an existing task (e.g. a Dizayn bo'limi TZ). */
  parentTaskId?: string;
  /** Dizayn bo'limi only - reference URLs ("Havolalar"), capped at 5. */
  links?: string[];
}

function buildTaskPayload(data: TaskInput, extra: Record<string, unknown> = {}) {
  return {
    title: data.title,
    description: data.description || undefined,
    status: STATUS_TO_BACKEND[data.status],
    priority: PRIORITY_TO_BACKEND[data.priority],
    visibility: data.groupId ? 'GROUP' : 'WORKSPACE',
    groupId: data.groupId ? Number(data.groupId) : undefined,
    topicId: data.topicId ? Number(data.topicId) : undefined,
    dueAt: toDueAt(data.dueDate),
    assigneeIds: data.assigneeIds.map(Number),
    checklist: data.checklist && data.checklist.length > 0
      ? data.checklist.map((item) => ({ text: item.text, done: item.done }))
      : undefined,
    reminderMinutes: data.reminderMinutes,
    format: data.format || undefined,
    platform: data.platform || undefined,
    projectId: data.projectId ? Number(data.projectId) : undefined,
    parentTaskId: data.parentTaskId ? Number(data.parentTaskId) : undefined,
    links: data.links && data.links.length > 0 ? data.links.filter((url) => url.trim()) : undefined,
    ...extra,
  };
}

function toMultipartForm(task: Record<string, unknown>, files: File[]): FormData {
  const form = new FormData();
  form.append('task', new Blob([JSON.stringify(task)], { type: 'application/json' }));
  files.forEach((file) => form.append('files', file));
  return form;
}

export const tasksApi = {
  list: async (): Promise<TaskListItem[]> => {
    const response = await api.get<TaskDto[]>('/tasks', { scope: 'ALL' });
    return response.data.filter((t) => t.status !== 'CANCELLED').map(toTaskListItem);
  },

  detail: async (id: string): Promise<TaskDetail> => {
    const response = await api.get<TaskDto>(`/tasks/${id}`);
    return toTaskDetail(response.data);
  },

  create: async (data: TaskInput): Promise<TaskListItem> => {
    const payload = buildTaskPayload(data, { workspaceId: currentWorkspaceId() });
    const response = data.files && data.files.length > 0
      ? await api.postForm<TaskDto>('/tasks', toMultipartForm(payload, data.files))
      : await api.post<TaskDto>('/tasks', payload);
    return toTaskListItem(response.data);
  },

  update: async (id: string, data: TaskInput): Promise<TaskListItem> => {
    const payload = buildTaskPayload(data, { dueAtProvided: true, reminderProvided: true });
    const response = data.files && data.files.length > 0
      ? await api.putForm<TaskDto>(`/tasks/${id}`, toMultipartForm(payload, data.files))
      : await api.put<TaskDto>(`/tasks/${id}`, payload);
    return toTaskListItem(response.data);
  },

  changeStatus: async (id: string, status: TaskStatus): Promise<TaskListItem> => {
    const response = await api.patch<TaskDto>(`/tasks/${id}/status`, { status: STATUS_TO_BACKEND[status] });
    return toTaskListItem(response.data);
  },

  /** Montaj bo'limi: drag-to-reassign between editor columns, or an editor's "Olish" claim. */
  reassign: async (id: string, assigneeIds: string[]): Promise<TaskListItem> => {
    const response = await api.patch<TaskDto>(`/tasks/${id}/reassign`, { assigneeIds: assigneeIds.map(Number) });
    return toTaskListItem(response.data);
  },

  approve: async (id: string): Promise<TaskListItem> => {
    const response = await api.patch<TaskDto>(`/tasks/${id}/approve`, {});
    return toTaskListItem(response.data);
  },

  requestRevision: async (id: string): Promise<TaskListItem> => {
    const response = await api.patch<TaskDto>(`/tasks/${id}/request-revision`, {});
    return toTaskListItem(response.data);
  },

  // The backend only hard-deletes an already-archived task (two-step by design). A plain
  // DELETE on an active task 404s, so "delete" here archives it - it drops off every list
  // query (deleted_at IS NULL) exactly like a real delete would from this page's perspective.
  remove: async (id: string): Promise<void> => {
    await api.post(`/tasks/${id}/archive`);
  },
};
