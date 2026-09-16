import { api } from '@/shared/lib/api';

export interface GroupMember {
  id: number;
  name: string;
  username: string | null;
  photoUrl: string | null;
}

export interface Group {
  id: number;
  title: string;
  members: number;
  memberList: GroupMember[];
  botConnected: boolean;
  botUsername: string | null;
  taskCreationPolicy: 'EVERYONE' | 'OWNER_ONLY';
}

export interface AvailableGroup {
  chatId: number;
  title: string;
}

export interface GroupTopic {
  id: number;
  name: string;
}

interface PreparedGroupButton {
  preparedButtonId: string;
  requestId: number;
}

// workspaceId is auto-injected as a query param by the api client's request interceptor
// (shared/lib/api.ts) - never add it manually here, it would end up duplicated in the URL.
export const groupsApi = {
  list: async (): Promise<Group[]> => {
    const response = await api.get<Group[]>('/groups');
    return response.data;
  },

  prepare: async (): Promise<PreparedGroupButton> => {
    const response = await api.post<PreparedGroupButton>('/groups/telegram/prepare');
    return response.data;
  },

  fallback: async (requestId: number): Promise<void> => {
    await api.post(`/groups/telegram/fallback?requestId=${requestId}`);
  },

  listAvailable: async (): Promise<AvailableGroup[]> => {
    const response = await api.get<AvailableGroup[]>('/groups/telegram/available');
    return response.data;
  },

  link: async (chatId: number): Promise<Group> => {
    const response = await api.post<Group>(`/groups/telegram/link?chatId=${chatId}`);
    return response.data;
  },

  listTopics: async (groupId: number): Promise<GroupTopic[]> => {
    const response = await api.get<GroupTopic[]>(`/groups/${groupId}/topics`);
    return response.data;
  },

  inviteMembers: async (groupId: number): Promise<void> => {
    await api.post(`/groups/${groupId}/invite-members`);
  },

  updateRules: async (groupId: number, taskCreationPolicy: 'EVERYONE' | 'OWNER_ONLY'): Promise<Group> => {
    const response = await api.patch<Group>(`/groups/${groupId}/rules`, { taskCreationPolicy });
    return response.data;
  },

  unlink: async (groupId: number): Promise<void> => {
    await api.delete(`/groups/${groupId}`);
  },

  syncMembers: async (groupId: number): Promise<Group> => {
    const response = await api.post<Group>(`/groups/${groupId}/sync-members`);
    return response.data;
  },
};
