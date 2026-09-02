import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { getAuthStore } from '@/features/auth/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - attach access token + active workspace
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const { accessToken, activeWorkspaceId } = getAuthStore();
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        if (activeWorkspaceId != null) {
          config.params = { workspaceId: activeWorkspaceId, ...config.params };
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - session expired/invalid -> clear auth and send back to the auth gate.
    // There is no refresh-token flow: the backend issues a single long-lived (7-day) Telegram-auth
    // session token, re-issued each time the Mini App re-authenticates via initData.
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          getAuthStore().clearAuth();
          window.location.href = '/login';
        }
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private normalizeError(error: AxiosError): ApiError {
    if (error.response?.data) {
      const data = error.response.data as Record<string, unknown>;
      return {
        status: error.response.status,
        message: (data.message as string) || error.message,
        errors: data.errors as Record<string, string[]> | undefined,
      };
    }
    return {
      status: error.response?.status || 0,
      message: error.message || 'Unknown error',
    };
  }

  // HTTP Methods
  get<T>(url: string, params?: Record<string, unknown>) {
    return this.client.get<T>(url, { params });
  }

  post<T>(url: string, data?: unknown) {
    return this.client.post<T>(url, data);
  }

  put<T>(url: string, data?: unknown) {
    return this.client.put<T>(url, data);
  }

  /** For FormData bodies (file uploads) - clears the instance's default JSON Content-Type
   * header so the browser sets its own multipart boundary instead. */
  postForm<T>(url: string, data: FormData) {
    return this.client.post<T>(url, data, { headers: { 'Content-Type': undefined } });
  }

  putForm<T>(url: string, data: FormData) {
    return this.client.put<T>(url, data, { headers: { 'Content-Type': undefined } });
  }

  patch<T>(url: string, data?: unknown) {
    return this.client.patch<T>(url, data);
  }

  delete<T>(url: string) {
    return this.client.delete<T>(url);
  }

  // Get raw axios instance for advanced use
  getInstance(): AxiosInstance {
    return this.client;
  }
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export const api = new ApiClient();
