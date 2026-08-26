import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tasksApi, type TaskInput } from '../api/tasksApi';
import type { TaskStatus } from '@/shared/types';

export const useTasks = () =>
  useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list(),
    staleTime: 30_000,
  });

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskInput) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Vazifa yaratildi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Vazifani yaratishda xatolik yuz berdi');
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskInput }) => tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Vazifa yangilandi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Vazifani yangilashda xatolik yuz berdi');
    },
  });
}

export function useChangeTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => tasksApi.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Statusni o\'zgartirishda xatolik yuz berdi');
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Vazifa o'chirildi");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Vazifani o'chirishda xatolik yuz berdi");
    },
  });
}
