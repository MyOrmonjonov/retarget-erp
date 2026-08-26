'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { StatCard } from '@/shared/components/StatCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { uz } from 'date-fns/locale';

type DayStatus = 'FULL' | 'LATE' | 'WORKING' | 'ABSENT';

interface DailyAttendance {
  employeeId: string;
  fullName: string;
  checkIn: string | null;
  checkOut: string | null;
  hours: string;
  status: DayStatus;
}

const mockAttendance: DailyAttendance[] = [
  { employeeId: '1', fullName: 'Sardor Aliyev', checkIn: '08:58', checkOut: '18:02', hours: '9s 04d', status: 'FULL' },
  { employeeId: '2', fullName: 'Malika Yusupova', checkIn: '09:15', checkOut: '18:30', hours: '9s 15d', status: 'LATE' },
  { employeeId: '3', fullName: 'Aziz Karimov', checkIn: '09:00', checkOut: null, hours: '5s 40d', status: 'WORKING' },
  { employeeId: '4', fullName: 'Bekzod Tursunov', checkIn: '09:40', checkOut: '18:00', hours: '8s 20d', status: 'LATE' },
  { employeeId: '5', fullName: 'Nodira Rashidova', checkIn: null, checkOut: null, hours: '0s', status: 'ABSENT' },
  { employeeId: '6', fullName: 'Jasur Nazarov', checkIn: '08:55', checkOut: '17:58', hours: '9s 03d', status: 'FULL' },
];

const statusLabel: Record<DayStatus, string> = {
  FULL: "To'liq",
  LATE: 'Kechikdi',
  WORKING: 'Ishda',
  ABSENT: "Yo'q",
};

const statusVariant: Record<DayStatus, 'success' | 'warning' | 'accent' | 'error'> = {
  FULL: 'success',
  LATE: 'warning',
  WORKING: 'accent',
  ABSENT: 'error',
};

export function AttendancePage() {
  const [date, setDate] = useState(new Date(2026, 7, 25));

  const stats = useMemo(() => {
    const present = mockAttendance.filter((a) => a.status !== 'ABSENT').length;
    const late = mockAttendance.filter((a) => a.status === 'LATE').length;
    const absent = mockAttendance.filter((a) => a.status === 'ABSENT').length;
    return { present, total: mockAttendance.length, late, absent };
  }, []);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setDate((d) => addDays(d, -1))} aria-label="Oldingi kun">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-body text-[var(--color-text-secondary)] min-w-36 text-center">
            {format(date, 'd-MMMM yyyy', { locale: uz })}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setDate((d) => addDays(d, 1))} aria-label="Keyingi kun">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Bugun kelgan" value={`${stats.present}/${stats.total}`} subtitle="Xodimlar" valueClassName="text-[var(--color-accent)]" />
        <StatCard title="Kechikkanlar" value={stats.late} subtitle="Bugun" valueClassName="text-[var(--color-warning)]" />
        <StatCard title="Kelmaganlar" value={stats.absent} subtitle="Bugun" valueClassName="text-[var(--color-error)]" />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
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
              {mockAttendance.map((row) => (
                <TableRow key={row.employeeId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar name={row.fullName} size="sm" />
                      <span className="font-medium text-[var(--color-text-primary)]">{row.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{row.checkIn ?? '—'}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{row.checkOut ?? '—'}</TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{row.hours}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[row.status]}>{statusLabel[row.status]}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
