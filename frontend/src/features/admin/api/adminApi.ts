import { adminApiClient } from './adminApiClient';

export interface AdminPayment {
  id: number;
  workspaceId: number;
  workspaceName: string;
  amount: number;
  currency: string;
  planCode: string;
  periodMonths: number;
  note: string | null;
  paidAt: string;
}

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'NEW';

export interface AdminWorkspaceSummary {
  id: number;
  name: string;
  ownerName: string;
  ownerTelegramId: number | null;
  memberCount: number;
  planCode: string | null;
  currentPeriodEnd: string | null;
  status: SubscriptionStatus;
  createdAt: string;
}

export interface AdminWorkspaceDetail extends AdminWorkspaceSummary {
  payments: AdminPayment[];
}

export interface AdminDashboard {
  totalWorkspaces: number;
  activeCount: number;
  expiredCount: number;
  neverPaidCount: number;
  totalRevenue: number;
  revenueThisMonth: number;
  revenueByMonth: { month: string; amount: number }[];
  expiringSoon: AdminWorkspaceSummary[];
  recentPayments: AdminPayment[];
}

export interface RecordPaymentInput {
  amount: number;
  currency: string;
  planCode: string;
  periodMonths: number;
  note?: string;
}

export interface AdminPaymentRequest {
  id: number;
  workspaceId: number;
  workspaceName: string;
  requestedByName: string;
  planCode: string;
  periodMonths: number;
  amount: number;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  createdAt: string;
  decidedAt: string | null;
}

export const adminApi = {
  login: async (username: string, password: string): Promise<{ accessToken: string; username: string }> => {
    const response = await adminApiClient.post<{ accessToken: string; username: string }>('/admin/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  dashboard: async (): Promise<AdminDashboard> => {
    const response = await adminApiClient.get<AdminDashboard>('/admin/dashboard');
    return response.data;
  },

  workspaces: async (): Promise<AdminWorkspaceSummary[]> => {
    const response = await adminApiClient.get<AdminWorkspaceSummary[]>('/admin/workspaces');
    return response.data;
  },

  workspaceDetail: async (id: number): Promise<AdminWorkspaceDetail> => {
    const response = await adminApiClient.get<AdminWorkspaceDetail>(`/admin/workspaces/${id}`);
    return response.data;
  },

  recordPayment: async (id: number, data: RecordPaymentInput): Promise<AdminWorkspaceDetail> => {
    const response = await adminApiClient.post<AdminWorkspaceDetail>(`/admin/workspaces/${id}/payments`, data);
    return response.data;
  },

  paymentRequests: async (): Promise<AdminPaymentRequest[]> => {
    const response = await adminApiClient.get<AdminPaymentRequest[]>('/admin/payment-requests');
    return response.data;
  },

  confirmPaymentRequest: async (id: number): Promise<AdminPaymentRequest> => {
    const response = await adminApiClient.post<AdminPaymentRequest>(`/admin/payment-requests/${id}/confirm`);
    return response.data;
  },

  rejectPaymentRequest: async (id: number): Promise<AdminPaymentRequest> => {
    const response = await adminApiClient.post<AdminPaymentRequest>(`/admin/payment-requests/${id}/reject`);
    return response.data;
  },
};
