'use client';

import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { StatCard } from '@/shared/components/StatCard';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { Clock, Receipt, CreditCard, Check, X } from 'lucide-react';
import { useAdminDashboard, usePaymentRequests, useConfirmPaymentRequest, useRejectPaymentRequest } from '../hooks/useAdmin';
import { formatShortDate } from '@/shared/lib/utils';

function formatMoney(value: number): string {
  return value.toLocaleString('en-US') + " so'm";
}

function monthLabel(month: string): string {
  const [, m] = month.split('-');
  const names = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  return names[Number(m) - 1] ?? month;
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useAdminDashboard();
  const { data: paymentRequests = [] } = usePaymentRequests();
  const confirmRequest = useConfirmPaymentRequest();
  const rejectRequest = useRejectPaymentRequest();
  const pendingRequests = paymentRequests.filter((r) => r.status === 'PENDING');

  const chartData = (data?.revenueByMonth ?? []).map((p) => ({ label: monthLabel(p.month), amount: p.amount }));

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-h2 font-bold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="text-caption text-[var(--color-text-muted)] mt-0.5">Obuna va to'lovlar bo'yicha umumiy holat</p>
      </div>

      {pendingRequests.length > 0 && (
        <Card variant="bordered" className="border-[var(--color-warning)]/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Tasdiqlanishi kerak bo'lgan to'lovlar
              <Badge variant="warning" size="sm">{pendingRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-bg-border)] px-3 py-2.5 flex-wrap">
                <div className="min-w-0">
                  <p className="text-body font-semibold text-[var(--color-text-primary)] truncate">{r.workspaceName}</p>
                  <p className="text-caption text-[var(--color-text-muted)]">
                    {r.requestedByName} · {r.planCode} · {r.periodMonths} oy · {formatShortDate(r.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-body font-bold text-[var(--color-text-primary)] mr-2">{formatMoney(r.amount)}</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => confirmRequest.mutate(r.id)}
                    loading={confirmRequest.isPending}
                  >
                    <Check className="h-3.5 w-3.5" /> Tasdiqlash
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => rejectRequest.mutate(r.id)}
                    loading={rejectRequest.isPending}
                  >
                    <X className="h-3.5 w-3.5" /> Rad etish
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Jami mijozlar" value={data?.totalWorkspaces ?? 0} isLoading={isLoading} />
        <StatCard
          title="Faol obunalar"
          value={data?.activeCount ?? 0}
          valueClassName="text-[var(--color-success)]"
          isLoading={isLoading}
        />
        <StatCard
          title="Muddati o'tgan / to'lanmagan"
          value={(data?.expiredCount ?? 0) + (data?.neverPaidCount ?? 0)}
          valueClassName="text-[var(--color-error)]"
          isLoading={isLoading}
        />
        <StatCard
          title="Shu oy daromadi"
          value={data ? formatMoney(data.revenueThisMonth) : '—'}
          subtitle={data ? `Jami: ${formatMoney(data.totalRevenue)}` : undefined}
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Oylik daromad (so'nggi 6 oy)</CardTitle>
        </CardHeader>
        <CardContent className="pl-0">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-bg-border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} width={70}
                    tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : String(v)} />
                  <Tooltip
                    formatter={(value: number) => [formatMoney(value), 'Daromad']}
                    contentStyle={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-bg-border)', borderRadius: 8 }}
                  />
                  <Bar dataKey="amount" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Muddati yaqinlashayotganlar</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : !data || data.expiringSoon.length === 0 ? (
              <EmptyState icon={Clock} title="Hozircha yo'q" description="7 kun ichida muddati tugaydiganlar shu yerda chiqadi." />
            ) : (
              <div className="space-y-3">
                {data.expiringSoon.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => navigate(`/admin/tenants/${w.id}`)}
                    className="w-full flex items-center justify-between gap-3 rounded-lg border border-[var(--color-bg-border)] px-3 py-2.5 hover:border-[var(--color-text-muted)] transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-body font-semibold text-[var(--color-text-primary)] truncate">{w.name}</p>
                      <p className="text-caption text-[var(--color-text-muted)]">{w.ownerName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-caption text-[var(--color-warning)] font-medium">
                        {w.currentPeriodEnd ? formatShortDate(w.currentPeriodEnd) : '—'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Receipt className="h-4 w-4" /> So'nggi to'lovlar</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : !data || data.recentPayments.length === 0 ? (
              <EmptyState icon={Receipt} title="Hali to'lov yo'q" />
            ) : (
              <div className="space-y-3">
                {data.recentPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-bg-border)] px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-body font-semibold text-[var(--color-text-primary)] truncate">{p.workspaceName}</p>
                      <p className="text-caption text-[var(--color-text-muted)]">{formatShortDate(p.paidAt)} · {p.planCode}</p>
                    </div>
                    <p className="text-body font-bold text-[var(--color-success)] flex-shrink-0">{formatMoney(p.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
