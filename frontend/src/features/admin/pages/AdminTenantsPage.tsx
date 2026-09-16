'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2 } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { useAdminWorkspaces } from '../hooks/useAdmin';
import { SubscriptionStatusBadge } from '../components/statusBadge';
import { formatShortDate } from '@/shared/lib/utils';

export function AdminTenantsPage() {
  const navigate = useNavigate();
  const { data: workspaces = [], isLoading } = useAdminWorkspaces();
  const [search, setSearch] = useState('');

  const filtered = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-h2 font-bold text-[var(--color-text-primary)]">Mijozlar</h1>
          <p className="text-caption text-[var(--color-text-muted)] mt-0.5">Barcha workspace'lar va ularning obuna holati</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <Input placeholder="Qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Building2} title="Mijozlar topilmadi" className="py-16" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-bg-border)]">
                  <th className="px-5 py-3 text-caption font-semibold text-[var(--color-text-muted)]">Workspace</th>
                  <th className="px-5 py-3 text-caption font-semibold text-[var(--color-text-muted)]">Egasi</th>
                  <th className="px-5 py-3 text-caption font-semibold text-[var(--color-text-muted)]">A'zolar</th>
                  <th className="px-5 py-3 text-caption font-semibold text-[var(--color-text-muted)]">Tarif</th>
                  <th className="px-5 py-3 text-caption font-semibold text-[var(--color-text-muted)]">Amal qiladi</th>
                  <th className="px-5 py-3 text-caption font-semibold text-[var(--color-text-muted)]">Holat</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr
                    key={w.id}
                    onClick={() => navigate(`/admin/tenants/${w.id}`)}
                    className="border-b border-[var(--color-bg-border)] last:border-0 cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <td className="px-5 py-3.5 text-body font-semibold text-[var(--color-text-primary)]">{w.name}</td>
                    <td className="px-5 py-3.5 text-body text-[var(--color-text-secondary)]">{w.ownerName}</td>
                    <td className="px-5 py-3.5 text-body text-[var(--color-text-secondary)]">{w.memberCount}</td>
                    <td className="px-5 py-3.5 text-body text-[var(--color-text-secondary)]">{w.planCode ?? '—'}</td>
                    <td className="px-5 py-3.5 text-body text-[var(--color-text-secondary)]">
                      {w.currentPeriodEnd ? formatShortDate(w.currentPeriodEnd) : '—'}
                    </td>
                    <td className="px-5 py-3.5"><SubscriptionStatusBadge status={w.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
