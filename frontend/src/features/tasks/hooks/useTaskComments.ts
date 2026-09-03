import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { taskCommentsApi } from '../api/taskCommentsApi';

export const useTaskComments = (taskId: string | undefined) =>
  useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: () => taskCommentsApi.list(taskId as string),
    enabled: !!taskId,
    staleTime: 15_000,
  });

export function useAddTaskComment(taskId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => taskCommentsApi.create(taskId as string, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Izoh qo'shishda xatolik yuz berdi");
    },
  });
}
