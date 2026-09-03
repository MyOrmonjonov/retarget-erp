import { api } from '@/shared/lib/api';

export interface ContentPlanItem {
  id: string;
  projectId: string;
  date: string;
  topic: string;
  caption: string;
  note: string;
  format: string;
  platforms: string[];
  statuses: string[];
  ownerIds: string[];
}

export interface ContentPlanItemInput {
  date: string;
  topic: string;
  caption: string;
  note: string;
  format: string;
  platforms: string[];
  statuses: string[];
  ownerIds: string[];
}

interface ContentPlanItemDto {
  id: number;
  projectId: number;
  date: string;
  topic: string | null;
  caption: string | null;
  note: string | null;
  format: string | null;
  platforms: string[];
  statuses: string[];
  ownerIds: string[];
}

function toContentPlanItem(dto: ContentPlanItemDto): ContentPlanItem {
  return {
    id: String(dto.id),
    projectId: String(dto.projectId),
    date: dto.date,
    topic: dto.topic ?? '',
    caption: dto.caption ?? '',
    note: dto.note ?? '',
    format: dto.format ?? '',
    platforms: dto.platforms,
    statuses: dto.statuses,
    ownerIds: dto.ownerIds.map(String),
  };
}

function toPayload(data: ContentPlanItemInput) {
  return {
    date: data.date,
    topic: data.topic || undefined,
    caption: data.caption || undefined,
    note: data.note || undefined,
    format: data.format || undefined,
    platforms: data.platforms,
    statuses: data.statuses,
    ownerIds: data.ownerIds,
  };
}

export const contentPlanApi = {
  list: async (projectId: string): Promise<ContentPlanItem[]> => {
    const response = await api.get<ContentPlanItemDto[]>(`/projects/${projectId}/content-plan`);
    return response.data.map(toContentPlanItem);
  },

  create: async (projectId: string, data: ContentPlanItemInput): Promise<ContentPlanItem> => {
    const response = await api.post<ContentPlanItemDto>(`/projects/${projectId}/content-plan`, toPayload(data));
    return toContentPlanItem(response.data);
  },

  update: async (projectId: string, itemId: string, data: ContentPlanItemInput): Promise<ContentPlanItem> => {
    const response = await api.put<ContentPlanItemDto>(`/projects/${projectId}/content-plan/${itemId}`, toPayload(data));
    return toContentPlanItem(response.data);
  },

  delete: async (projectId: string, itemId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/content-plan/${itemId}`);
  },
};
