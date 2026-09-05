import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workspaceMembersApi, type WorkspaceRoleCode } from '../api/workspaceMembersApi';
import { getAuthStore } from '@/features/auth/store/authStore';

function requireWorkspaceId(): number {
  const { activeWorkspaceId } = getAuthStore();
  if (activeWorkspaceId == null) throw new Error('Ish maydoni tanlanmagan');
  return activeWorkspaceId;
}

export const useWorkspaceMembers = () =>
  useQuery({
    queryKey: ['workspace-members'],
    queryFn: () => workspaceMembersApi.list(requireWorkspaceId()),
    staleTime: 30_000,
  });

export const useWorkspaceInvitations = () =>
  useQuery({
    queryKey: ['workspace-invitations'],
    queryFn: () => workspaceMembersApi.invitations(requireWorkspaceId()),
    staleTime: 30_000,
  });

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ telegramId, roleCode }: { telegramId: number; roleCode: WorkspaceRoleCode }) =>
      workspaceMembersApi.invite(requireWorkspaceId(), telegramId, roleCode),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });
      toast.success(result.outcome === 'MEMBER_ADDED' ? "A'zo jamoaga qo'shildi" : 'Taklif yuborildi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Taklif yuborishda xatolik yuz berdi');
    },
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: number) => workspaceMembersApi.revokeInvitation(requireWorkspaceId(), invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });
      toast.success('Taklif bekor qilindi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Taklifni bekor qilishda xatolik yuz berdi');
    },
  });
}

export function useChangeMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleCode }: { userId: number; roleCode: WorkspaceRoleCode }) =>
      workspaceMembersApi.changeRole(requireWorkspaceId(), userId, roleCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      toast.success('Rol yangilandi');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Rolni yangilashda xatolik yuz berdi');
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => workspaceMembersApi.remove(requireWorkspaceId(), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      toast.success("A'zo ish maydonidan chiqarildi");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "A'zoni chiqarishda xatolik yuz berdi");
    },
  });
}
