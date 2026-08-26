import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeesApi, type EmployeeProfileInput } from '../api/employeesApi';
import { getAuthStore } from '@/features/auth/store/authStore';
import type { EmployeeStatus } from '@/shared/types';

export const useEmployees = () =>
  useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.list(),
    staleTime: 30_000,
  });

export const useAvailableMembers = (enabled: boolean) =>
  useQuery({
    queryKey: ['employees', 'available-members'],
    queryFn: () => {
      const { activeWorkspaceId } = getAuthStore();
      if (activeWorkspaceId == null) throw new Error('Ish maydoni tanlanmagan');
      return employeesApi.listAvailableMembers(activeWorkspaceId);
    },
    enabled,
  });

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, input }: { userId: number; input: EmployeeProfileInput }) => {
      const { activeWorkspaceId } = getAuthStore();
      if (activeWorkspaceId == null) throw new Error('Ish maydoni tanlanmagan');
      return employeesApi.create(userId, input, activeWorkspaceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Xodim qo\'shildi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Xodim qo\'shishda xatolik yuz berdi');
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EmployeeProfileInput }) => employeesApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Xodim yangilandi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Xodimni yangilashda xatolik yuz berdi');
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success("Xodim o'chirildi");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Xodimni o'chirishda xatolik yuz berdi");
    },
  });
}

export function useChangeEmployeeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EmployeeStatus }) => employeesApi.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Holatni yangilashda xatolik yuz berdi');
    },
  });
}
