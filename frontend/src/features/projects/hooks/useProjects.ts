import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { projectsApi } from '../api/projectsApi';
import type { ProjectFormData } from '../components/ProjectForm';
import type { ProjectStatus } from '@/shared/types';

export const useProjects = () =>
  useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
    staleTime: 30_000,
  });

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectFormData) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Loyiha yaratildi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Loyihani yaratishda xatolik yuz berdi');
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectFormData }) => projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Loyiha yangilandi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Loyihani yangilashda xatolik yuz berdi');
    },
  });
}

export function useChangeProjectStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) => projectsApi.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Statusni o\'zgartirishda xatolik yuz berdi');
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success("Loyiha o'chirildi");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Loyihani o'chirishda xatolik yuz berdi");
    },
  });
}
