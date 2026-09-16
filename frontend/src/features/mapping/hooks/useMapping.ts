import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { mappingApi } from '../api/mappingApi';
import type { MappingFlowFormData } from '../components/MappingFlowForm';

export const useMappingFlows = () =>
  useQuery({
    queryKey: ['mapping-flows'],
    queryFn: mappingApi.list,
  });

export function useCreateMappingFlow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MappingFlowFormData) => mappingApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapping-flows'] });
      toast.success('Jarayon sxemasi yaratildi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Jarayon sxemasini yaratishda xatolik yuz berdi');
    },
  });
}

export function useUpdateMappingFlow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MappingFlowFormData }) => mappingApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapping-flows'] });
      toast.success('Jarayon sxemasi yangilandi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Jarayon sxemasini yangilashda xatolik yuz berdi');
    },
  });
}

export function useSetMappingFlowActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => mappingApi.setActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapping-flows'] });
      toast.success('Faol jarayon o\'zgartirildi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Faol qilishda xatolik yuz berdi');
    },
  });
}

export function useDeleteMappingFlow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mappingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mapping-flows'] });
      toast.success('Jarayon sxemasi o\'chirildi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Jarayon sxemasini o\'chirishda xatolik yuz berdi');
    },
  });
}
