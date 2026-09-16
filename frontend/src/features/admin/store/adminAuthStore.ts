import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdminAuthState {
  username: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (username: string, accessToken: string) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      username: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (username, accessToken) => set({ username, accessToken, isAuthenticated: true }),
      logout: () => set({ username: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const getAdminAuthStore = useAdminAuthStore.getState;
