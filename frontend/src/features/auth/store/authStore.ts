import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole, AuthTokens } from '@/shared/types';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isSidebarCollapsed: boolean;

  // Actions
  setAuth: (user: User, tokens: AuthTokens) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  clearAuth: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Role helpers
  hasRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  CEO: ['*'],
  MENEJER: ['projects:read', 'projects:write', 'projects:delete', 'tasks:read', 'tasks:write', 'employees:read', 'employees:write', 'kpi:read', 'finance:read', 'reports:read'],
  BOSHQARUVCHI: ['projects:read', 'tasks:read', 'tasks:write', 'employees:read', 'kpi:read', 'attendance:read', 'attendance:write'],
  MONTAJOR: ['tasks:read', 'tasks:write', 'projects:read'],
  HODIM: ['tasks:read', 'tasks:write', 'projects:read'],
  OPERATOR: ['tasks:read', 'projects:read'],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isSidebarCollapsed: false,

      // Actions
      setAuth: (user, tokens) =>
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      toggleSidebar: () =>
        set((state) => ({
          isSidebarCollapsed: !state.isSidebarCollapsed,
        })),

      setSidebarCollapsed: (collapsed) =>
        set({
          isSidebarCollapsed: collapsed,
        }),

      // Role helpers
      hasRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        const permissions = ROLE_PERMISSIONS[user.role] || [];
        return permissions.includes('*') || permissions.includes(permission);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);

// Export raw store for non-hook usage (e.g., in axios interceptors)
export const getAuthStore = useAuthStore.getState;

// Selectors for performance
export const useUser = () => useAuthStore((state) => state.user);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useRefreshToken = () => useAuthStore((state) => state.refreshToken);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsSidebarCollapsed = () => useAuthStore((state) => state.isSidebarCollapsed);
export const useAuthActions = () =>
  useAuthStore((state) => ({
    setAuth: state.setAuth,
    setTokens: state.setTokens,
    updateUser: state.updateUser,
    logout: state.logout,
    toggleSidebar: state.toggleSidebar,
    setSidebarCollapsed: state.setSidebarCollapsed,
    hasRole: state.hasRole,
    hasPermission: state.hasPermission,
  }));