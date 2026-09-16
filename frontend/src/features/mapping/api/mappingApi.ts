import { api } from '@/shared/lib/api';
import { getAuthStore } from '@/features/auth/store/authStore';
import type { MappingFlow, MappingStep, UserRole } from '@/shared/types';
import type { MappingFlowFormData } from '../components/MappingFlowForm';

interface MappingFlowDto {
  id: number;
  workspaceId: number;
  name: string;
  description: string | null;
  isActive: boolean;
  steps: {
    id: number;
    name: string;
    description: string | null;
    order: number;
    department: string | null;
    responsibleRole: UserRole | null;
    estimatedDays: number;
    dependencies: number[];
  }[];
  createdAt: string;
  updatedAt: string;
}

function toFlow(dto: MappingFlowDto): MappingFlow {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? undefined,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    steps: dto.steps.map((s): MappingStep => ({
      id: String(s.id),
      name: s.name,
      description: s.description ?? undefined,
      order: s.order,
      department: s.department ?? '',
      responsibleRole: s.responsibleRole ?? undefined,
      estimatedDays: s.estimatedDays,
      dependencies: s.dependencies.map(String),
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    })),
  };
}

function currentWorkspaceId(): number {
  const { activeWorkspaceId } = getAuthStore();
  if (activeWorkspaceId == null) throw new Error('Ish maydoni tanlanmagan');
  return activeWorkspaceId;
}

function toStepInputs(data: MappingFlowFormData) {
  return data.steps.map((step) => ({
    name: step.name,
    description: step.description || undefined,
    department: step.department || undefined,
    responsibleRole: step.responsibleRole || undefined,
    estimatedDays: step.estimatedDays,
    dependencyIndexes: step.dependencyKeys
      .map((key) => data.steps.findIndex((s) => s.key === key))
      .filter((index) => index !== -1),
  }));
}

export const mappingApi = {
  list: async (): Promise<MappingFlow[]> => {
    const response = await api.get<MappingFlowDto[]>('/mapping-flows');
    return response.data.map(toFlow);
  },

  create: async (data: MappingFlowFormData): Promise<MappingFlow> => {
    const response = await api.post<MappingFlowDto>('/mapping-flows', {
      workspaceId: currentWorkspaceId(),
      name: data.name,
      description: data.description || undefined,
      steps: toStepInputs(data),
    });
    return toFlow(response.data);
  },

  update: async (id: string, data: MappingFlowFormData): Promise<MappingFlow> => {
    const response = await api.put<MappingFlowDto>(`/mapping-flows/${id}`, {
      name: data.name,
      description: data.description || undefined,
      steps: toStepInputs(data),
    });
    return toFlow(response.data);
  },

  setActive: async (id: string, isActive: boolean): Promise<MappingFlow> => {
    const response = await api.patch<MappingFlowDto>(`/mapping-flows/${id}/active`, { isActive });
    return toFlow(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/mapping-flows/${id}`);
  },
};
