import { api } from '@/shared/lib/api';
import type { DashboardStats } from '@/shared/types';
import { mockDashboardApi } from './mockDashboardApi';

// Check if we should use mock data (when backend is not available or explicitly disabled)
const USE_MOCK_API = import.meta.env.VITE_USE_REAL_API !== 'true';

/**
 * Dashboard API - Uses mock data in development, real API in production
 */
export const dashboardApi = {
  /** Get dashboard statistics */
  getStats: async (): Promise<DashboardStats> => {
    if (USE_MOCK_API) {
      return mockDashboardApi.getStats();
    }
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  /** Get project status list for dashboard */
  getProjectStatus: async (): Promise<
    Array<{
      id: number;
      name: string;
      client: string;
      status: string;
      statusColor: string;
      progress: number;
    }>
  > => {
    if (USE_MOCK_API) {
      return mockDashboardApi.getProjectStatus();
    }
    const response = await api.get<Array<{
      id: number;
      name: string;
      client: string;
      status: string;
      statusColor: string;
      progress: number;
    }>>('/dashboard/projects/status');
    return response.data;
  },

  /** Get top employee */
  getTopEmployee: async (): Promise<
    | null
    | {
        id: string;
        name: string;
        avatar?: string;
        position: string;
        kpiScore: number;
        completedTasks: number;
        onTimeRate: number;
      }
  > => {
    if (USE_MOCK_API) {
      return mockDashboardApi.getTopEmployee();
    }
    const response = await api.get<{
      id: string;
      name: string;
      avatar?: string;
      position: string;
      kpiScore: number;
      completedTasks: number;
      onTimeRate: number;
    } | null>('/dashboard/top-employee');
    return response.data;
  },

  /** Get team load by department */
  getTeamLoad: async (): Promise<
    Array<{
      department: string;
      load: number;
      employeeCount: number;
    }>
  > => {
    if (USE_MOCK_API) {
      return mockDashboardApi.getTeamLoad();
    }
    const response = await api.get<Array<{
      department: string;
      load: number;
      employeeCount: number;
    }>>('/dashboard/team-load');
    return response.data;
  },

  /** Get motivation score */
  getMotivationScore: async (): Promise<number> => {
    if (USE_MOCK_API) {
      return mockDashboardApi.getMotivationScore();
    }
    const response = await api.get<number>('/dashboard/motivation');
    return response.data;
  },
};