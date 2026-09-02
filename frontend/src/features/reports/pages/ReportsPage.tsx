'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table';
import { Skeleton } from '@/shared/ui/skeleton';
import { Progress } from '@/shared/ui/progress';
import { StatCard } from '@/shared/components/StatCard';
import { useProjects, useUpdateProjectReport } from '@/features/projects/hooks/useProjects';
import type { Project } from '@/shared/types';

function money(value: number) {
  return `${value.toLocaleString('en-US')} so'm`;
}

/** Inline-editable number cell for one report field, committed on blur. */
function ReportNumberCell({ projectId, field, value }: {
  projectId: string;
  field: 'reportBudget' | 'reportLeads' | 'reportCpl' | 'reportSales' | 'reportRoi';
  value: number | undefined;
}) {
  const [draft, setDraft] = useState(value != null ? String(value) : '');
  const updateReport = useUpdateProjectReport();

  const commit = () => {
    const parsed = draft === '' ? undefined : Number(draft);
    if (draft !== '' && (Number.isNaN(parsed) || (parsed as number) < 0)) {
      setDraft(value != null ? String(value) : '');
      return;
    }
    if (parsed === value) return;
    updateReport.mutate({ id: projectId, report: { [field]: parsed } });
  };

  return (
    <Input
      type="number"
      min={0}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      disabled={updateReport.isPending}
      className="w-24 h-8 text-caption"
    />
  );
}

export function ReportsPage() {
  const { data: projects = [], isLoading } = useProjects();

  const stats = useMemo(() => {
    const totalBudget = projects.reduce((sum, p) => sum + (p.reportBudget ?? 0), 0);
    const totalLeads = projects.reduce((sum, p) => sum + (p.reportLeads ?? 0), 0);
    const totalSales = projects.reduce((sum, p) => sum + (p.reportSales ?? 0), 0);
    const withRoi = projects.filter((p) => (p.reportRoi ?? 0) > 0);
    const avgRoi = withRoi.length > 0
      ? Math.round(withRoi.reduce((sum, p) => sum + (p.reportRoi ?? 0), 0) / withRoi.length)
      : 0;
    return { totalBudget, totalLeads, totalSales, avgRoi };
  }, [projects]);

  return (
    <div className="space-y-6 animate-in">
      <p className="text-caption text-[var(--color-text-secondary)]">
        Loyihalar bo'yicha marketing ko'rsatkichlari - qo'lda kiritiladi
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Jami byudjet" value={money(stats.totalBudget)} isLoading={isLoading} />
        <StatCard title="Jami lidlar" value={stats.totalLeads} isLoading={isLoading} />
        <StatCard title="Jami sotuvlar" value={stats.totalSales} isLoading={isLoading} />
        <StatCard title="O'rtacha ROI" value={`${stats.avgRoi}%`} valueClassName="text-[var(--color-success)]" isLoading={isLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loyihalar bo'yicha hisobot</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}</div>
          ) : projects.length === 0 ? (
            <p className="text-center text-[var(--color-text-secondary)] py-8">Loyihalar topilmadi</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loyiha</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Byudjet</TableHead>
                  <TableHead>Lidlar</TableHead>
                  <TableHead>CPL</TableHead>
                  <TableHead>Sotuvlar</TableHead>
                  <TableHead>ROI (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p: Project) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-[var(--color-text-primary)]">{p.name}</TableCell>
                    <TableCell>
                      <div className="w-24">
                        <Progress value={p.progress} max={100} variant="accent" size="sm" />
                      </div>
                    </TableCell>
                    <TableCell><ReportNumberCell projectId={String(p.id)} field="reportBudget" value={p.reportBudget} /></TableCell>
                    <TableCell><ReportNumberCell projectId={String(p.id)} field="reportLeads" value={p.reportLeads} /></TableCell>
                    <TableCell><ReportNumberCell projectId={String(p.id)} field="reportCpl" value={p.reportCpl} /></TableCell>
                    <TableCell><ReportNumberCell projectId={String(p.id)} field="reportSales" value={p.reportSales} /></TableCell>
                    <TableCell><ReportNumberCell projectId={String(p.id)} field="reportRoi" value={p.reportRoi} /></TableCell>
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
