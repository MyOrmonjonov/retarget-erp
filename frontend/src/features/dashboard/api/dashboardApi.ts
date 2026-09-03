import { api } from '@/shared/lib/api';
import type { DashboardStats, ProjectPriority, ProjectStatus } from '@/shared/types';

interface DashboardOverviewDto {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalEmployees: number;
  pendingApprovals: number;
  motivationScore: number;
  teamLoad: {
    employeeId: number;
    name: string;
    avatar: string | null;
    load: number;
    activeTasks: number;
    overdueTasks: number;
    projectCount: number;
  }[];
  topEmployee: {
    id: number;
    name: string;
    avatar: string | null;
    position: string | null;
    department: string | null;
    kpiScore: number;
    completedTasks: number;
    projectCount: number;
  } | null;
  projectStatus: {
    id: number;
    name: string;
    client: string;
    type: string | null;
    status: ProjectStatus;
    priority: ProjectPriority;
    progress: number;
    managerName: string | null;
    managerAvatar: string | null;
  }[];
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
      teamLoad: data.teamLoad.map((member) => ({
        employeeId: member.employeeId,
        name: member.name,
        avatar: member.avatar ?? undefined,
        load: member.load,
        activeTasks: member.activeTasks,
        overdueTasks: member.overdueTasks,
        projectCount: member.projectCount,
      })),
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
      type: p.type ?? undefined,
      status: p.status,
      priority: p.priority,
      progress: p.progress,
      managerName: p.managerName ?? undefined,
      managerAvatar: p.managerAvatar ?? undefined,
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
      department: data.topEmployee.department ?? '',
      kpiScore: data.topEmployee.kpiScore,
      completedTasks: data.topEmployee.completedTasks,
      projectCount: data.topEmployee.projectCount,
    };
  },

  getTeamLoad: async () => {
    const data = await fetchOverview();
    return data.teamLoad.map((member) => ({
      employeeId: member.employeeId,
      name: member.name,
      avatar: member.avatar ?? undefined,
      load: member.load,
      activeTasks: member.activeTasks,
      overdueTasks: member.overdueTasks,
      projectCount: member.projectCount,
    }));
  },

  getMotivationScore: async (): Promise<number> => {
    const data = await fetchOverview();
    return data.motivationScore;
  },
};
