import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { contentPlanApi, type ContentPlanItemInput } from '../api/contentPlanApi';

export const useContentPlan = (projectId: string) =>
  useQuery({
    queryKey: ['content-plan', projectId],
    queryFn: () => contentPlanApi.list(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });

export function useCreateContentPlanItem(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ContentPlanItemInput) => contentPlanApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-plan', projectId] });
      // Content plan items also count toward the project's progress ring - keep it in sync.
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Band qo\'shildi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Band qo'shishda xatolik yuz berdi");
    },
  });
}

export function useUpdateContentPlanItem(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: ContentPlanItemInput }) =>
      contentPlanApi.update(projectId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-plan', projectId] });
      // Content plan items also count toward the project's progress ring - keep it in sync.
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Band yangilandi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Bandni yangilashda xatolik yuz berdi');
    },
  });
}

export function useDeleteContentPlanItem(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => contentPlanApi.delete(projectId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-plan', projectId] });
      // Content plan items also count toward the project's progress ring - keep it in sync.
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success("Band o'chirildi");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Bandni o'chirishda xatolik yuz berdi");
    },
  });
}
