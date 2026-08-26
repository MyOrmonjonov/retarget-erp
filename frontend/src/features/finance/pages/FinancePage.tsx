'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table';
import { Skeleton } from '@/shared/ui/skeleton';
import { StatCard } from '@/shared/components/StatCard';
import { financeApi } from '../api/financeApi';
import type { InvoiceStatus, ExpenseCategory } from '@/shared/types';

function money(value: number, currency = 'UZS') {
  return `${value.toLocaleString('en-US')} ${currency}`;
}

const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  DRAFT: 'Qoralama',
  SENT: 'Yuborildi',
  PAID: "To'landi",
  OVERDUE: 'Muddati o\'tgan',
  CANCELLED: 'Bekor qilingan',
};

const invoiceStatusVariant: Record<InvoiceStatus, 'default' | 'success' | 'warning' | 'error'> = {
  DRAFT: 'default',
  SENT: 'warning',
  PAID: 'success',
  OVERDUE: 'error',
  CANCELLED: 'error',
};

const expenseCategoryLabel: Record<ExpenseCategory, string> = {
  SALARY: 'Ish haqi',
  RENT: 'Ijara',
  EQUIPMENT: 'Jihoz',
  SOFTWARE: 'Dastur',
  MARKETING: 'Marketing',
  TRAVEL: 'Safar',
  OTHER: 'Boshqa',
};

export function FinancePage() {
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['finance', 'invoices'],
    queryFn: financeApi.listInvoices,
  });
  const { data: payments = [] } = useQuery({
    queryKey: ['finance', 'payments'],
    queryFn: financeApi.listPayments,
  });
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['finance', 'expenses'],
    queryFn: financeApi.listExpenses,
  });

  const stats = useMemo(() => {
    const totalRevenue = invoices.filter((i) => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingPayments = payments
      .filter((p) => p.status === 'PENDING' || p.status === 'OVERDUE')
      .reduce((sum, p) => sum + p.amount, 0);
    return { totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses, pendingPayments };
  }, [invoices, expenses, payments]);

  const isLoading = invoicesLoading || expensesLoading;

  return (
    <div className="space-y-6 animate-in">
      <div>
        <Badge variant="error" size="sm">Faqat CEO</Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Umumiy daromad" value={money(stats.totalRevenue)} valueClassName="text-[var(--color-success)]" isLoading={isLoading} />
        <StatCard title="Xarajatlar" value={money(stats.totalExpenses)} valueClassName="text-[var(--color-warning)]" isLoading={isLoading} />
        <StatCard title="Sof foyda" value={money(stats.netProfit)} valueClassName={stats.netProfit >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'} isLoading={isLoading} />
        <StatCard title="Kutilayotgan to'lovlar" value={money(stats.pendingPayments)} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Hisob-fakturalar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {invoicesLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
              </div>
            ) : invoices.length === 0 ? (
              <p className="text-center text-[var(--color-text-secondary)] py-8">Hisob-fakturalar topilmadi</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>№</TableHead>
                    <TableHead>Mijoz</TableHead>
                    <TableHead>Summa</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium text-[var(--color-text-primary)]">{inv.number}</TableCell>
                      <TableCell className="text-[var(--color-text-secondary)]">{inv.clientName}</TableCell>
                      <TableCell className="text-[var(--color-text-secondary)]">{money(inv.amount, inv.currency)}</TableCell>
                      <TableCell>
                        <Badge variant={invoiceStatusVariant[inv.status]} size="sm">{invoiceStatusLabel[inv.status]}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Xarajatlar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {expensesLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
              </div>
            ) : expenses.length === 0 ? (
              <p className="text-center text-[var(--color-text-secondary)] py-8">Xarajatlar topilmadi</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomi</TableHead>
                    <TableHead>Turi</TableHead>
                    <TableHead>Summa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="font-medium text-[var(--color-text-primary)]">{exp.title}</TableCell>
                      <TableCell className="text-[var(--color-text-secondary)]">{expenseCategoryLabel[exp.category]}</TableCell>
                      <TableCell className="text-[var(--color-text-secondary)]">{money(exp.amount, exp.currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
