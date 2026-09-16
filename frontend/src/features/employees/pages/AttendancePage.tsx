'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/shared/ui/card';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { StatCard } from '@/shared/components/StatCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table';
import { Users } from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import type { AttendanceStatus } from '@/shared/types';
import { useEmployees } from '../hooks/useEmployees';
import { attendanceApi } from '../api/attendanceApi';
import { MonthCalendar } from '@/shared/components/MonthCalendar';

const statusLabel: Record<AttendanceStatus, string> = {
  PRESENT: "To'liq",
  LATE: 'Kechikdi',
  EARLY_LEAVE: 'Erta ketdi',
  REMOTE: 'Masofaviy',
  ON_LEAVE: "Ta'tilda",
  ABSENT: "Yo'q",
};

const statusVariant: Record<AttendanceStatus, 'success' | 'warning' | 'accent' | 'error' | 'default'> = {
  PRESENT: 'success',
  LATE: 'warning',
  EARLY_LEAVE: 'warning',
  REMOTE: 'accent',
  ON_LEAVE: 'default',
  ABSENT: 'error',
};

function hoursBetween(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || !checkOut) return '—';
  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);
  const minutes = (outH * 60 + outM) - (inH * 60 + inM);
  if (minutes <= 0) return '—';
  return `${Math.floor(minutes / 60)}s ${minutes % 60}d`;
}

export function AttendancePage() {
  const [date, setDate] = useState(new Date());

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: records = [], isLoading: recordsLoading } = useQuery({
    queryKey: ['attendance', date.toDateString()],
    queryFn: () => attendanceApi.listForDate(date),
  });
  const isLoading = employeesLoading || recordsLoading;

  const rows = useMemo(() => {
    return employees.map((emp) => {
      const record = records.find((r) => String(r.employeeId) === String(emp.id));
      return {
        employeeId: emp.id,
        fullName: emp.fullName,
        avatar: emp.avatar,
        checkIn: record?.checkIn ?? null,
        checkOut: record?.checkOut ?? null,
        status: record?.status ?? ('ABSENT' as AttendanceStatus),
      };
    });
  }, [employees, records]);

  const stats = useMemo(() => {
    const present = rows.filter((r) => r.status !== 'ABSENT').length;
    const late = rows.filter((r) => r.status === 'LATE').length;
    const absent = rows.filter((r) => r.status === 'ABSENT').length;
    return { present, total: rows.length, late, absent };
  }, [rows]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start animate-in">
      <Card className="p-4">
        <MonthCalendar selected={date} onSelect={setDate} />
      </Card>

      <div className="space-y-6">
        <p className="text-body font-semibold text-[var(--color-text-primary)] capitalize">
          {format(date, 'd-MMMM yyyy, EEEE', { locale: uz })}
        </p>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Kelgan" value={`${stats.present}/${stats.total}`} subtitle="Xodimlar" valueClassName="text-[var(--color-accent)]" isLoading={isLoading} />
          <StatCard title="Kechikkanlar" value={stats.late} subtitle="Shu kun" valueClassName="text-[var(--color-warning)]" isLoading={isLoading} />
          <StatCard title="Kelmaganlar" value={stats.absent} subtitle="Shu kun" valueClassName="text-[var(--color-error)]" isLoading={isLoading} />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y divide-[var(--color-bg-border)]">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/6" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Xodim</TableHead>
                    <TableHead>Keldi</TableHead>
                    <TableHead>Ketdi</TableHead>
                    <TableHead>Jami soat</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.employeeId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar name={row.fullName} src={row.avatar} size="sm" />
                          <span className="font-medium text-[var(--color-text-primary)]">{row.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[var(--color-text-secondary)]">{row.checkIn ?? '—'}</TableCell>
                      <TableCell className="text-[var(--color-text-secondary)]">{row.checkOut ?? '—'}</TableCell>
                      <TableCell className="text-[var(--color-text-secondary)]">{hoursBetween(row.checkIn, row.checkOut)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[row.status]}>{statusLabel[row.status]}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {!isLoading && rows.length === 0 && (
          <Card>
            <EmptyState icon={Users} title="Xodimlar topilmadi" />
          </Card>
        )}
      </div>
    </div>
  );
}
