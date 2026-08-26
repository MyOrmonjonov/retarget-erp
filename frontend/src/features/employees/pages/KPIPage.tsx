'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Progress } from '@/shared/ui/progress';
import { StatCard } from '@/shared/components/StatCard';
import { Settings, TrendingUp, TrendingDown } from 'lucide-react';

interface EmployeeKPI {
  id: string;
  fullName: string;
  department: string;
  score: number;
  trend: number;
}

const mockKPI: EmployeeKPI[] = [
  { id: '1', fullName: 'Sardor Aliyev', department: 'Boshqaruv', score: 95, trend: 2 },
  { id: '2', fullName: 'Malika Yusupova', department: 'Project Management', score: 92, trend: 3 },
  { id: '3', fullName: 'Aziz Karimov', department: 'Boshqaruv', score: 84, trend: -1 },
  { id: '4', fullName: 'Bekzod Tursunov', department: 'Media', score: 78, trend: 5 },
  { id: '5', fullName: 'Nodira Rashidova', department: 'SMM', score: 88, trend: 2 },
  { id: '6', fullName: 'Jasur Nazarov', department: 'Media', score: 70, trend: -4 },
  { id: '7', fullName: 'Malika Rustamova', department: 'Sales', score: 62, trend: -4 },
];

function departmentAverages(rows: EmployeeKPI[]) {
  const byDept = new Map<string, number[]>();
  rows.forEach((r) => {
    const list = byDept.get(r.department) ?? [];
    list.push(r.score);
    byDept.set(r.department, list);
  });
  return Array.from(byDept.entries()).map(([department, scores]) => ({
    department,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));
}

export function KPIPage() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const avgKPI = Math.round(mockKPI.reduce((sum, r) => sum + r.score, 0) / mockKPI.length);
  const deptAverages = useMemo(() => departmentAverages(mockKPI), []);
  const bestDept = deptAverages.reduce((a, b) => (b.avg > a.avg ? b : a));
  const worstDept = deptAverages.reduce((a, b) => (b.avg < a.avg ? b : a));

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <p className="text-caption text-[var(--color-text-secondary)]">Faqat CEO/Investor ko'radi</p>
        <Button variant="ghost" size="icon" onClick={() => setIsConfigOpen(true)} aria-label="KPI konfiguratsiyasi">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="O'rtacha KPI" value={`${avgKPI}%`} valueClassName="text-[var(--color-accent)]" />
        <StatCard title="Eng yaxshi bo'lim" value={bestDept.department} subtitle={`${bestDept.avg}% o'rtacha`} valueClassName="text-[var(--color-success)]" />
        <StatCard title="E'tibor talab" value={worstDept.department} subtitle={`${worstDept.avg}% o'rtacha`} valueClassName="text-[var(--color-warning)]" />
      </div>

      {/* Employee KPI List */}
      <Card>
        <CardHeader>
          <CardTitle>Xodimlar bo'yicha KPI</CardTitle>
          <p className="mt-1 text-caption text-[var(--color-text-secondary)]">
            Har bir xodimning joriy KPI ko'rsatkichi
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockKPI.map((row) => (
            <div key={row.id} className="flex items-center gap-4">
              <Avatar name={row.fullName} size="sm" />
              <div className="w-40 flex-shrink-0 min-w-0">
                <p className="text-body font-medium text-[var(--color-text-primary)] truncate">{row.fullName}</p>
                <p className="text-caption text-[var(--color-text-muted)] truncate">{row.department}</p>
              </div>
              <Progress value={row.score} max={100} variant="success" size="sm" className="flex-1" />
              <span className="w-10 text-right text-body font-medium text-[var(--color-text-primary)]">{row.score}%</span>
              <span
                className={`flex items-center gap-0.5 w-14 justify-end text-caption font-medium ${
                  row.trend >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                }`}
              >
                {row.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {row.trend >= 0 ? '+' : ''}
                {row.trend}%
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* KPI Config Modal */}
      <KPIConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </div>
  );
}

function KPIConfigModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-bg-surface)] rounded-xl shadow-2xl w-full max-w-sm animate-in slide-in-from-top-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-bg-border)]">
          <h2 className="text-h3">KPI konfiguratsiyasi</h2>
          <Badge variant="error" size="sm">Faqat CEO</Badge>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="p-4 space-y-4"
        >
          <p className="text-caption text-[var(--color-text-secondary)]">
            Har 10% bajarilgan KPI necha % ga oshiriladi
          </p>
          <Input name="baseShare" type="number" label="Baza ulushi (%)" defaultValue={40} required />
          <Input name="kpiShare" type="number" label="KPI ulushi (%)" defaultValue={50} required />
          <Input name="bonusPer10" type="number" label="Har 10% KPI → bonus (%)" defaultValue={5} required />
          <Input name="earlyBonus" type="number" label="Muddatdan oldin bonus (%)" defaultValue={10} required />
          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full">Saqlash</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
