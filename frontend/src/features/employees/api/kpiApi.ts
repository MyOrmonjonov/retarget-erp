import { api } from '@/shared/lib/api';

export interface KpiRecordDto {
  id: number;
  workspaceId: number;
  employeeId: number;
  period: string;
  target: number;
  actual: number;
  score: number;
  metrics: {
    tasksCompleted: number;
    tasksOnTime: number;
    qualityScore: number;
    collaborationScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const kpiApi = {
  listForPeriod: async (period: string): Promise<KpiRecordDto[]> => {
    const response = await api.get<KpiRecordDto[]>('/kpi', { period });
    return response.data;
  },
};
