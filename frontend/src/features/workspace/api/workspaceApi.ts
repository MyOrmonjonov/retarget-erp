import { api } from '@/shared/lib/api';
import type { AuthWorkspace } from '@/shared/types';

interface WorkspaceDto {
  id: number;
  name: string;
  role: string;
}

function toWorkspace(dto: WorkspaceDto): AuthWorkspace {
  return { id: dto.id, name: dto.name, role: dto.role };
}

export const workspaceApi = {
  create: async (name: string): Promise<AuthWorkspace> => {
    const response = await api.post<WorkspaceDto>('/workspaces', { name });
    return toWorkspace(response.data);
  },

  rename: async (id: number, name: string): Promise<AuthWorkspace> => {
    const response = await api.put<WorkspaceDto>(`/workspaces/${id}`, { name });
    return toWorkspace(response.data);
  },
};
