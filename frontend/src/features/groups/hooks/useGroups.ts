import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { groupsApi } from '../api/groupsApi';

export const useGroups = () =>
  useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.list(),
    staleTime: 15_000,
  });

export const useGroupTopics = (groupId: number | null) =>
  useQuery({
    queryKey: ['groups', groupId, 'topics'],
    queryFn: () => groupsApi.listTopics(groupId!),
    enabled: groupId != null,
    staleTime: 30_000,
  });

export const useAvailableGroups = (enabled: boolean) =>
  useQuery({
    queryKey: ['groups', 'available'],
    queryFn: () => groupsApi.listAvailable(),
    enabled,
    staleTime: 15_000,
  });

export function useLinkGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatId: number) => groupsApi.link(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Guruh ulandi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Guruhni ulashda xatolik yuz berdi');
    },
  });
}

export function useInviteGroupMembers() {
  return useMutation({
    mutationFn: (groupId: number) => groupsApi.inviteMembers(groupId),
    onSuccess: () => {
      toast.success("Taklif xabari guruhga yuborildi");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Xabar yuborishda xatolik yuz berdi');
    },
  });
}

export function useUpdateGroupRules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, policy }: { groupId: number; policy: 'EVERYONE' | 'OWNER_ONLY' }) =>
      groupsApi.updateRules(groupId, policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Qoidani o'zgartirishda xatolik yuz berdi");
    },
  });
}

export function useSyncGroupMembers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => groupsApi.syncMembers(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success("A'zolar yangilandi");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "A'zolarni yangilashda xatolik yuz berdi");
    },
  });
}

export function useUnlinkGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => groupsApi.unlink(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', 'available'] });
      toast.success("Guruh o'chirildi");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Guruhni o'chirishda xatolik yuz berdi");
    },
  });
}
