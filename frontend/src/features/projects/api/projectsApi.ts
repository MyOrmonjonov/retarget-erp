import { api } from '@/shared/lib/api';
import { getAuthStore } from '@/features/auth/store/authStore';
import type { Project, ProjectStatus, ProjectPriority } from '@/shared/types';
import type { ProjectFormData } from '../components/ProjectForm';

interface ProjectDto {
  id: number;
  workspaceId: number;
  name: string;
  client: string;
  clientId: number | null;
  type: string | null;
  status: ProjectStatus;
  progress: number;
  progressTotal: number;
  progressDone: number;
  priority: ProjectPriority;
  managerId: number;
  managerName: string | null;
  managerAvatar: string | null;
  team: { userId: number; name: string; avatar: string | null }[];
  deadline: string | null;
  startDate: string | null;
  budget: number | null;
  description: string | null;
  reportBudget: number | null;
  reportLeads: number | null;
  reportCpl: number | null;
  reportSales: number | null;
  reportRoi: number | null;
  createdAt: string;
  updatedAt: string;
}

function toProject(dto: ProjectDto): Project {
  return {
    id: String(dto.id),
    name: dto.name,
    client: dto.client,
    clientId: dto.clientId != null ? String(dto.clientId) : undefined,
    type: dto.type ?? '',
    status: dto.status,
    progress: dto.progress,
    progressTotal: dto.progressTotal,
    progressDone: dto.progressDone,
    priority: dto.priority,
    managerId: String(dto.managerId),
    managerName: dto.managerName ?? '',
    managerAvatar: dto.managerAvatar ?? undefined,
    team: dto.team.map((m) => ({ userId: String(m.userId), name: m.name, avatar: m.avatar ?? undefined })),
    deadline: dto.deadline ?? '',
    startDate: dto.startDate ?? undefined,
    budget: dto.budget ?? undefined,
    description: dto.description ?? undefined,
    reportBudget: dto.reportBudget ?? undefined,
    reportLeads: dto.reportLeads ?? undefined,
    reportCpl: dto.reportCpl ?? undefined,
    reportSales: dto.reportSales ?? undefined,
    reportRoi: dto.reportRoi ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function currentWorkspaceId(): number {
  const { activeWorkspaceId } = getAuthStore();
  if (activeWorkspaceId == null) throw new Error('Ish maydoni tanlanmagan');
  return activeWorkspaceId;
}

export const projectsApi = {
  list: async (status?: ProjectStatus): Promise<Project[]> => {
    const response = await api.get<ProjectDto[]>('/projects', status ? { status } : undefined);
    return response.data.map(toProject);
  },

  create: async (data: ProjectFormData): Promise<Project> => {
    const response = await api.post<ProjectDto>('/projects', {
      workspaceId: currentWorkspaceId(),
      name: data.name,
      clientName: data.client,
      type: data.type,
      priority: data.priority,
      managerId: Number(data.managerId),
      startDate: data.startDate || undefined,
      deadline: data.deadline,
      budget: data.budget ? Number(data.budget) : undefined,
      description: data.description || undefined,
      teamUserIds: data.teamUserIds.map(Number),
    });
    return toProject(response.data);
  },

  update: async (id: string, data: ProjectFormData): Promise<Project> => {
    const response = await api.put<ProjectDto>(`/projects/${id}`, {
      name: data.name,
      clientName: data.client,
      type: data.type,
      priority: data.priority,
      managerId: Number(data.managerId),
      startDate: data.startDate || undefined,
      deadline: data.deadline,
      budget: data.budget ? Number(data.budget) : undefined,
      description: data.description || undefined,
      teamUserIds: data.teamUserIds.map(Number),
    });
    return toProject(response.data);
  },

  changeStatus: async (id: string, status: ProjectStatus): Promise<Project> => {
    const response = await api.patch<ProjectDto>(`/projects/${id}/status`, { status });
    return toProject(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  updateReport: async (id: string, report: {
    reportBudget?: number;
    reportLeads?: number;
    reportCpl?: number;
    reportSales?: number;
    reportRoi?: number;
  }): Promise<Project> => {
    const response = await api.patch<ProjectDto>(`/projects/${id}/report`, report);
    return toProject(response.data);
  },
};
