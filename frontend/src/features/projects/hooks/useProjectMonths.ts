import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { projectMonthsApi, type ProjectMonthStatus } from '../api/projectMonthsApi';

export const useProjectMonths = (projectId: string) =>
  useQuery({
    queryKey: ['project-months', projectId],
    queryFn: () => projectMonthsApi.list(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });

export function useUpsertProjectMonth(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ monthKey, data }: { monthKey: string; data?: { displayName?: string; status?: ProjectMonthStatus } }) =>
      projectMonthsApi.upsert(projectId, monthKey, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-months', projectId] });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Oyni yangilashda xatolik yuz berdi");
    },
  });
}

export function useDeleteProjectMonth(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (monthKey: string) => projectMonthsApi.delete(projectId, monthKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-months', projectId] });
      toast.success("Oy o'chirildi");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Oyni o'chirishda xatolik yuz berdi");
    },
  });
}
