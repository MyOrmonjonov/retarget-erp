import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { shootingApi, type ShootingEventInput } from '../api/shootingApi';

export const useShootingEvents = () =>
  useQuery({
    queryKey: ['shooting-events'],
    queryFn: () => shootingApi.list(),
    staleTime: 30_000,
  });

export function useCreateShootingEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ShootingEventInput) => shootingApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shooting-events'] });
      toast.success('Syomka qo\'shildi');
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Syomka qo\'shishda xatolik yuz berdi'),
  });
}

export function useUpdateShootingEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ShootingEventInput }) => shootingApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shooting-events'] });
      toast.success('Syomka yangilandi');
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Syomkani yangilashda xatolik yuz berdi'),
  });
}

export function useDeleteShootingEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shootingApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shooting-events'] });
      toast.success("Syomka o'chirildi");
    },
    onError: (error: { message?: string }) => toast.error(error.message || "Syomkani o'chirishda xatolik yuz berdi"),
  });
}
