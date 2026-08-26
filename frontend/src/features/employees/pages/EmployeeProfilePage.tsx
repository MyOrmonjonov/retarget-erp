'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Progress } from '@/shared/ui/progress';
import { cn } from '@/shared/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ROLE_LABELS } from '@/shared/types';

interface TeamRatingRow {
  id: string;
  name: string;
  score: number;
}

const teamRating: TeamRatingRow[] = [
  { id: '1', name: 'Sardor A.', score: 95 },
  { id: '2', name: 'Malika Y.', score: 92 },
  { id: '3', name: 'Nodira R.', score: 88 },
  { id: '4', name: 'Jasur N.', score: 70 },
];

const CURRENT_USER_NAME = 'Nodira R.';
const RATING = 4.2;

export function EmployeeProfilePage() {
  const { user } = useAuthStore();
  const [checkInTime, setCheckInTime] = useState('09:02');

  const fullName = user?.fullName ?? 'Nodira Rashidova';
  const department = "SMM bo'limi";
  const roleLabel = user ? ROLE_LABELS[user.role] : 'Xodim';

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
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={cn(
                    'w-4 h-4 rounded',
                    i <= Math.round(RATING) ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-border)]'
                  )}
                />
              ))}
            </div>
            <span className="text-caption text-[var(--color-text-muted)]">{RATING.toFixed(1)} / 5</span>
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
            <Button variant="primary" onClick={() => setCheckInTime(new Date().toTimeString().slice(0, 5))}>
              Ishni boshladim
            </Button>
            <Button variant="secondary">
              Ishni yakunladim
            </Button>
          </div>
          <div className="text-right">
            <p className="text-caption text-[var(--color-text-muted)]">Ish boshlandi: {checkInTime}</p>
            <p className="text-caption text-[var(--color-text-secondary)]">3s 24d ishladi</p>
          </div>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-caption text-[var(--color-text-secondary)]">KPI progress</p>
            <p className="mt-1 text-h2 text-[var(--color-accent)]">84%</p>
            <Progress value={84} max={100} variant="accent" size="sm" className="mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-caption text-[var(--color-text-secondary)]">Joriy oy maosh (taxminiy)</p>
            <p className="mt-1 text-h2 text-[var(--color-text-primary)]">2,210,000 so'm</p>
            <p className="mt-1 text-caption text-[var(--color-text-muted)]">
              Baza: 1,800,000 so'm &nbsp;·&nbsp; KPI: 310,000 so'm &nbsp;·&nbsp; Bonus: 100,000 so'm
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-caption text-[var(--color-text-secondary)]">Davomat statistikasi (oy)</p>
            <div className="mt-2 space-y-1 text-caption">
              <p className="text-[var(--color-success)]">To'liq kunlar: 18</p>
              <p className="text-[var(--color-warning)]">Kechikkan: 3</p>
              <p className="text-[var(--color-error)]">Yo'q bo'lgan: 1</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Rating */}
      <Card>
        <CardHeader className="flex flex-row items-baseline gap-2">
          <CardTitle>Jamoa reytingi</CardTitle>
          <span className="text-caption text-[var(--color-text-muted)]">(kengaytirish uchun bosing)</span>
        </CardHeader>
        <CardContent className="space-y-3">
          {teamRating.map((row, i) => {
            const isMe = row.name === CURRENT_USER_NAME;
            return (
              <div key={row.id}>
                <div className="flex items-center justify-between text-caption mb-1">
                  <span className={isMe ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-text-primary)]'}>
                    {i + 1}. {row.name} — {row.score}%
                    {isMe && ' (siz)'}
                  </span>
                </div>
                <Progress value={row.score} max={100} variant="accent" size="sm" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary">KPI tarixi</Button>
        <Button variant="secondary">Maosh tarixi</Button>
        <Button variant="secondary">Davomat tarixi</Button>
      </div>
    </div>
  );
}
