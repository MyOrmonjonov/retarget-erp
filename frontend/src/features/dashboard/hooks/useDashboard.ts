import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

export const useDashboardStats = () =>
  useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  });

export const useProjectStatus = () =>
  useQuery({
    queryKey: ['dashboard', 'projects', 'status'],
    queryFn: dashboardApi.getProjectStatus,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

export const useTopEmployee = () =>
  useQuery({
    queryKey: ['dashboard', 'top-employee'],
    queryFn: dashboardApi.getTopEmployee,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

export const useTeamLoad = () =>
  useQuery({
    queryKey: ['dashboard', 'team-load'],
    queryFn: dashboardApi.getTeamLoad,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

export const useMotivationScore = () =>
  useQuery({
    queryKey: ['dashboard', 'motivation'],
    queryFn: dashboardApi.getMotivationScore,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });