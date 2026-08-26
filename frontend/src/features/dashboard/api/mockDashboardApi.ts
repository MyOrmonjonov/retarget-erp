/**
 * Mock Dashboard API - Returns realistic test data for development
 * Replace with real API calls when backend endpoints are ready
 */

import type { DashboardStats } from '@/shared/types';

export const mockDashboardApi = {
  /** Get dashboard statistics */
  getStats: async (): Promise<DashboardStats> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      totalProjects: 18,
      activeProjects: 12,
      totalTasks: 210,
      completedTasks: 134,
      totalEmployees: 24,
      pendingApprovals: 7,
      motivationScore: 78,
      teamLoad: [
        { department: 'Aziz K.', load: 78, employeeCount: 1 },
        { department: 'Malika Y.', load: 65, employeeCount: 1 },
        { department: 'Bekzod T.', load: 40, employeeCount: 1 },
      ],
      topEmployee: {
        id: '1',
        name: 'Malika Yusupova',
        avatar: undefined,
        kpiScore: 92,
        completedTasks: 41,
      },
    };
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
    await new Promise((resolve) => setTimeout(resolve, 200));

    return [
      { id: 1, name: 'Instagram Rebrand', client: 'Coffee Lab · SMM', status: 'Jarayonda', statusColor: 'success', progress: 83 },
      { id: 2, name: 'Winter Campaign', client: 'UrbanFit · Reklama', status: 'Rejalashtirildi', statusColor: 'default', progress: 45 },
      { id: 3, name: 'Product Launch Video', client: 'NovaTech · Video', status: 'Yakunlandi', statusColor: 'success', progress: 100 },
      { id: 4, name: 'Corporate Rebrand', client: 'MegaGroup · Branding', status: "To'xtatildi", statusColor: 'error', progress: 15 },
    ];
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
    await new Promise((resolve) => setTimeout(resolve, 150));

    return {
      id: '1',
      name: 'Malika Yusupova',
      avatar: undefined,
      position: 'Menejer · Project Management',
      kpiScore: 92,
      completedTasks: 41,
      onTimeRate: 6,
    };
  },

  /** Get team load per employee */
  getTeamLoad: async (): Promise<
    Array<{
      department: string;
      load: number;
      employeeCount: number;
    }>
  > => {
    await new Promise((resolve) => setTimeout(resolve, 150));

    return [
      { department: 'Aziz K.', load: 78, employeeCount: 1 },
      { department: 'Malika Y.', load: 65, employeeCount: 1 },
      { department: 'Bekzod T.', load: 40, employeeCount: 1 },
    ];
  },

  /** Get motivation score */
  getMotivationScore: async (): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return 78;
  },
};