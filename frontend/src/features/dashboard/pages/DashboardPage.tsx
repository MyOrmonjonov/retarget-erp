'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { StatCard } from '@/shared/components/StatCard';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import { CircularProgress } from '@/shared/components/CircularProgress';
import { Skeleton } from '@/shared/ui/skeleton';
import { useDashboardStats, useProjectStatus, useTopEmployee, useTeamLoad, useMotivationScore } from '../hooks/useDashboard';
import { PROJECT_STATUS_LABELS, type ProjectStatus } from '@/shared/types';

function motivationColor(score: number): string {
  if (score >= 70) return 'var(--color-success)';
  if (score >= 40) return 'var(--color-warning)';
  return 'var(--color-error)';
}

function motivationLabel(score: number): string {
  if (score >= 75) return 'Ishlar juda yaxshi';
  if (score >= 50) return 'Jarayon nazoratda';
  if (score >= 30) return "Tezkor e'tibor kerak";
  return 'Kritik signal';
}

const statusStyle: Record<ProjectStatus, { backgroundColor: string; color: string }> = {
  ACTIVE: { backgroundColor: '#E8F0FE', color: '#0071E3' },
  PLANNING: { backgroundColor: '#F2F2F7', color: '#6E6E73' },
  ON_HOLD: { backgroundColor: '#FFF4E5', color: '#FF9F0A' },
  COMPLETED: { backgroundColor: '#E8FBED', color: '#34C759' },
  CANCELLED: { backgroundColor: '#FFF0EF', color: '#FF3B30' },
};

