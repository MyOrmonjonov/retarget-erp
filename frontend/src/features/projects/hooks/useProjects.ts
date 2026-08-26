import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { projectsApi } from '../api/projectsApi';
import { getAuthStore } from '@/features/auth/store/authStore';
import type { ProjectFormData } from '../components/ProjectForm';

export const useProjects = () =>
  useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
    staleTime: 30_000,
  });

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectFormData) => {
      const managerId = getAuthStore().user?.id;
      if (!managerId) throw new Error('Foydalanuvchi aniqlanmadi');
      return projectsApi.create(data, managerId);
    },
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
    mutationFn: ({ id, data, managerId }: { id: string; data: ProjectFormData; managerId: string }) =>
      projectsApi.update(id, data, managerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Loyiha yangilandi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Loyihani yangilashda xatolik yuz berdi');
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
