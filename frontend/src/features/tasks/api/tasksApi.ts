import { api } from '@/shared/lib/api';
import { getAuthStore } from '@/features/auth/store/authStore';
import type { Task, TaskPriority, TaskStatus } from '@/shared/types';

type BackendPriority = 'LOW' | 'NORMAL' | 'IMPORTANT' | 'URGENT';
type BackendStatus = 'NEW' | 'IN_PROGRESS' | 'REVIEW' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';

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
  REVIEW: 'REVIEW',
  BLOCKED: 'BLOCKED',
  COMPLETED: 'DONE',
};
const STATUS_TO_BACKEND: Record<TaskStatus, BackendStatus> = {
  BACKLOG: 'NEW',
  TODO: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  DONE: 'COMPLETED',
  BLOCKED: 'BLOCKED',
};

export interface TaskChecklistItem {
  text: string;
  done: boolean;
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
}

/** Full detail (fetched on open-to-edit) - includes actual checklist rows and attachment metadata. */
export interface TaskDetail extends TaskListItem {
  checklistItems: TaskChecklistItem[];
  attachments: TaskAttachment[];
  reminderMinutes?: number;
  groupId?: string;
  topicId?: string;
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
    // Backend tasks aren't linked to a project (that link doesn't exist yet) - left blank,
    // the Tasks page doesn't render these fields.
    projectId: '',
    projectName: '',
    dueDate: dto.dueAt ?? dto.createdAt,
    tags: [],
    checklistSummary: dto.checklist,
    fileCount: dto.files,
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

  // The backend only hard-deletes an already-archived task (two-step by design). A plain
  // DELETE on an active task 404s, so "delete" here archives it - it drops off every list
  // query (deleted_at IS NULL) exactly like a real delete would from this page's perspective.
  remove: async (id: string): Promise<void> => {
    await api.post(`/tasks/${id}/archive`);
  },
};
