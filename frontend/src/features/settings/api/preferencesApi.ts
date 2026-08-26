import { api } from '@/shared/lib/api';

export interface UserPreferences {
  uiLanguage: string;
  theme: string;
  remindersEnabled: boolean;
}

export interface UpdatePreferencesInput {
  uiLanguage?: string;
  theme?: string;
  remindersEnabled?: boolean;
}

export const preferencesApi = {
  get: async (): Promise<UserPreferences> => {
    const response = await api.get<UserPreferences>('/users/me/preferences');
    return response.data;
  },
  update: async (input: UpdatePreferencesInput): Promise<UserPreferences> => {
    const response = await api.patch<UserPreferences>('/users/me/preferences', input);
    return response.data;
  },
};
