import { api } from '@/shared/lib/api';
import type { Invoice, InvoiceStatus, Payment, PaymentStatus, Expense, ExpenseCategory } from '@/shared/types';

interface InvoiceDto {
  id: number;
  workspaceId: number;
  number: string;
  clientId: number | null;
  clientName: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaymentDto {
  id: number;
  workspaceId: number;
  invoiceId: number | null;
  clientId: number | null;
  clientName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  dueDate: string;
  paidDate: string | null;
  method: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseDto {
  id: number;
  workspaceId: number;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  description: string | null;
  receiptUrl: string | null;
  approvedBy: number | null;
  approvedByName: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function toInvoice(dto: InvoiceDto): Invoice {
  return {
    id: String(dto.id),
    number: dto.number,
    clientId: dto.clientId != null ? String(dto.clientId) : '',
    clientName: dto.clientName,
    amount: dto.amount,
    currency: dto.currency,
    status: dto.status,
    issueDate: dto.issueDate,
    dueDate: dto.dueDate,
    items: dto.items,
    notes: dto.notes ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function toPayment(dto: PaymentDto): Payment {
  return {
    id: String(dto.id),
    invoiceId: dto.invoiceId != null ? String(dto.invoiceId) : undefined,
    clientId: dto.clientId != null ? String(dto.clientId) : '',
    clientName: dto.clientName,
    amount: dto.amount,
    currency: dto.currency,
    status: dto.status,
    dueDate: dto.dueDate,
    paidDate: dto.paidDate ?? undefined,
    method: dto.method ?? undefined,
    description: dto.description ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function toExpense(dto: ExpenseDto): Expense {
  return {
    id: String(dto.id),
    title: dto.title,
    amount: dto.amount,
    currency: dto.currency,
    category: dto.category,
    date: dto.date,
    description: dto.description ?? undefined,
    receiptUrl: dto.receiptUrl ?? undefined,
    approvedBy: dto.approvedByName ?? undefined,
    approvedAt: dto.approvedAt ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export const financeApi = {
  listInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get<InvoiceDto[]>('/invoices');
    return response.data.map(toInvoice);
  },
  listPayments: async (): Promise<Payment[]> => {
    const response = await api.get<PaymentDto[]>('/payments');
    return response.data.map(toPayment);
  },
  listExpenses: async (): Promise<Expense[]> => {
    const response = await api.get<ExpenseDto[]>('/expenses');
    return response.data.map(toExpense);
  },
};
