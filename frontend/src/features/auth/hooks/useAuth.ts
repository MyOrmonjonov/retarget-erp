import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest, LoginResponse } from '@/shared/types';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data: LoginResponse) => {
      const user = authApi.toUser(data);
      const tokens = authApi.toAuthTokens(data);
      setAuth(user, tokens);
      toast.success(`Xush kelibsiz, ${user.fullName}!`);
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Kirish xatoligi. Qaytadan urinib ko\'ring.');
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Always clear local state even if API fails
      logout();
      navigate('/login');
    },
  });
}
