'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table';
import { Skeleton } from '@/shared/ui/skeleton';
import { Select } from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { Avatar } from '@/shared/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import { StatCard } from '@/shared/components/StatCard';
import { financeApi } from '../api/financeApi';
import { employeesApi } from '@/features/employees/api/employeesApi';
import { useUser } from '@/features/auth/store/authStore';
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

// Chromium's Intl data has no long-form month names for 'uz-UZ' (falls back to "M09"), so these
// are spelled out by hand rather than via toLocaleDateString.
const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

function monthOptions() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    return { value, label };
  });
}

function SalaryCell({ employeeId, value }: { employeeId: string; value: number }) {
  const [draft, setDraft] = useState(String(value));
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (baseSalary: number) => employeesApi.updateSalary(employeeId, baseSalary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'dashboard'] });
      toast.success('Maosh yangilandi');
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Maoshni yangilashda xatolik yuz berdi'),
  });

  const commit = () => {
    const parsed = Number(draft);
    if (Number.isNaN(parsed) || parsed < 0 || parsed === value) {
      setDraft(String(value));
      return;
    }
    mutation.mutate(parsed);
  };

  return (
    <Input
      type="number"
      min={0}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      disabled={mutation.isPending}
      className="w-32 h-8 text-caption"
    />
  );
}

function FinanceDashboardTab() {
  const months = useMemo(monthOptions, []);
  const [month, setMonth] = useState(months[0].value);
  const { data, isLoading } = useQuery({
    queryKey: ['finance', 'dashboard', month],
    queryFn: () => financeApi.getDashboard(month),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-caption text-[var(--color-text-secondary)]">
          Daromad, maosh va foyda taqsimoti - oy bo'yicha
        </p>
        <Select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          options={months}
          className="w-48"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Daromad" value={data ? money(data.totalRevenue) : '—'} valueClassName="text-[var(--color-success)]" isLoading={isLoading} />
        <StatCard title="Maosh xarajati" value={data ? money(data.totalSalaryExpense) : '—'} valueClassName="text-[var(--color-warning)]" isLoading={isLoading} />
        <StatCard title="Sof foyda" value={data ? money(data.netProfit) : '—'} isLoading={isLoading} />
        <StatCard title="Investor ulushi" value={data ? money(data.investorShare) : '—'} isLoading={isLoading} />
        <StatCard title="CEO ulushi" value={data ? money(data.ceoShare) : '—'} isLoading={isLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loyihalar bo'yicha daromad</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
          ) : !data || data.projects.length === 0 ? (
            <p className="text-center text-[var(--color-text-secondary)] py-8">Loyihalar topilmadi</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loyiha</TableHead>
                  <TableHead>Mijoz</TableHead>
                  <TableHead>Mas'ul</TableHead>
                  <TableHead>Daromad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-[var(--color-text-primary)]">{p.name}</TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">{p.client}</TableCell>
                    <TableCell>
                      {p.managerName ? (
                        <span className="flex items-center gap-1.5 text-caption text-[var(--color-text-secondary)]">
                          <Avatar name={p.managerName} src={p.managerAvatar} size="xs" />
                          {p.managerName}
                        </span>
                      ) : (
                        <span className="text-caption text-[var(--color-text-muted)]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">{money(p.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Xodimlar bo'yicha KPI va maosh</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
          ) : !data || data.employees.length === 0 ? (
            <p className="text-center text-[var(--color-text-secondary)] py-8">Xodimlar topilmadi</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Xodim</TableHead>
                  <TableHead>Tasklar</TableHead>
                  <TableHead>KPI</TableHead>
                  <TableHead>Baza maosh</TableHead>
                  <TableHead>Hisoblangan maosh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.employees.map((e) => (
                  <TableRow key={e.employeeId}>
                    <TableCell>
                      <span className="flex items-center gap-2 font-medium text-[var(--color-text-primary)]">
                        <Avatar name={e.name} src={e.avatar} size="sm" />
                        {e.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">{e.completedTasks}/{e.assignedTasks}</TableCell>
                    <TableCell>
                      <Badge variant={e.kpi >= 80 ? 'success' : e.kpi >= 50 ? 'warning' : 'error'} size="sm">{e.kpi}%</Badge>
                    </TableCell>
                    <TableCell>
                      <SalaryCell employeeId={String(e.employeeId)} value={e.baseSalary} />
                    </TableCell>
                    <TableCell className="text-[var(--color-text-primary)] font-medium">{money(e.calculatedSalary)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
  const user = useUser();
  const isCeo = user?.role === 'CEO';

  return (
    <div className="space-y-6 animate-in">
      <div>
        <Badge variant="error" size="sm">Faqat CEO</Badge>
      </div>

      {isCeo ? (
        <Tabs defaultValue="invoicing">
          <TabsList>
            <TabsTrigger value="invoicing">Hisob-kitoblar</TabsTrigger>
            <TabsTrigger value="dashboard">Moliyaviy dashboard</TabsTrigger>
          </TabsList>
          <TabsContent value="invoicing">
            <InvoicingTab
              isLoading={isLoading}
              stats={stats}
              invoices={invoices}
              invoicesLoading={invoicesLoading}
              expenses={expenses}
              expensesLoading={expensesLoading}
            />
          </TabsContent>
          <TabsContent value="dashboard">
            <FinanceDashboardTab />
          </TabsContent>
        </Tabs>
      ) : (
        <InvoicingTab
          isLoading={isLoading}
          stats={stats}
          invoices={invoices}
          invoicesLoading={invoicesLoading}
          expenses={expenses}
          expensesLoading={expensesLoading}
        />
      )}
    </div>
  );
}

function InvoicingTab({
  isLoading,
  stats,
  invoices,
  invoicesLoading,
  expenses,
  expensesLoading,
}: {
  isLoading: boolean;
  stats: { totalRevenue: number; totalExpenses: number; netProfit: number; pendingPayments: number };
  invoices: Awaited<ReturnType<typeof financeApi.listInvoices>>;
  invoicesLoading: boolean;
  expenses: Awaited<ReturnType<typeof financeApi.listExpenses>>;
  expensesLoading: boolean;
}) {
  return (
    <div className="space-y-6">
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
