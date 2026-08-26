import { api } from '@/shared/lib/api';
import type { MappingFlow, MappingStep, UserRole } from '@/shared/types';

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

export const mappingApi = {
  list: async (): Promise<MappingFlow[]> => {
    const response = await api.get<MappingFlowDto[]>('/mapping-flows');
    return response.data.map(toFlow);
  },
};
