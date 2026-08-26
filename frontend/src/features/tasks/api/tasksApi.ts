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

interface TaskDto {
  id: number;
  title: string;
  description: string | null;
  status: BackendStatus;
  priority: BackendPriority;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
  // The list endpoint always returns this empty (person details are only populated on the
  // single-task detail/create/update responses) - assigneeIds is the reliable field everywhere.
  assigneeIds: number[];
  assignees: TaskPersonDto[];
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

function toTask(dto: TaskDto): Task {
  // Prefer the enriched `assignees` list (present on detail/create/update responses); fall back
  // to the bare `assigneeIds` id (all the list endpoint ever returns) with no name/avatar yet -
  // the caller resolves those from its own employee list, see resolveAssigneeDisplay below.
  const primary = dto.assignees[0];
  const primaryId = primary ? primary.id : dto.assigneeIds[0];
  return {
    id: String(dto.id),
    title: dto.title,
    description: dto.description ?? undefined,
    priority: PRIORITY_TO_FRONTEND[dto.priority],
    status: STATUS_TO_FRONTEND[dto.status as Exclude<BackendStatus, 'CANCELLED'>],
    assigneeId: primaryId != null ? String(primaryId) : '',
    assigneeName: primary ? primary.name : '',
    assigneeAvatar: primary?.photoUrl ?? undefined,
    // Backend tasks aren't linked to a project (that link doesn't exist yet) - left blank,
    // the Tasks page doesn't render these fields.
    projectId: '',
    projectName: '',
    dueDate: dto.dueAt ?? dto.createdAt,
    tags: [],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
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
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
}

export const tasksApi = {
  list: async (): Promise<Task[]> => {
    const response = await api.get<TaskDto[]>('/tasks', { scope: 'ALL' });
    return response.data.filter((t) => t.status !== 'CANCELLED').map(toTask);
  },

  create: async (data: TaskInput): Promise<Task> => {
    const response = await api.post<TaskDto>('/tasks', {
      workspaceId: currentWorkspaceId(),
      title: data.title,
      description: data.description || undefined,
      status: STATUS_TO_BACKEND[data.status],
      priority: PRIORITY_TO_BACKEND[data.priority],
      visibility: 'WORKSPACE',
      dueAt: toDueAt(data.dueDate),
      assigneeIds: data.assigneeId ? [Number(data.assigneeId)] : [],
    });
    return toTask(response.data);
  },

  update: async (id: string, data: TaskInput): Promise<Task> => {
    const response = await api.put<TaskDto>(`/tasks/${id}`, {
      title: data.title,
      description: data.description || undefined,
      status: STATUS_TO_BACKEND[data.status],
      priority: PRIORITY_TO_BACKEND[data.priority],
      visibility: 'WORKSPACE',
      assigneeIds: data.assigneeId ? [Number(data.assigneeId)] : [],
      dueAt: toDueAt(data.dueDate),
      dueAtProvided: true,
    });
    return toTask(response.data);
  },

  changeStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    const response = await api.patch<TaskDto>(`/tasks/${id}/status`, { status: STATUS_TO_BACKEND[status] });
    return toTask(response.data);
  },

  // The backend only hard-deletes an already-archived task (two-step by design). A plain
  // DELETE on an active task 404s, so "delete" here archives it - it drops off every list
  // query (deleted_at IS NULL) exactly like a real delete would from this page's perspective.
  remove: async (id: string): Promise<void> => {
    await api.post(`/tasks/${id}/archive`);
  },
};