const MOTIVATION_STAGES = ['Past', 'Xavf', 'Nazorat', 'Yaxshi', "A'lo"];

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: projectStatus, isLoading: projectsLoading } = useProjectStatus();
  const { data: topEmployee, isLoading: topEmployeeLoading } = useTopEmployee();
  const { data: teamLoad, isLoading: teamLoadLoading } = useTeamLoad();
  const { data: motivationScore, isLoading: motivationLoading } = useMotivationScore();

  return (
    <div className="space-y-6 animate-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Loyihalar"
          value={stats?.totalProjects ?? '—'}
          subtitle={stats ? `${stats.activeProjects} ta faol` : undefined}
          isLoading={statsLoading}
        />
        <StatCard
          title="Tasklar"
          value={stats ? `${stats.completedTasks}/${stats.totalTasks}` : '—'}
          subtitle="Bajarilgan ishlar"
          isLoading={statsLoading}
        />
        <StatCard
          title="Xodimlar"
          value={stats?.totalEmployees ?? '—'}
          subtitle="Real foydalanuvchilar"
          isLoading={statsLoading}
        />
        <StatCard
          title="Tasdiq kutmoqda"
          value={stats?.pendingApprovals ?? '—'}
          subtitle="Kontent ko'rib chiqilmoqda"
          isLoading={statsLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Project Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="!text-[16px] !font-bold">Loyihalar holati</CardTitle>
            <p className="mt-1 text-caption text-[var(--color-text-secondary)]">
              Status va progress bo'yicha tez ko'rinish
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {projectsLoading ? (
              <div className="divide-y divide-[var(--color-bg-border)]">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="w-24 h-5 rounded-full" />
                  </div>
                ))}
              </div>
            ) : projectStatus && projectStatus.length > 0 ? (
              <div className="divide-y divide-[var(--color-bg-border)]">
                {projectStatus.map((project) => (
                  <div
                    key={project.id}
                    className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <CircularProgress
                        value={project.progress}
                        size={44}
                        strokeWidth={3}
                        variant="accent"
                        fillColor="var(--color-bg-hover)"
                      />
                      <div className="min-w-0">
                        <p className="text-body font-medium text-[var(--color-text-primary)] truncate">
                          {project.name}
                        </p>
                        <p className="text-caption text-[var(--color-text-muted)] truncate">{project.client}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <Badge style={statusStyle[project.status]}>{PROJECT_STATUS_LABELS[project.status]}</Badge>
                      {project.managerName && (
                        <span className="flex items-center gap-1.5 text-caption text-[var(--color-text-secondary)]">
                          <Avatar name={project.managerName} src={project.managerAvatar} size="xs" />
                          {project.managerName}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-[var(--color-text-muted)]">Loyiha topilmadi</div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Top Employee + Team Load */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="!text-[16px] !font-bold">Oyning TOP xodimi</CardTitle>
            </CardHeader>
            <CardContent>
              {topEmployeeLoading ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ) : topEmployee ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar name={topEmployee.name} src={topEmployee.avatar} size="lg" />
                    <div className="min-w-0">
                      <p className="text-body font-semibold text-[var(--color-text-primary)] truncate">
                        {topEmployee.name}
                      </p>
                      <p className="text-caption text-[var(--color-text-muted)] truncate">{topEmployee.position}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-[10px] bg-[var(--color-bg-hover)] px-2 py-2 text-center">
                      <p className="text-caption text-[var(--color-text-muted)]">KPI</p>
                      <p className="text-body font-semibold text-[var(--color-text-primary)]">{topEmployee.kpiScore}%</p>
                    </div>
                    <div className="rounded-[10px] bg-[var(--color-bg-hover)] px-2 py-2 text-center">
                      <p className="text-caption text-[var(--color-text-muted)]">Bajarildi</p>
                      <p className="text-body font-semibold text-[var(--color-text-primary)]">{topEmployee.completedTasks}</p>
                    </div>
                    <div className="rounded-[10px] bg-[var(--color-bg-hover)] px-2 py-2 text-center">
                      <p className="text-caption text-[var(--color-text-muted)]">Loyihalar</p>
                      <p className="text-body font-semibold text-[var(--color-text-primary)]">{topEmployee.projectCount}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-[var(--color-text-muted)] py-4">Ma'lumot yo'q</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="!text-[16px] !font-bold">Jamoa yuklamasi</CardTitle>
              <p className="mt-1 text-caption text-[var(--color-text-secondary)]">
                Faol tasklar asosiy vazn bilan, kechikkan tasklar bosim sifatida, loyiha soni esa yengil ta'sir bilan hisoblanadi.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamLoadLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))
              ) : teamLoad && teamLoad.length > 0 ? (
                teamLoad.map((member) => (
                  <div key={member.employeeId}>
                    <div className="flex items-center justify-between text-caption mb-1.5">
                      <span className="text-[var(--color-text-primary)] font-medium">{member.name}</span>
                      <span className="font-medium text-[var(--color-text-primary)]">{member.load}%</span>
                    </div>
                    <Progress value={member.load} max={100} variant={member.load > 75 ? 'warning' : 'accent'} size="sm" />
                    <p className="mt-1 text-caption text-[var(--color-text-muted)]">
                      Faol: {member.activeTasks} &middot; Kechikkan: {member.overdueTasks} &middot; Loyihalar: {member.projectCount}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-[var(--color-text-muted)] py-4">Ma'lumot yo'q</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Motivation Score - a gradient "thermometer" bar with a needle marker, ported from
          the reference CRM's MotivationGauge (not a filled progress bar - the gradient is
          static red->amber->green and the needle marks the actual position on it). */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-black text-[var(--color-text-primary)]">Motivatsion ko'rsatkich</h3>
            <p className="mt-2 text-body leading-relaxed text-[var(--color-text-muted)]">
              Agentlik va jamoa holati umumiy task bajarilishi, ortda qolgan deadline va tasdiq holatlariga qarab hisoblanadi.
            </p>
          </div>
          {!motivationLoading && (
            <span
              className="text-[32px] font-black leading-none flex-shrink-0"
              style={{ color: motivationColor(motivationScore ?? 0) }}
            >
              {motivationScore ?? 0}%
            </span>
          )}
        </div>

        {motivationLoading ? (
          <Skeleton className="mt-[22px] h-[22px] w-full rounded-full" />
        ) : (
          <div className="relative mt-[22px] pt-[18px]">
            <div
              className="h-[22px] rounded-full border border-[var(--color-bg-border)]"
              style={{ background: 'linear-gradient(90deg, var(--color-error) 0%, var(--color-warning) 45%, var(--color-success) 100%)' }}
            />
            <div className="mt-2 grid grid-cols-5 text-[11px] font-bold text-[var(--color-text-muted)]">
              {MOTIVATION_STAGES.map((stage) => (
                <span key={stage}>{stage}</span>
              ))}
            </div>
            <div
              className="absolute top-0 flex justify-center"
              style={{ left: `${motivationScore ?? 0}%`, transform: 'translateX(-50%)', width: 18, height: 50 }}
            >
              <div className="w-1.5 h-full rounded-full bg-[var(--color-text-primary)]" />
            </div>
          </div>
        )}

        {!motivationLoading && (
          <p className="mt-3.5 font-extrabold text-[var(--color-text-primary)]">
            {motivationLabel(motivationScore ?? 0)}
          </p>
        )}
      </Card>
    </div>
  );
}
