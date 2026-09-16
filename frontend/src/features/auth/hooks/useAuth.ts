import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/shared/lib/api';
import { getTelegramInitData } from '@/shared/lib/telegram';
import { authApi } from '../api/authApi';
import { preferencesApi } from '@/features/settings/api/preferencesApi';
import { useAuthStore } from '../store/authStore';
import type { TelegramAuthResponse, UserRole } from '@/shared/types';

function toUser(response: TelegramAuthResponse) {
  const { user } = response;
  return {
    id: String(user.id),
    fullName: user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName,
    avatar: user.photoUrl,
    role: 'HODIM' as UserRole, // refined per-workspace by useSyncEmployeeRole once a workspace is active
  };
}

export function useTelegramAuth() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (initData: string) => authApi.authenticateWithTelegram(initData),
    onSuccess: (data) => {
      setAuth(toUser(data), data.accessToken, data.workspaces);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Telegram orqali kirishda xatolik yuz berdi");
    },
  });
}

/** Runs the Telegram auth flow automatically once, if not already authenticated. */
export function useAutoTelegramAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const auth = useTelegramAuth();

  useEffect(() => {
    if (isAuthenticated) return;
    const initData = getTelegramInitData();
    if (!initData) return;
    auth.mutate(initData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return auth;
}

interface EmployeeProfileDto {
  userId: number;
  role: UserRole;
}

/** Resolves the current user's org role for the active workspace and keeps the store's user.role in sync.
 *  Workspace OWNER always resolves to CEO immediately; other members are looked up via /api/employees
 *  (falls back to HODIM if no employee profile has been created for them yet). */
export function useSyncEmployeeRole() {
  const user = useAuthStore((s) => s.user);
  const activeWorkspaceId = useAuthStore((s) => s.activeWorkspaceId);
  const workspaces = useAuthStore((s) => s.workspaces);
  const updateUser = useAuthStore((s) => s.updateUser);

  useEffect(() => {
    if (!user || activeWorkspaceId == null) return;
    const membership = workspaces.find((w) => w.id === activeWorkspaceId);
    if (membership?.role === 'OWNER') {
      updateUser({ role: 'CEO' });
      return;
    }
    let cancelled = false;
    api.get<EmployeeProfileDto[]>('/employees').then((response) => {
      if (cancelled) return;
      const own = response.data.find((e) => String(e.userId) === user.id);
      updateUser({ role: own?.role ?? 'HODIM' });
    }).catch(() => {
      if (!cancelled) updateUser({ role: 'HODIM' });
    });
    return () => {
      cancelled = true;
    };
    // `user`/`workspaces`/`updateUser` are deliberately excluded: this effect should only
    // re-run when the person or the active workspace actually changes, not every time
    // updateUser() (called inside) produces a new `user` object reference - that would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeWorkspaceId]);
}

/** Loads the user's saved language/theme once per session and keeps <html data-theme> in sync -
 *  runs in Layout so it applies before any page-specific fetch, not just once the settings
 *  sheet has been opened. */
export function useSyncPreferences() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const uiLanguage = useAuthStore((s) => s.uiLanguage);
  const themePreference = useAuthStore((s) => s.themePreference);
  const setUiLanguage = useAuthStore((s) => s.setUiLanguage);
  const setThemePreference = useAuthStore((s) => s.setThemePreference);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    preferencesApi.get().then((prefs) => {
      if (cancelled) return;
      setUiLanguage(prefs.uiLanguage);
      setThemePreference(prefs.theme);
    }).catch(() => {
      // Keep whatever was already persisted locally - preferences just stay unsynced this session.
    });
    return () => {
      cancelled = true;
    };
    // Runs once per login, not on every uiLanguage/themePreference change (those are set BY this
    // effect and by the settings sheet) - re-running on them would refetch in a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    const root = document.documentElement;
    if (themePreference === 'dark' || themePreference === 'light') {
      root.setAttribute('data-theme', themePreference);
    } else {
      root.removeAttribute('data-theme');
    }
  }, [themePreference]);

  useEffect(() => {
    document.documentElement.lang = uiLanguage;
  }, [uiLanguage]);
}

export function useSwitchWorkspace() {
  const setActiveWorkspace = useAuthStore((s) => s.setActiveWorkspace);
  return (workspaceId: number) => setActiveWorkspace(workspaceId);
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return () => {
    logout();
    navigate('/login');
  };
}
