'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table';
import { StatCard } from '@/shared/components/StatCard';

interface ProjectFinance {
  id: string;
  name: string;
  budget: number;
  spent: number;
}

interface PayrollRow {
  id: string;
  name: string;
  base: number;
  kpiBonus: number;
}

const projectFinances: ProjectFinance[] = [
  { id: '1', name: 'Instagram Rebrand', budget: 8000, spent: 5200 },
  { id: '2', name: 'Winter Campaign', budget: 12000, spent: 9000 },
  { id: '3', name: 'Product Launch', budget: 15000, spent: 11500 },
  { id: '4', name: 'Corporate Rebrand', budget: 6000, spent: 5800 },
];

const payroll: PayrollRow[] = [
  { id: '1', name: 'Sardor A.', base: 1200, kpiBonus: 380 },
  { id: '2', name: 'Malika Y.', base: 900, kpiBonus: 310 },
  { id: '3', name: 'Aziz K.', base: 850, kpiBonus: 260 },
  { id: '4', name: 'Bekzod T.', base: 700, kpiBonus: 180 },
];

function usd(value: number) {
  return `$${value.toLocaleString('en-US')}`;
}

export function FinancePage() {
  const totalRevenue = 84200;
  const totalExpenses = 52100;
  const netProfit = totalRevenue - totalExpenses;
  const pendingPayments = 6400;

  return (
    <div className="space-y-6 animate-in">
      <div>
        <Badge variant="error" size="sm">Faqat CEO</Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Umumiy daromad" value={usd(totalRevenue)} valueClassName="text-[var(--color-success)]" />
        <StatCard title="Xarajatlar" value={usd(totalExpenses)} valueClassName="text-[var(--color-warning)]" />
        <StatCard title="Sof foyda" value={usd(netProfit)} valueClassName="text-[var(--color-success)]" />
        <StatCard title="Kutilayotgan to'lovlar" value={usd(pendingPayments)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Finance */}
        <Card>
          <CardHeader>
            <CardTitle>Loyihalar bo'yicha moliya</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loyiha</TableHead>
                  <TableHead>Byudjet</TableHead>
                  <TableHead>Sarflandi</TableHead>
                  <TableHead>Foyda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectFinances.map((p) => {
                  const profit = p.budget - p.spent;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-[var(--color-text-primary)]">{p.name}</TableCell>
                      <TableCell className="text-[var(--color-text-secondary)]">{usd(p.budget)}</TableCell>
                      <TableCell className="text-[var(--color-text-secondary)]">{usd(p.spent)}</TableCell>
                      <TableCell className={profit >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}>
                        {profit >= 0 ? '+' : ''}{usd(profit)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payroll */}
        <Card>
          <CardHeader>
            <CardTitle>Xodimlar oyligi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Xodim</TableHead>
                  <TableHead>Baza</TableHead>
                  <TableHead>KPI bonus</TableHead>
                  <TableHead>Jami</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-[var(--color-text-primary)]">{row.name}</TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">{usd(row.base)}</TableCell>
                    <TableCell className="text-[var(--color-text-secondary)]">{usd(row.kpiBonus)}</TableCell>
                    <TableCell className="font-medium text-[var(--color-text-primary)]">{usd(row.base + row.kpiBonus)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
