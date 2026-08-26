'use client';

import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';

interface TimelineStep {
  id: string;
  order: number;
  name: string;
  description: string;
  team: string;
}

const steps: TimelineStep[] = [
  { id: '1', order: 1, name: 'Mijoz keladi', description: 'Sales manager bilan birinchi uchrashuv va ehtiyojlar aniqlanadi', team: 'Sales' },
  { id: '2', order: 2, name: 'Brief olinadi', description: 'Maqsad, target auditoriya, byudjet va KPI aniqlanadi', team: 'Project Management' },
  { id: '3', order: 3, name: 'Strategiya yoziladi', description: 'Kontent strategiyasi, kanal tanlash va maqsadlar belgilanadi', team: 'Project Management' },
  { id: '4', order: 4, name: 'Media plan yaratiladi', description: 'Oylik kontent jadvali, byudjet taqsimoti tuziladi', team: 'SMM' },
  { id: '5', order: 5, name: 'Kontent reja tuziladi', description: 'Har bir post/reels/story alohida rejalashtiriladi', team: 'SMM' },
  { id: '6', order: 6, name: 'Materiallar tayyorlanadi', description: 'Kontent ishlab chiqiladi va tekshiruvga yuboriladi', team: 'SMM + Media' },
  { id: '7', order: 7, name: 'Tasdiqlanadi', description: 'Manager yoki CEO kontent rejasini tasdiqlaydi yoki rad etadi', team: 'Project Management' },
  { id: '8', order: 8, name: "Syomka o'tkaziladi", description: 'Video va foto materiallar professional tarzda suratga olinadi', team: 'Media' },
  { id: '9', order: 9, name: 'Reklama ishga tushadi', description: 'Targeting reklamalari sozlanadi va faollashtiriladi', team: 'Target' },
  { id: '10', order: 10, name: 'Hisobot qilinadi', description: 'KPI, ROI va natijalar CEO ga taqdimot qilinadi', team: 'Project Management' },
];

export function MappingPage() {
  return (
    <div className="space-y-6 animate-in">
      <Card>
        <div className="p-6">
          <p className="text-caption text-[var(--color-text-muted)] mb-6">Loyiha jarayoni — yagona timeline</p>
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-px bg-[var(--color-bg-border)]" aria-hidden="true" />
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.id} className="relative flex items-center gap-4 pl-0">
                  <span className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-bg-surface)] text-[var(--color-accent)] text-caption font-bold flex items-center justify-center">
                    {step.order}
                  </span>
                  <div className="flex-1 min-w-0 flex items-start justify-between gap-4 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-bg-border)] px-4 py-3">
                    <div>
                      <p className="text-body font-semibold text-[var(--color-text-primary)]">{step.name}</p>
                      <p className="text-caption text-[var(--color-text-muted)] mt-0.5">{step.description}</p>
                    </div>
                    <Badge variant="accent" className="flex-shrink-0">{step.team}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
