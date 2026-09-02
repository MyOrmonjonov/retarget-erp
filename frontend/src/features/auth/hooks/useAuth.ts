import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/shared/lib/api';
import { getTelegramInitData } from '@/shared/lib/telegram';
import { authApi } from '../api/authApi';
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
