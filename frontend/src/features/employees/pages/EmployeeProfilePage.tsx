'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { CircularProgress } from '@/shared/components/CircularProgress';
import { MonthCalendar } from '@/shared/components/MonthCalendar';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ROLE_LABELS, type AttendanceStatus } from '@/shared/types';
import { useEmployees } from '../hooks/useEmployees';
import { attendanceApi } from '../api/attendanceApi';
import { kpiApi } from '../api/kpiApi';

function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const ATTENDANCE_MARKER: Partial<Record<AttendanceStatus, 'success' | 'warning' | 'error'>> = {
  PRESENT: 'success',
  LATE: 'warning',
  ABSENT: 'error',
};

const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: "To'liq",
  LATE: 'Kechikdi',
  EARLY_LEAVE: 'Erta ketdi',
  REMOTE: 'Masofaviy',
  ON_LEAVE: "Ta'tilda",
  ABSENT: "Kelmagan",
};

export function EmployeeProfilePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: employees = [] } = useEmployees();
  const me = employees.find((e) => String((e as { userId?: string }).userId) === user?.id);

  const { data: kpiRecords = [] } = useQuery({
    queryKey: ['kpi', currentPeriod()],
    queryFn: () => kpiApi.listForPeriod(currentPeriod()),
  });
  const myKpi = kpiRecords.find((r) => String(r.employeeId) === user?.id);

  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const monthKey = format(visibleMonth, 'yyyy-MM');
  const { data: myAttendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', 'me', monthKey],
    queryFn: () => attendanceApi.listForEmployeeRange(user!.id, startOfMonth(visibleMonth), endOfMonth(visibleMonth)),
    enabled: !!user,
  });
  const todayRecord = myAttendance.find((r) => r.date === new Date().toISOString().slice(0, 10));
  const selectedDayKey = format(selectedDay, 'yyyy-MM-dd');
  const selectedRecord = myAttendance.find((r) => r.date === selectedDayKey);
  const attendanceMarkers = useMemo(() => {
    const markers: Record<string, 'success' | 'warning' | 'error'> = {};
    for (const record of myAttendance) {
      const marker = ATTENDANCE_MARKER[record.status];
      if (marker) markers[record.date] = marker;
    }
    return markers;
  }, [myAttendance]);

  const checkInMutation = useMutation({
    mutationFn: () => attendanceApi.checkIn(user!.id, new Date().toTimeString().slice(0, 5)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'me'] });
      toast.success('Ish boshlanishi belgilandi');
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Xatolik yuz berdi'),
  });

  const checkOutMutation = useMutation({
    mutationFn: () => attendanceApi.checkOut(user!.id, new Date().toTimeString().slice(0, 5)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'me'] });
      toast.success('Ish yakuni belgilandi');
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Xatolik yuz berdi'),
  });

  const monthlyStats = useMemo(() => {
    const full = myAttendance.filter((r) => r.status === 'PRESENT').length;
    const late = myAttendance.filter((r) => r.status === 'LATE').length;
    const absent = myAttendance.filter((r) => r.status === 'ABSENT').length;
    return { full, late, absent };
  }, [myAttendance]);

  const fullName = user?.fullName ?? '';
  const department = me?.department || "Bo'lim ko'rsatilmagan";
  const roleLabel = user ? ROLE_LABELS[user.role] : 'Xodim';
  const kpiScore = myKpi?.score ?? me?.kpiScore ?? 0;

  return (
    <div className="space-y-6 animate-in">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <Avatar name={fullName} src={user?.avatar} size="xl" />
          <div className="flex-1 min-w-0">
            <p className="text-h3 text-[var(--color-text-primary)]">{fullName}</p>
            <p className="text-caption text-[var(--color-text-secondary)]">{roleLabel} · {department}</p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Bugungi davomat</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={() => checkInMutation.mutate()}
              loading={checkInMutation.isPending}
              disabled={!!todayRecord?.checkIn}
            >
              Ishni boshladim
            </Button>
            <Button
              variant="secondary"
              onClick={() => checkOutMutation.mutate()}
              loading={checkOutMutation.isPending}
              disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}
            >
              Ishni yakunladim
            </Button>
          </div>
          <div className="text-right">
            <p className="text-caption text-[var(--color-text-muted)]">
              Ish boshlandi: {todayRecord?.checkIn ?? '—'}
            </p>
            <p className="text-caption text-[var(--color-text-secondary)]">
              {todayRecord?.checkOut ? `Ish tugadi: ${todayRecord.checkOut}` : 'Hali davom etmoqda'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <CircularProgress value={kpiScore} size={64} strokeWidth={5} variant="accent" />
            <p className="text-caption text-[var(--color-text-secondary)]">KPI progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-caption text-[var(--color-text-secondary)]">Davomat statistikasi (oy)</p>
            {attendanceLoading ? (
              <Skeleton className="h-16 w-full mt-2" />
            ) : (
              <div className="mt-2 space-y-1 text-caption">
                <p className="text-[var(--color-success)]">To'liq kunlar: {monthlyStats.full}</p>
                <p className="text-[var(--color-warning)]">Kechikkan: {monthlyStats.late}</p>
                <p className="text-[var(--color-error)]">Yo'q bo'lgan: {monthlyStats.absent}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Work-time history */}
      <Card>
        <CardHeader>
          <CardTitle>Ish vaqti tarixi</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
          <MonthCalendar
            selected={selectedDay}
            onSelect={setSelectedDay}
            markers={attendanceMarkers}
            onMonthChange={setVisibleMonth}
          />
          <div>
            <p className="text-body font-semibold text-[var(--color-text-primary)] capitalize mb-3">
              {format(selectedDay, 'd-MMMM yyyy')}
            </p>
            {attendanceLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : selectedRecord ? (
              <div className="space-y-2 text-caption">
                <p className="text-[var(--color-text-secondary)]">
                  Ish boshlandi: <span className="text-[var(--color-text-primary)] font-medium">{selectedRecord.checkIn ?? '—'}</span>
                </p>
                <p className="text-[var(--color-text-secondary)]">
                  Ish yakunlandi: <span className="text-[var(--color-text-primary)] font-medium">{selectedRecord.checkOut ?? '—'}</span>
                </p>
                <p className="text-[var(--color-text-secondary)]">
                  Status: <span className="text-[var(--color-text-primary)] font-medium">{ATTENDANCE_LABEL[selectedRecord.status]}</span>
                </p>
              </div>
            ) : (
              <p className="text-caption text-[var(--color-text-muted)]">Bu kun uchun yozuv yo'q</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
