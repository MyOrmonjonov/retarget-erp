import { api } from '@/shared/lib/api';
import type { TelegramAuthResponse } from '@/shared/types';

export const authApi = {
  /** Exchange Telegram Mini App initData for a session (creates/updates the user, returns their workspaces). */
  authenticateWithTelegram: async (initData: string): Promise<TelegramAuthResponse> => {
    const response = await api.post<TelegramAuthResponse>('/auth/telegram', { initData });
    return response.data;
  },
};
