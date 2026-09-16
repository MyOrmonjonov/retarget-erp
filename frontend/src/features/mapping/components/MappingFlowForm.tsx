'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Select } from '@/shared/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { MappingFlow, UserRole } from '@/shared/types';
import { ROLE_LABELS } from '@/shared/types';

interface StepDraft {
  key: string;
  name: string;
  description: string;
  department: string;
  responsibleRole: UserRole | '';
  estimatedDays: string;
  dependencyKeys: string[];
}

export interface MappingFlowFormData {
  name: string;
  description: string;
  steps: {
    key: string;
    name: string;
    description: string;
    department: string;
    responsibleRole: UserRole | '';
    estimatedDays: number;
    dependencyKeys: string[];
  }[];
}

interface MappingFlowFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MappingFlowFormData) => Promise<void>;
  onDelete?: () => void;
  initialData?: MappingFlow | null;
  isLoading?: boolean;
}

const roleOptions = [
  { value: '', label: "Belgilanmagan" },
  ...(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => ({ value: role, label: ROLE_LABELS[role] })),
];

function makeKey() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `step-${Date.now()}-${Math.random()}`;
}

function emptyStep(): StepDraft {
  return {
    key: makeKey(),
    name: '',
    description: '',
    department: '',
    responsibleRole: '',
    estimatedDays: '1',
    dependencyKeys: [],
  };
}

export function MappingFlowForm({ isOpen, onClose, onSubmit, onDelete, initialData, isLoading }: MappingFlowFormProps) {
  const isEdit = !!initialData;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<StepDraft[]>([]);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description ?? '');
      setSteps(
        [...initialData.steps]
          .sort((a, b) => a.order - b.order)
          .map((step) => ({
            key: String(step.id),
            name: step.name,
            description: step.description ?? '',
            department: step.department ?? '',
            responsibleRole: step.responsibleRole ?? '',
            estimatedDays: String(step.estimatedDays),
            dependencyKeys: step.dependencies ?? [],
          }))
      );
    } else {
      setName('');
      setDescription('');
      setSteps([emptyStep()]);
    }
    setNameError('');
  }, [isOpen, initialData]);

  const updateStep = (key: string, patch: Partial<StepDraft>) => {
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  };

  const addStep = () => setSteps((prev) => [...prev, emptyStep()]);

  const removeStep = (key: string) =>
    setSteps((prev) =>
      prev
        .filter((s) => s.key !== key)
        .map((s) => ({ ...s, dependencyKeys: s.dependencyKeys.filter((k) => k !== key) }))
    );

  const moveStep = (index: number, direction: -1 | 1) => {
    setSteps((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const toggleDependency = (stepKey: string, depKey: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.key === stepKey
          ? {
              ...s,
              dependencyKeys: s.dependencyKeys.includes(depKey)
                ? s.dependencyKeys.filter((k) => k !== depKey)
                : [...s.dependencyKeys, depKey],
            }
          : s
      )
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError('Nomi kiritilishi shart');
      return;
    }
    const cleanedSteps = steps
      .map((s) => ({ ...s, name: s.name.trim() }))
      .filter((s) => s.name.length > 0);
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      steps: cleanedSteps.map((s) => ({
        key: s.key,
        name: s.name,
        description: s.description.trim(),
        department: s.department.trim(),
        responsibleRole: s.responsibleRole,
        estimatedDays: Number(s.estimatedDays) || 0,
        dependencyKeys: s.dependencyKeys,
      })),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Jarayon sxemasini tahrirlash' : "Yangi jarayon sxemasi"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 px-6 pb-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Sxema nomi"
              placeholder="Mas: Video loyiha jarayoni"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError('');
              }}
              error={nameError}
            />
            <Input
              label="Tavsif"
              placeholder="Ixtiyoriy"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-body font-medium text-[var(--color-text-primary)]">Bosqichlar</label>
              <Button type="button" variant="secondary" size="sm" onClick={addStep}>
                <Plus className="h-3.5 w-3.5" />
                Bosqich qo'shish
              </Button>
            </div>

            {steps.length === 0 ? (
              <p className="text-caption text-[var(--color-text-muted)]">Hali bosqich yo'q</p>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.key}
                    className="rounded-lg border border-[var(--color-bg-border)] bg-[var(--color-bg-primary)] p-3 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-7 h-7 mt-1 rounded-full border-2 border-[var(--color-accent)] text-[var(--color-accent)] text-caption font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0 space-y-2">
                        <Input
                          placeholder="Bosqich nomi"
                          value={step.name}
                          onChange={(e) => updateStep(step.key, { name: e.target.value })}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Input
                            placeholder="Bo'lim"
                            value={step.department}
                            onChange={(e) => updateStep(step.key, { department: e.target.value })}
                          />
                          <Select
                            value={step.responsibleRole}
                            options={roleOptions}
                            onChange={(e) => updateStep(step.key, { responsibleRole: e.target.value as UserRole | '' })}
                          />
                          <Input
                            type="number"
                            min={0}
                            placeholder="Kun"
                            value={step.estimatedDays}
                            onChange={(e) => updateStep(step.key, { estimatedDays: e.target.value })}
                          />
                        </div>
                        <Textarea
                          placeholder="Tavsif (ixtiyoriy)"
                          rows={2}
                          value={step.description}
                          onChange={(e) => updateStep(step.key, { description: e.target.value })}
                        />
                        {steps.length > 1 && (
                          <div>
                            <p className="text-caption text-[var(--color-text-muted)] mb-1">Bog'liq bosqichlar (avval bajarilishi shart)</p>
                            <div className="flex flex-wrap gap-1.5">
                              {steps
                                .filter((s) => s.key !== step.key)
                                .map((other) => {
                                  const active = step.dependencyKeys.includes(other.key);
                                  return (
                                    <button
                                      key={other.key}
                                      type="button"
                                      onClick={() => toggleDependency(step.key, other.key)}
                                      className={`px-2.5 py-1 rounded-full text-caption transition-colors ${
                                        active
                                          ? 'bg-[var(--color-accent)] text-white font-medium'
                                          : 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]'
                                      }`}
                                    >
                                      {other.name || "Nomsiz bosqich"}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => moveStep(index, -1)}
                          disabled={index === 0}
                          aria-label="Yuqoriga"
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(index, 1)}
                          disabled={index === steps.length - 1}
                          aria-label="Pastga"
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStep(step.key)}
                          aria-label="O'chirish"
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] mt-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          {isEdit && onDelete && (
            <Button type="button" variant="ghost" onClick={onDelete} disabled={isLoading} className="mr-auto text-[var(--color-error)]">
              O'chirish
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Bekor qilish
          </Button>
          <Button type="button" variant="primary" loading={isLoading} onClick={handleSubmit}>
            {isEdit ? 'Saqlash' : 'Yaratish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
