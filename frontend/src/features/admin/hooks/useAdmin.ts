import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi, type RecordPaymentInput } from '../api/adminApi';

export const useAdminDashboard = () =>
  useQuery({ queryKey: ['admin', 'dashboard'], queryFn: adminApi.dashboard, refetchInterval: 60_000 });

export const useAdminWorkspaces = () =>
  useQuery({ queryKey: ['admin', 'workspaces'], queryFn: adminApi.workspaces });

export const useAdminWorkspaceDetail = (id: number) =>
  useQuery({
    queryKey: ['admin', 'workspaces', id],
    queryFn: () => adminApi.workspaceDetail(id),
    enabled: Number.isFinite(id),
  });

export function useRecordPayment(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecordPaymentInput) => adminApi.recordPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success("To'lov qayd etildi");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "To'lovni qayd etishda xatolik yuz berdi");
    },
  });
}

export const usePaymentRequests = () =>
  useQuery({ queryKey: ['admin', 'payment-requests'], queryFn: adminApi.paymentRequests, refetchInterval: 30_000 });

export function useConfirmPaymentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.confirmPaymentRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success("To'lov tasdiqlandi, obuna uzaytirildi");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Tasdiqlashda xatolik yuz berdi");
    },
  });
}

export function useRejectPaymentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.rejectPaymentRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-requests'] });
      toast.success("So'rov rad etildi");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Rad etishda xatolik yuz berdi");
    },
  });
}
