import { api } from '@/shared/lib/api';

export interface CreatePaymentRequestInput {
  planCode: string;
  periodMonths: number;
  amount: number;
  currency?: string;
}

export interface PaymentRequestResult {
  id: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
}

export const subscriptionApi = {
  createPaymentRequest: async (input: CreatePaymentRequestInput): Promise<PaymentRequestResult> => {
    const response = await api.post<PaymentRequestResult>('/subscription/payment-requests', input);
    return response.data;
  },
};
