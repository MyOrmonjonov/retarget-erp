'use client';

import { useCallback, useMemo, useState } from 'react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';
import { Plus } from 'lucide-react';
import type { Deal, DealStage } from '@/shared/types';
import { getAuthStore } from '@/features/auth/store/authStore';
import { DealForm, type DealFormData } from '../components/DealForm';
import { useDeals, useCreateDeal, useUpdateDeal, useDeleteDeal } from '../hooks/useDeals';

const columns: { stage: DealStage; title: string }[] = [
  { stage: 'LEAD', title: 'Yangi lid' },
  { stage: 'QUALIFIED', title: 'Aloqada' },
  { stage: 'PROPOSAL', title: 'Taklif yuborildi' },
  { stage: 'NEGOTIATION', title: 'Muzokara' },
  { stage: 'WON', title: 'Yopildi' },
];

function formatUsd(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

export function SalesPage() {
  const { data: deals = [], isLoading } = useDeals();
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);

  const columnData = useMemo(() => {
    return columns.map((col) => {
      const columnDeals = deals.filter((d) => d.stage === col.stage);
      const total = columnDeals.reduce((sum, d) => sum + d.value, 0);
      return { ...col, deals: columnDeals, total };
    });
  }, [deals]);

  const handleOpenCreate = useCallback(() => {
    setEditingDeal(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((deal: Deal) => {
    setEditingDeal(deal);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingDeal(null);
  }, []);

  const handleSubmit = useCallback(async (data: DealFormData) => {
    const ownerId = editingDeal?.ownerId ?? getAuthStore().user?.id;
    if (!ownerId) return;
    const input = { ...data, ownerId };
    if (editingDeal) {
      await updateDeal.mutateAsync({ id: String(editingDeal.id), input });
    } else {
      await createDeal.mutateAsync(input);
    }
    handleCloseForm();
  }, [editingDeal, createDeal, updateDeal, handleCloseForm]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingDeal) return;
    await deleteDeal.mutateAsync(String(deletingDeal.id));
    setIsDeleteOpen(false);
    setDeletingDeal(null);
  }, [deletingDeal, deleteDeal]);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-end">
        <Button variant="primary" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Yangi lid
        </Button>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[280px] max-w-[280px] flex-shrink-0 space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columnData.map((col) => (
            <div key={col.stage} className="flex flex-col min-w-[280px] max-w-[280px] flex-shrink-0">
              <div className="px-1 py-2.5">
                <h3 className="text-body font-semibold text-[var(--color-text-primary)]">
                  {col.title} ({col.deals.length})
                </h3>
                <p className="text-caption text-[var(--color-text-muted)]">{formatUsd(col.total)}</p>
              </div>
              <div className="space-y-2">
                {col.deals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} isWon={col.stage === 'WON'} onClick={() => handleOpenEdit(deal)} />
                ))}
                {col.deals.length === 0 && (
                  <div className="h-20 border-2 border-dashed border-[var(--color-bg-border)] rounded-lg flex items-center justify-center text-caption text-[var(--color-text-muted)]">
                    Bo'sh
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <DealForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        onDelete={editingDeal ? () => { setDeletingDeal(editingDeal); setIsDeleteOpen(true); setIsFormOpen(false); } : undefined}
        initialData={editingDeal}
        isLoading={createDeal.isPending || updateDeal.isPending}
      />

      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteDeal.isPending}
        title="Bitimni o'chirish"
        description="Bu bitim doimiy o'chiriladi. Davom etishni xohlaysizmi?"
        itemName={deletingDeal?.title}
      />
    </div>
  );
}

function DealCard({ deal, isWon, onClick }: { deal: Deal; isWon: boolean; onClick: () => void }) {
  return (
    <Card className="p-3 cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-body font-medium text-[var(--color-text-primary)] truncate">{deal.client}</p>
        {isWon && <Badge variant="success" size="sm">Yutildi</Badge>}
      </div>
      {deal.contactPerson && <p className="text-caption text-[var(--color-text-muted)] mb-2 truncate">{deal.contactPerson}</p>}
      <div className="flex items-center justify-between">
        <span className="text-body font-semibold text-[var(--color-accent)]">{formatUsd(deal.value)}</span>
        <Avatar name={deal.ownerName} size="xs" />
      </div>
    </Card>
  );
}
