import { api } from '@/shared/lib/api';
import { getAuthStore } from '@/features/auth/store/authStore';
import type { Deal, DealStage } from '@/shared/types';

interface DealDto {
  id: number;
  workspaceId: number;
  title: string;
  client: string;
  value: number;
  stage: DealStage;
  probability: number;
  ownerId: number;
  ownerName: string | null;
  expectedCloseDate: string | null;
  description: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

function toDeal(dto: DealDto): Deal {
  return {
    id: String(dto.id),
    title: dto.title,
    client: dto.client,
    value: dto.value,
    stage: dto.stage,
    probability: dto.probability,
    ownerId: String(dto.ownerId),
    ownerName: dto.ownerName ?? '',
    expectedCloseDate: dto.expectedCloseDate ?? '',
    description: dto.description ?? undefined,
    contactPerson: dto.contactPerson ?? undefined,
    contactPhone: dto.contactPhone ?? undefined,
    contactEmail: dto.contactEmail ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export interface DealInput {
  title: string;
  client: string;
  value: number;
  probability: number;
  ownerId: string;
  expectedCloseDate?: string;
  description?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
}

function currentWorkspaceId(): number {
  const { activeWorkspaceId } = getAuthStore();
  if (activeWorkspaceId == null) throw new Error('Ish maydoni tanlanmagan');
  return activeWorkspaceId;
}

export const dealsApi = {
  list: async (): Promise<Deal[]> => {
    const response = await api.get<DealDto[]>('/deals');
    return response.data.map(toDeal);
  },

  create: async (input: DealInput): Promise<Deal> => {
    const response = await api.post<DealDto>('/deals', {
      workspaceId: currentWorkspaceId(),
      ...input,
      ownerId: Number(input.ownerId),
      expectedCloseDate: input.expectedCloseDate || undefined,
    });
    return toDeal(response.data);
  },

  update: async (id: string, input: DealInput): Promise<Deal> => {
    const response = await api.put<DealDto>(`/deals/${id}`, {
      ...input,
      ownerId: Number(input.ownerId),
      expectedCloseDate: input.expectedCloseDate || undefined,
    });
    return toDeal(response.data);
  },

  changeStage: async (id: string, stage: DealStage): Promise<Deal> => {
    const response = await api.patch<DealDto>(`/deals/${id}/stage`, { stage });
    return toDeal(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/deals/${id}`);
  },
};
