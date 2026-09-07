import { api } from '@/shared/lib/api';

export type ProjectMonthStatus = 'ACTIVE' | 'ARCHIVED';

export interface ProjectMonth {
  id: string;
  projectId: string;
  monthKey: string;
  displayName: string | null;
  status: ProjectMonthStatus;
}

interface ProjectMonthDto {
  id: number;
  projectId: number;
  monthKey: string;
  displayName: string | null;
  status: ProjectMonthStatus;
}

function toProjectMonth(dto: ProjectMonthDto): ProjectMonth {
  return {
    id: String(dto.id),
    projectId: String(dto.projectId),
    monthKey: dto.monthKey,
    displayName: dto.displayName,
    status: dto.status,
  };
}

export const projectMonthsApi = {
  list: async (projectId: string): Promise<ProjectMonth[]> => {
    const response = await api.get<ProjectMonthDto[]>(`/projects/${projectId}/months`);
    return response.data.map(toProjectMonth);
  },

  /** Creates the month's bookkeeping row if missing, otherwise updates only the given fields. */
  upsert: async (
    projectId: string,
    monthKey: string,
    data: { displayName?: string; status?: ProjectMonthStatus } = {}
  ): Promise<ProjectMonth> => {
    const response = await api.put<ProjectMonthDto>(`/projects/${projectId}/months/${monthKey}`, data);
    return toProjectMonth(response.data);
  },

  delete: async (projectId: string, monthKey: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/months/${monthKey}`);
  },
};
