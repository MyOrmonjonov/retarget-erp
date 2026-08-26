'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { Plus } from 'lucide-react';
import type { Deal, DealStage } from '@/shared/types';

const columns: { stage: DealStage; title: string }[] = [
  { stage: 'LEAD', title: 'Yangi lid' },
  { stage: 'QUALIFIED', title: 'Aloqada' },
  { stage: 'PROPOSAL', title: 'Taklif yuborildi' },
  { stage: 'WON', title: 'Yopildi' },
];

const initialDeals: Deal[] = [
  { id: '1', title: 'GreenLeaf Cafe', client: 'GreenLeaf Cafe', contactPerson: 'Umar Rahimov', value: 2100, stage: 'LEAD', probability: 10, ownerId: '2', ownerName: 'Malika', expectedCloseDate: '2026-09-10', createdAt: '', updatedAt: '' },
  { id: '2', title: 'SunnyMart', client: 'SunnyMart', contactPerson: 'Elyor Nazarov', value: 1800, stage: 'LEAD', probability: 10, ownerId: '3', ownerName: 'Aziz', expectedCloseDate: '2026-09-12', createdAt: '', updatedAt: '' },
  { id: '3', title: 'UrbanFit Gym', client: 'UrbanFit Gym', contactPerson: 'Kamola Yusupova', value: 2600, stage: 'LEAD', probability: 10, ownerId: '2', ownerName: 'Malika', expectedCloseDate: '2026-09-14', createdAt: '', updatedAt: '' },
  { id: '4', title: 'BrightSmile', client: 'BrightSmile', contactPerson: 'Jasur Olimov', value: 1700, stage: 'LEAD', probability: 10, ownerId: '3', ownerName: 'Aziz', expectedCloseDate: '2026-09-16', createdAt: '', updatedAt: '' },

  { id: '5', title: 'FitZone Gym', client: 'FitZone Gym', contactPerson: 'Dilnoza Sharipova', value: 4800, stage: 'QUALIFIED', probability: 40, ownerId: '3', ownerName: 'Aziz', expectedCloseDate: '2026-09-05', createdAt: '', updatedAt: '' },
  { id: '6', title: 'MaxBuild', client: 'MaxBuild', contactPerson: 'Otabek Yusupov', value: 5200, stage: 'QUALIFIED', probability: 40, ownerId: '2', ownerName: 'Malika', expectedCloseDate: '2026-09-08', createdAt: '', updatedAt: '' },
  { id: '7', title: 'GoldenBakery', client: 'GoldenBakery', contactPerson: 'Sevara Tosheva', value: 4300, stage: 'QUALIFIED', probability: 40, ownerId: '3', ownerName: 'Aziz', expectedCloseDate: '2026-09-11', createdAt: '', updatedAt: '' },

  { id: '8', title: 'TechHub LLC', client: 'TechHub LLC', contactPerson: 'Rustam Yoldoshev', value: 6500, stage: 'PROPOSAL', probability: 70, ownerId: '2', ownerName: 'Malika', expectedCloseDate: '2026-09-02', createdAt: '', updatedAt: '' },
  { id: '9', title: 'NovaTech', client: 'NovaTech', contactPerson: 'Bekzod Yusupov', value: 3400, stage: 'PROPOSAL', probability: 70, ownerId: '3', ownerName: 'Aziz', expectedCloseDate: '2026-09-03', createdAt: '', updatedAt: '' },

  { id: '10', title: 'Coffee Lab', client: 'Coffee Lab', contactPerson: 'Sardor Ergashev', value: 5000, stage: 'WON', probability: 100, ownerId: '3', ownerName: 'Aziz', expectedCloseDate: '2026-08-15', createdAt: '', updatedAt: '' },
  { id: '11', title: 'UrbanFit', client: 'UrbanFit', contactPerson: 'Kamola Yusupova', value: 4500, stage: 'WON', probability: 100, ownerId: '2', ownerName: 'Malika', expectedCloseDate: '2026-08-10', createdAt: '', updatedAt: '' },
  { id: '12', title: 'MegaGroup', client: 'MegaGroup', contactPerson: 'Farrux Olimov', value: 4200, stage: 'WON', probability: 100, ownerId: '3', ownerName: 'Aziz', expectedCloseDate: '2026-08-05', createdAt: '', updatedAt: '' },
  { id: '13', title: 'Trendy Wear', client: 'Trendy Wear', contactPerson: 'Dilnoza Karimova', value: 4600, stage: 'WON', probability: 100, ownerId: '2', ownerName: 'Malika', expectedCloseDate: '2026-08-02', createdAt: '', updatedAt: '' },
  { id: '14', title: 'NovaTech Media', client: 'NovaTech Media', contactPerson: 'Jasur Nazarov', value: 3700, stage: 'WON', probability: 100, ownerId: '3', ownerName: 'Aziz', expectedCloseDate: '2026-07-28', createdAt: '', updatedAt: '' },
];

function formatUsd(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

export function SalesPage() {
  const [deals] = useState<Deal[]>(initialDeals);

  const columnData = useMemo(() => {
    return columns.map((col) => {
      const columnDeals = deals.filter((d) => d.stage === col.stage);
      const total = columnDeals.reduce((sum, d) => sum + d.value, 0);
      return { ...col, deals: columnDeals, total };
    });
  }, [deals]);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-end">
        <Button variant="primary">
          <Plus className="h-4 w-4" />
          Yangi lid
        </Button>
      </div>

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
                <DealCard key={deal.id} deal={deal} isWon={col.stage === 'WON'} />
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
    </div>
  );
}

function DealCard({ deal, isWon }: { deal: Deal; isWon: boolean }) {
  const extraCount = (String(deal.id).split('').reduce((sum: number, ch: string) => sum + ch.charCodeAt(0), 0) % 4) + 1;

  return (
    <div>
      <Card className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-body font-medium text-[var(--color-text-primary)] truncate">{deal.client}</p>
          {isWon && <Badge variant="success" size="sm">Yutildi</Badge>}
        </div>
        <p className="text-caption text-[var(--color-text-muted)] mb-2 truncate">{deal.contactPerson}</p>
        <div className="flex items-center justify-between">
          <span className="text-body font-semibold text-[var(--color-accent)]">{formatUsd(deal.value)}</span>
          <Avatar name={deal.ownerName} size="xs" />
        </div>
      </Card>
      <p className="mt-1.5 px-1 text-caption text-[var(--color-text-muted)]">+{extraCount} boshqa</p>
    </div>
  );
}
