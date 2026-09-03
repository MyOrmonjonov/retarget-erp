'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { Map } from 'lucide-react';
import { mappingApi } from '../api/mappingApi';

export function MappingPage() {
  const { data: flows = [], isLoading } = useQuery({
    queryKey: ['mapping-flows'],
    queryFn: mappingApi.list,
  });

  const flow = flows.find((f) => f.isActive) ?? flows[0];
  const steps = [...(flow?.steps ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6 animate-in">
      <Card>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : !flow ? (
            <EmptyState icon={Map} title="Jarayon sxemasi topilmadi" />
          ) : (
            <>
              <p className="text-caption text-[var(--color-text-muted)] mb-6">{flow.name}</p>
              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-px bg-[var(--color-bg-border)]" aria-hidden="true" />
                <div className="space-y-6">
                  {steps.map((step, i) => (
                    <div key={step.id} className="relative flex items-center gap-4 pl-0">
                      <span className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-bg-surface)] text-[var(--color-accent)] text-caption font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0 flex items-start justify-between gap-4 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-bg-border)] px-4 py-3">
                        <div>
                          <p className="text-body font-semibold text-[var(--color-text-primary)]">{step.name}</p>
                          {step.description && <p className="text-caption text-[var(--color-text-muted)] mt-0.5">{step.description}</p>}
                        </div>
                        {step.department && <Badge variant="accent" className="flex-shrink-0">{step.department}</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
