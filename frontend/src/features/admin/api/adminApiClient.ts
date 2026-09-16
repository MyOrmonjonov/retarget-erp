import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { getAdminAuthStore } from '../store/adminAuthStore';
import type { ApiError } from '@/shared/lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class AdminApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const { accessToken } = getAdminAuthStore();
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          getAdminAuthStore().logout();
          window.location.href = '/admin/login';
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
    return { status: error.response?.status || 0, message: error.message || 'Unknown error' };
  }

  get<T>(url: string, params?: Record<string, unknown>) {
    return this.client.get<T>(url, { params });
  }

  post<T>(url: string, data?: unknown) {
    return this.client.post<T>(url, data);
  }
}

export const adminApiClient = new AdminApiClient();
