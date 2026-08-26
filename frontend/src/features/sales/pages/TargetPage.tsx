'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Plus } from 'lucide-react';

interface AdTask {
  id: string;
  title: string;
  project: string;
  dueDate: string;
  progress: number;
}

const TODAY = new Date(2026, 7, 25);

const initialTasks: AdTask[] = [
  { id: '1', title: 'Coffee Lab — Instagram Ads sozlash', project: 'Instagram Rebrand', dueDate: '2026-08-25', progress: 90 },
  { id: '2', title: 'UrbanFit — Facebook pixel integratsiya', project: 'Winter Campaign', dueDate: '2026-08-22', progress: 40 },
  { id: '3', title: 'NovaTech — YouTube preroll sozlash', project: 'Product Launch', dueDate: '2026-08-30', progress: 100 },
  { id: '4', title: 'MegaGroup — Retargeting auditoriya', project: 'Corporate Rebrand', dueDate: '2026-08-18', progress: 15 },
  { id: '5', title: 'Trendy Wear — TikTok Ads test', project: 'Spring Collection', dueDate: '2026-09-02', progress: 60 },
  { id: '6', title: 'Coffee Lab — Budjet optimallashtirish', project: 'Instagram Rebrand', dueDate: '2026-09-05', progress: 25 },
];

function formatDueDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' }).replace('.', '');
}

function progressVariant(pct: number): 'success' | 'accent' | 'warning' {
  if (pct >= 80) return 'success';
  if (pct >= 40) return 'accent';
  return 'warning';
}

export function TargetPage() {
  const [tasks] = useState<AdTask[]>(initialTasks);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-end">
        <Button variant="primary">
          <Plus className="h-4 w-4" />
          Yangi task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reklama tasklari</CardTitle>
          <p className="mt-1 text-caption text-[var(--color-text-secondary)]">Muddat va bajarilish % bo'yicha</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {tasks.map((task) => {
            const isOverdue = new Date(task.dueDate) < TODAY && task.progress < 100;
            return (
              <div key={task.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-body font-medium text-[var(--color-text-primary)] truncate">{task.title}</p>
                  <p className="text-caption text-[var(--color-text-muted)] truncate">{task.project}</p>
                </div>
                <Badge variant={isOverdue ? 'error' : 'default'} className="flex-shrink-0">
                  {formatDueDate(task.dueDate)}
                </Badge>
                <div className="hidden sm:flex items-center gap-2 w-40 flex-shrink-0">
                  <Progress value={task.progress} max={100} variant={progressVariant(task.progress)} size="sm" className="flex-1" />
                  <span className="w-10 text-right text-caption text-[var(--color-text-secondary)]">{task.progress}%</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
