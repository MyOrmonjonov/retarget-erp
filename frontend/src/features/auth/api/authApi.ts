import { api } from '@/shared/lib/api';
import type {
  LoginRequest,
  LoginResponse,
  User,
  AuthTokens,
} from '@/shared/types';

export const authApi = {
  /** Login with username + password */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /** Refresh access token using refresh token */
  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },

  /** Logout - invalidates tokens server-side */
  logout: async (): Promise<void> => {
    await api.post<void>('/auth/logout');
  },

  /** Get current user profile */
  me: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /** Update current user profile */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/auth/profile', data);
    return response.data;
  },

  /** Change password */
  changePassword: async (data: { oldPassword: string; newPassword: string }): Promise<void> => {
    await api.post<void>('/auth/change-password', data);
  },

  /** Convert backend LoginResponse to frontend format */
  toAuthTokens: (response: LoginResponse): AuthTokens => ({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  }),

  /** Convert backend user to frontend User type */
  toUser: (response: LoginResponse): User => ({
    id: String(response.user.id),
    fullName: response.user.fullName,
    email: response.user.email,
    phone: response.user.phone,
    avatar: response.user.avatarUrl ?? undefined,
    role: response.user.role,
  }),
};