import { api } from '@/shared/lib/api';

export type WorkspaceRoleCode = 'OWNER' | 'MEMBER';

export interface WorkspaceMember {
  id: number;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  roleCode: WorkspaceRoleCode;
  active: boolean;
  temporarilyBlocked: boolean;
}

export interface WorkspaceInvitation {
  id: number;
  telegramId: number;
  roleCode: WorkspaceRoleCode;
  status: string;
  createdAt: string;
}

export interface InviteMemberResult {
  outcome: 'MEMBER_ADDED' | 'INVITATION_PENDING';
  member: WorkspaceMember | null;
  invitation: WorkspaceInvitation | null;
}

export const workspaceMembersApi = {
  list: async (workspaceId: number): Promise<WorkspaceMember[]> => {
    const response = await api.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
    return response.data;
  },

  invitations: async (workspaceId: number): Promise<WorkspaceInvitation[]> => {
    const response = await api.get<WorkspaceInvitation[]>(`/workspaces/${workspaceId}/invitations`);
    return response.data;
  },

  invite: async (workspaceId: number, telegramId: number, roleCode: WorkspaceRoleCode): Promise<InviteMemberResult> => {
    const response = await api.post<InviteMemberResult>(`/workspaces/${workspaceId}/invitations`, { telegramId, roleCode });
    return response.data;
  },

  revokeInvitation: async (workspaceId: number, invitationId: number): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`);
  },

  changeRole: async (workspaceId: number, userId: number, roleCode: WorkspaceRoleCode): Promise<WorkspaceMember> => {
    const response = await api.put<WorkspaceMember>(`/workspaces/${workspaceId}/members/${userId}/role`, { roleCode });
    return response.data;
  },

  remove: async (workspaceId: number, userId: number): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },
};
