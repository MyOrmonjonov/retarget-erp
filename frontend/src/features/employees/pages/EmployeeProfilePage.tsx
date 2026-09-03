'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { Trophy } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ROLE_LABELS } from '@/shared/types';
import { useEmployees } from '../hooks/useEmployees';
import { attendanceApi } from '../api/attendanceApi';
import { kpiApi } from '../api/kpiApi';

function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthRange(): [Date, Date] {
  const now = new Date();
  return [new Date(now.getFullYear(), now.getMonth(), 1), now];
}

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

  const [from, to] = monthRange();
  const { data: myAttendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', 'me', currentPeriod()],
    queryFn: () => attendanceApi.listForEmployeeRange(user!.id, from, to),
    enabled: !!user,
  });
  const todayRecord = myAttendance.find((r) => r.date === new Date().toISOString().slice(0, 10));

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

  const teamRating = useMemo(() => {
    return employees
      .map((e) => ({ id: e.id, name: e.fullName, score: e.kpiScore ?? 0, isMe: String((e as { userId?: string }).userId) === user?.id }))
      .sort((a, b) => b.score - a.score);
  }, [employees, user?.id]);

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
          <CardContent className="p-5">
            <p className="text-caption text-[var(--color-text-secondary)]">KPI progress</p>
            <p className="mt-1 text-h2 text-[var(--color-accent)]">{kpiScore}%</p>
            <Progress value={kpiScore} max={100} variant="accent" size="sm" className="mt-3" />
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

      {/* Team Rating */}
      <Card>
        <CardHeader>
          <CardTitle>Jamoa reytingi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {teamRating.length === 0 ? (
            <EmptyState icon={Trophy} title="Ma'lumot yo'q" className="py-4" />
          ) : (
            teamRating.map((row, i) => (
              <div key={row.id}>
                <div className="flex items-center justify-between text-caption mb-1">
                  <span className={row.isMe ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-text-primary)]'}>
                    {i + 1}. {row.name} — {row.score}%
                    {row.isMe && ' (siz)'}
                  </span>
                </div>
                <Progress value={row.score} max={100} variant="accent" size="sm" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
