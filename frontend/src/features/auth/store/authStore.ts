import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthWorkspace, User, UserRole } from '@/shared/types';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  workspaces: AuthWorkspace[];
  activeWorkspaceId: number | null;
  isAuthenticated: boolean;
  isSidebarCollapsed: boolean;
  /** Mobile slide-over drawer open/closed - transient UI state, not persisted across reloads. */
  isMobileNavOpen: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, workspaces: AuthWorkspace[]) => void;
  setActiveWorkspace: (workspaceId: number) => void;
  addWorkspace: (workspace: AuthWorkspace) => void;
  renameWorkspace: (workspaceId: number, name: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  clearAuth: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;

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
      workspaces: [],
      activeWorkspaceId: null,
      isAuthenticated: false,
      isSidebarCollapsed: false,
      isMobileNavOpen: false,

      // Actions
      setAuth: (user, accessToken, workspaces) => {
        const { activeWorkspaceId } = get();
        const stillValid = activeWorkspaceId != null && workspaces.some((w) => w.id === activeWorkspaceId);
        set({
          user,
          accessToken,
          workspaces,
          activeWorkspaceId: stillValid ? activeWorkspaceId : workspaces[0]?.id ?? null,
          isAuthenticated: true,
        });
      },

      setActiveWorkspace: (workspaceId) => set({ activeWorkspaceId: workspaceId }),

      addWorkspace: (workspace) =>
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          activeWorkspaceId: workspace.id,
        })),

      renameWorkspace: (workspaceId, name) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) => (w.id === workspaceId ? { ...w, name } : w)),
        })),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          workspaces: [],
          activeWorkspaceId: null,
          isAuthenticated: false,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          workspaces: [],
          activeWorkspaceId: null,
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

      setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),

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
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,
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
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsSidebarCollapsed = () => useAuthStore((state) => state.isSidebarCollapsed);
export const useActiveWorkspaceId = () => useAuthStore((state) => state.activeWorkspaceId);
export const useWorkspaces = () => useAuthStore((state) => state.workspaces);
export const useAuthActions = () =>
  useAuthStore((state) => ({
    setAuth: state.setAuth,
    setActiveWorkspace: state.setActiveWorkspace,
    updateUser: state.updateUser,
    logout: state.logout,
    toggleSidebar: state.toggleSidebar,
    setSidebarCollapsed: state.setSidebarCollapsed,
    hasRole: state.hasRole,
    hasPermission: state.hasPermission,
  }));
