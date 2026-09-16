'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Progress } from '@/shared/ui/progress';
import { Skeleton } from '@/shared/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { StatCard } from '@/shared/components/StatCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { Settings, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { useEmployees, useUpdateKpiBase } from '../hooks/useEmployees';
import { kpiApi } from '../api/kpiApi';

function currentPeriod(offset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function KPIPage() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: currentRecords = [], isLoading: currentLoading } = useQuery({
    queryKey: ['kpi', currentPeriod()],
    queryFn: () => kpiApi.listForPeriod(currentPeriod()),
  });
  const { data: previousRecords = [] } = useQuery({
    queryKey: ['kpi', currentPeriod(-1)],
    queryFn: () => kpiApi.listForPeriod(currentPeriod(-1)),
  });
  const isLoading = employeesLoading || currentLoading;

  const rows = useMemo(() => {
    return employees.map((emp) => {
      const current = currentRecords.find((r) => String(r.employeeId) === String(emp.id));
      const previous = previousRecords.find((r) => String(r.employeeId) === String(emp.id));
      const score = current?.score ?? emp.kpiScore ?? 0;
      const trend = current && previous ? current.score - previous.score : 0;
      return { id: emp.id, fullName: emp.fullName, avatar: emp.avatar, department: emp.department, score, trend };
    });
  }, [employees, currentRecords, previousRecords]);

  const deptAverages = useMemo(() => {
    const byDept = new Map<string, number[]>();
    rows.forEach((r) => {
      const dept = r.department || "Bo'lim ko'rsatilmagan";
      const list = byDept.get(dept) ?? [];
      list.push(r.score);
      byDept.set(dept, list);
    });
    return Array.from(byDept.entries()).map(([department, scores]) => ({
      department,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));
  }, [rows]);

  const avgKPI = rows.length ? Math.round(rows.reduce((sum, r) => sum + r.score, 0) / rows.length) : 0;
  const bestDept = deptAverages.length ? deptAverages.reduce((a, b) => (b.avg > a.avg ? b : a)) : null;
  const worstDept = deptAverages.length ? deptAverages.reduce((a, b) => (b.avg < a.avg ? b : a)) : null;

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
        <StatCard title="O'rtacha KPI" value={`${avgKPI}%`} valueClassName="text-[var(--color-accent)]" isLoading={isLoading} />
        <StatCard title="Eng yaxshi bo'lim" value={bestDept?.department ?? '—'} subtitle={bestDept ? `${bestDept.avg}% o'rtacha` : undefined} valueClassName="text-[var(--color-success)]" isLoading={isLoading} />
        <StatCard title="E'tibor talab" value={worstDept?.department ?? '—'} subtitle={worstDept ? `${worstDept.avg}% o'rtacha` : undefined} valueClassName="text-[var(--color-warning)]" isLoading={isLoading} />
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
          {isLoading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
          ) : rows.length === 0 ? (
            <EmptyState icon={Users} title="Xodimlar topilmadi" className="py-4" />
          ) : (
            rows.map((row) => (
              <div key={row.id} className="flex items-center gap-4">
                <Avatar name={row.fullName} src={row.avatar} size="sm" />
                <div className="w-40 flex-shrink-0 min-w-0">
                  <p className="text-body font-medium text-[var(--color-text-primary)] truncate">{row.fullName}</p>
                  <p className="text-caption text-[var(--color-text-muted)] truncate">{row.department || '—'}</p>
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
            ))
          )}
        </CardContent>
      </Card>

      {/* KPI Config Modal */}
      <KPIConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} employees={employees} />
    </div>
  );
}

/** Inline-editable KPI base, committed on blur/Enter (mirrors EmployeesPage's salary editor). */
function KpiBaseField({ value, onSave }: { value: number; onSave: (next: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  const commit = () => {
    const parsed = Number(draft);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100 || parsed === value) {
      setDraft(String(value));
      return;
    }
    onSave(parsed);
  };
  return (
    <Input
      type="number"
      min={0}
      max={100}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      className="w-20 h-8 text-caption"
    />
  );
}

function KPIConfigModal({ isOpen, onClose, employees }: {
  isOpen: boolean;
  onClose: () => void;
  employees: { id: string | number; fullName: string; avatar?: string; department: string; kpiBase: number }[];
}) {
  const updateKpiBase = useUpdateKpiBase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>KPI bazasi sozlamalari</DialogTitle>
            <Badge variant="error" size="sm">Faqat CEO</Badge>
          </div>
        </DialogHeader>
        <p className="text-caption text-[var(--color-text-secondary)]">
          Xodimga vazifa biriktirilmagan davrda ishlatiladigan KPI bazasi - har xodim uchun alohida
          belgilanadi, chunki lavozim va yuklamaga qarab KPI talablari har xil bo'ladi.
        </p>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {employees.length === 0 ? (
            <EmptyState icon={Users} title="Xodimlar topilmadi" className="py-4" />
          ) : (
            employees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-3 py-2 border-b border-[var(--color-bg-border)] last:border-0">
                <Avatar name={emp.fullName} src={emp.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-[var(--color-text-primary)] truncate">{emp.fullName}</p>
                  <p className="text-caption text-[var(--color-text-muted)] truncate">{emp.department || '—'}</p>
                </div>
                <KpiBaseField
                  value={emp.kpiBase}
                  onSave={(next) => updateKpiBase.mutate({ id: String(emp.id), kpiBase: next })}
                />
                <span className="text-caption text-[var(--color-text-muted)]">%</span>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
