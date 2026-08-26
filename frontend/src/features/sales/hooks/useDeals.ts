import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dealsApi, type DealInput } from '../api/dealsApi';
import type { DealStage } from '@/shared/types';

export const useDeals = () =>
  useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsApi.list(),
    staleTime: 30_000,
  });

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DealInput) => dealsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Bitim yaratildi');
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Bitim yaratishda xatolik yuz berdi'),
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DealInput }) => dealsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Bitim yangilandi');
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Bitimni yangilashda xatolik yuz berdi'),
  });
}

export function useChangeDealStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: DealStage }) => dealsApi.changeStage(id, stage),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
    onError: (error: { message?: string }) => toast.error(error.message || 'Bosqichni yangilashda xatolik yuz berdi'),
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dealsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success("Bitim o'chirildi");
    },
    onError: (error: { message?: string }) => toast.error(error.message || "Bitimni o'chirishda xatolik yuz berdi"),
  });
}
