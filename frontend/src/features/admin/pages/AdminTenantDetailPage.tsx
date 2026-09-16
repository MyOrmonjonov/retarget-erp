'use client';

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { useAdminWorkspaceDetail, useRecordPayment } from '../hooks/useAdmin';
import { SubscriptionStatusBadge } from '../components/statusBadge';
import { RecordPaymentForm } from '../components/RecordPaymentForm';
import { formatShortDate, formatDateTime } from '@/shared/lib/utils';

function formatMoney(value: number): string {
  return value.toLocaleString('en-US') + " so'm";
}

export function AdminTenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workspaceId = Number(id);
  const { data: workspace, isLoading } = useAdminWorkspaceDetail(workspaceId);
  const recordPayment = useRecordPayment(workspaceId);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = async (data: Parameters<typeof recordPayment.mutateAsync>[0]) => {
    await recordPayment.mutateAsync(data);
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!workspace) {
    return <EmptyState icon={Receipt} title="Topilmadi" />;
  }

  return (
    <div className="space-y-6 animate-in">
      <button
        type="button"
        onClick={() => navigate('/admin/tenants')}
        className="flex items-center gap-1.5 text-caption text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Mijozlar ro'yxati
      </button>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-h2 font-bold text-[var(--color-text-primary)]">{workspace.name}</h1>
            <SubscriptionStatusBadge status={workspace.status} />
          </div>
          <p className="text-caption text-[var(--color-text-muted)] mt-0.5">
            Egasi: {workspace.ownerName} {workspace.ownerTelegramId ? `(ID: ${workspace.ownerTelegramId})` : ''}
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4" />
          To'lov qayd etish
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-[18px]">
            <p className="text-[24px] font-extrabold text-[var(--color-text-primary)]">{workspace.memberCount}</p>
            <p className="mt-2 text-[13px] font-bold text-[var(--color-text-primary)]">A'zolar soni</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-[18px]">
            <p className="text-[24px] font-extrabold text-[var(--color-text-primary)]">{workspace.planCode ?? '—'}</p>
            <p className="mt-2 text-[13px] font-bold text-[var(--color-text-primary)]">Joriy tarif</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-[18px]">
            <p className="text-[24px] font-extrabold text-[var(--color-text-primary)]">
              {workspace.currentPeriodEnd ? formatShortDate(workspace.currentPeriodEnd) : '—'}
            </p>
            <p className="mt-2 text-[13px] font-bold text-[var(--color-text-primary)]">Amal qilish muddati</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>To'lovlar tarixi</CardTitle>
        </CardHeader>
        <CardContent>
          {workspace.payments.length === 0 ? (
            <EmptyState icon={Receipt} title="Hali to'lov qayd etilmagan" />
          ) : (
            <div className="space-y-3">
              {workspace.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-bg-border)] px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-body font-semibold text-[var(--color-text-primary)]">
                      {p.planCode} · {p.periodMonths} oy
                    </p>
                    <p className="text-caption text-[var(--color-text-muted)]">
                      {formatDateTime(p.paidAt)} {p.note ? `· ${p.note}` : ''}
                    </p>
                  </div>
                  <p className="text-body font-bold text-[var(--color-success)] flex-shrink-0">{formatMoney(p.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RecordPaymentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        isLoading={recordPayment.isPending}
      />
    </div>
  );
}
