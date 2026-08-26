import { api } from '@/shared/lib/api';
import type { DashboardStats, ProjectStatus } from '@/shared/types';

interface DashboardOverviewDto {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalEmployees: number;
  pendingApprovals: number;
  motivationScore: number;
  teamLoad: { department: string; load: number; employeeCount: number }[];
  topEmployee: {
    id: number;
    name: string;
    avatar: string | null;
    position: string | null;
    kpiScore: number;
    completedTasks: number;
    projectCount: number;
  } | null;
  projectStatus: { id: number; name: string; client: string; status: ProjectStatus; progress: number }[];
}

let overviewPromise: Promise<DashboardOverviewDto> | null = null;

/** All 5 dashboard queries share one backend call (react-query dedupes by queryKey; this module-level
 * cache is a safety net for the rare case something calls it outside of react-query). */
function fetchOverview(): Promise<DashboardOverviewDto> {
  if (!overviewPromise) {
    overviewPromise = api.get<DashboardOverviewDto>('/dashboard').then((r) => r.data);
    overviewPromise.finally(() => { overviewPromise = null; });
  }
  return overviewPromise;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const data = await fetchOverview();
    return {
      totalProjects: data.totalProjects,
      activeProjects: data.activeProjects,
      totalTasks: data.totalTasks,
      completedTasks: data.completedTasks,
      totalEmployees: data.totalEmployees,
      pendingApprovals: data.pendingApprovals,
      motivationScore: data.motivationScore,
      teamLoad: data.teamLoad,
      topEmployee: data.topEmployee
        ? {
            id: String(data.topEmployee.id),
            name: data.topEmployee.name,
            avatar: data.topEmployee.avatar ?? undefined,
            kpiScore: data.topEmployee.kpiScore,
            completedTasks: data.topEmployee.completedTasks,
          }
        : null,
    };
  },

  getProjectStatus: async () => {
    const data = await fetchOverview();
    return data.projectStatus.map((p) => ({
      id: p.id,
      name: p.name,
      client: p.client,
      status: p.status,
      progress: p.progress,
    }));
  },

  getTopEmployee: async () => {
    const data = await fetchOverview();
    if (!data.topEmployee) return null;
    return {
      id: String(data.topEmployee.id),
      name: data.topEmployee.name,
      avatar: data.topEmployee.avatar ?? undefined,
      position: data.topEmployee.position ?? '',
      kpiScore: data.topEmployee.kpiScore,
      completedTasks: data.topEmployee.completedTasks,
      projectCount: data.topEmployee.projectCount,
    };
  },

  getTeamLoad: async () => {
    const data = await fetchOverview();
    return data.teamLoad;
  },

  getMotivationScore: async (): Promise<number> => {
    const data = await fetchOverview();
    return data.motivationScore;
  },
};
