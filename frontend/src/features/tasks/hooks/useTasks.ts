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
      // A task's count/status feeds both the project progress ring (Loyihalar) and the
      // dashboard's team-load/project-status panels - keep them in sync with every task change.
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
      // A task's count/status feeds both the project progress ring (Loyihalar) and the
      // dashboard's team-load/project-status panels - keep them in sync with every task change.
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
      // A task's count/status feeds both the project progress ring (Loyihalar) and the
      // dashboard's team-load/project-status panels - keep them in sync with every task change.
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Statusni o\'zgartirishda xatolik yuz berdi');
    },
  });
}

export function useReassignTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assigneeIds }: { id: string; assigneeIds: string[] }) => tasksApi.reassign(id, assigneeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // A task's count/status feeds both the project progress ring (Loyihalar) and the
      // dashboard's team-load/project-status panels - keep them in sync with every task change.
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Vazifani qayta tayinlashda xatolik yuz berdi");
    },
  });
}

export function useApproveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // A task's count/status feeds both the project progress ring (Loyihalar) and the
      // dashboard's team-load/project-status panels - keep them in sync with every task change.
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Vazifa bajarildi deb belgilandi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Vazifani yakunlashda xatolik yuz berdi');
    },
  });
}

export function useRequestTaskRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.requestRevision(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // A task's count/status feeds both the project progress ring (Loyihalar) and the
      // dashboard's team-load/project-status panels - keep them in sync with every task change.
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Vazifa qayta ishlashga yuborildi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Amalni bajarishda xatolik yuz berdi');
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // A task's count/status feeds both the project progress ring (Loyihalar) and the
      // dashboard's team-load/project-status panels - keep them in sync with every task change.
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success("Vazifa o'chirildi");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Vazifani o'chirishda xatolik yuz berdi");
    },
  });
}
