import { api } from '@/shared/lib/api';
import { getAuthStore } from '@/features/auth/store/authStore';
import type { ShootingEvent, ShootingEventStatus, ShootingEventType } from '@/shared/types';

interface ShootingEventDto {
  id: number;
  workspaceId: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string | null;
  type: ShootingEventType;
  status: ShootingEventStatus;
  team: number[];
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

function toEvent(dto: ShootingEventDto): ShootingEvent {
  return {
    id: String(dto.id),
    title: dto.title,
    date: dto.date,
    startTime: dto.startTime,
    endTime: dto.endTime,
    location: dto.location ?? '',
    type: dto.type,
    status: dto.status,
    team: dto.team.map(String),
    description: dto.description ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export interface ShootingEventInput {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: ShootingEventType;
  description?: string;
  team?: number[];
}

function currentWorkspaceId(): number {
  const { activeWorkspaceId } = getAuthStore();
  if (activeWorkspaceId == null) throw new Error('Ish maydoni tanlanmagan');
  return activeWorkspaceId;
}

export const shootingApi = {
  list: async (): Promise<ShootingEvent[]> => {
    const response = await api.get<ShootingEventDto[]>('/shooting-events');
    return response.data.map(toEvent);
  },

  create: async (input: ShootingEventInput): Promise<ShootingEvent> => {
    const response = await api.post<ShootingEventDto>('/shooting-events', {
      workspaceId: currentWorkspaceId(),
      ...input,
    });
    return toEvent(response.data);
  },

  update: async (id: string, input: ShootingEventInput): Promise<ShootingEvent> => {
    const response = await api.put<ShootingEventDto>(`/shooting-events/${id}`, input);
    return toEvent(response.data);
  },

  changeStatus: async (id: string, status: ShootingEventStatus): Promise<ShootingEvent> => {
    const response = await api.patch<ShootingEventDto>(`/shooting-events/${id}/status`, { status });
    return toEvent(response.data);
  },
};
