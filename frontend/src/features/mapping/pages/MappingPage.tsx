'use client';

import { useState } from 'react';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';
import { Map, Plus, Pencil } from 'lucide-react';
import { MappingFlowForm, type MappingFlowFormData } from '../components/MappingFlowForm';
import { useMappingFlows, useCreateMappingFlow, useUpdateMappingFlow, useDeleteMappingFlow } from '../hooks/useMapping';

export function MappingPage() {
  const { data: flows = [], isLoading } = useMappingFlows();
  const createFlow = useCreateMappingFlow();
  const updateFlow = useUpdateMappingFlow();
  const deleteFlow = useDeleteMappingFlow();

  const flow = flows.find((f) => f.isActive) ?? flows[0] ?? null;
  const steps = [...(flow?.steps ?? [])].sort((a, b) => a.order - b.order);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleFormSubmit = async (data: MappingFlowFormData) => {
    if (flow) {
      await updateFlow.mutateAsync({ id: String(flow.id), data });
    } else {
      await createFlow.mutateAsync(data);
    }
    setIsFormOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!flow) return;
    await deleteFlow.mutateAsync(String(flow.id));
    setIsDeleteOpen(false);
  };

  return (
    <div className="space-y-6 animate-in">
      <Card>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : !flow ? (
            <EmptyState
              icon={Map}
              title="Jarayon sxemasi hali yaratilmagan"
              description="Loyiha jarayoningizni boshidan oxirigacha bosqichma-bosqich tuzing."
              action={
                <Button variant="primary" onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Sxema yaratish
                </Button>
              }
            />
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 mb-6">
                <div>
                  <p className="text-h4 font-bold text-[var(--color-text-primary)]">Workflow</p>
                  <p className="text-caption text-[var(--color-text-muted)] mt-0.5">
                    {flow.description || flow.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  aria-label="Tahrirlash"
                  className="flex-shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-px bg-[var(--color-bg-border)]" aria-hidden="true" />
                <div className="space-y-6">
                  {steps.map((step, i) => (
                    <div key={step.id} className="relative flex items-start gap-4">
                      <span className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-accent)] text-white text-caption font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-body font-semibold text-[var(--color-text-primary)]">{step.name}</p>
                          {step.department && (
                            <Badge variant="accent" size="sm">{step.department}</Badge>
                          )}
                        </div>
                        {step.description && <p className="text-caption text-[var(--color-text-muted)] mt-0.5">{step.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      <MappingFlowForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        onDelete={flow ? () => setIsDeleteOpen(true) : undefined}
        initialData={flow}
        isLoading={createFlow.isPending || updateFlow.isPending}
      />

      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteFlow.isPending}
        title="Jarayon sxemasini o'chirish"
        description="Bu sxema doimiy o'chiriladi. Davom etishni xohlaysizmi?"
        itemName={flow?.name}
      />
    </div>
  );
}
