'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import type { Project, ProjectStatus } from '@/shared/types';

const projectSchema = z.object({
  name: z.string().min(2, 'Nomi kamida 2 ta belgi bo\'lishi kerak'),
  client: z.string().min(2, 'Mijoz nomi kamida 2 ta belgi bo\'lishi kerak'),
  type: z.string().min(1, 'Turini tanlang'),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
  deadline: z.string().min(1, 'Muddatni kiriting'),
  startDate: z.string().optional(),
  budget: z.number().min(0).optional().or(z.string().refine(val => val === '' || !isNaN(Number(val)), 'Noto\'g\'ri format')),
  description: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onDelete?: () => void;
  initialData?: Project | null;
  isLoading?: boolean;
}

export function ProjectForm({ isOpen, onClose, onSubmit, onDelete, initialData, isLoading }: ProjectFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      client: '',
      type: '',
      status: 'PLANNING' as ProjectStatus,
      deadline: '',
      startDate: '',
      budget: '',
      description: '',
    },
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          client: initialData.client,
          type: initialData.type,
          status: initialData.status,
          deadline: initialData.deadline.split('T')[0],
          startDate: initialData.startDate?.split('T')[0] || '',
          budget: initialData.budget?.toString() || '',
          description: initialData.description || '',
        });
      } else {
        reset({
          name: '',
          client: '',
          type: '',
          status: 'PLANNING' as ProjectStatus,
          deadline: '',
          startDate: '',
          budget: '',
          description: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    await onSubmit(data);
  };

  const projectTypes = [
    { value: 'Branding', label: 'Branding' },
    { value: 'Development', label: 'Development' },
    { value: 'Web', label: 'Web' },
    { value: 'Video', label: 'Video' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Other', label: 'Boshqa' },
  ];

  const statusOptions = [
    { value: 'PLANNING', label: 'Rejalashtirish' },
    { value: 'ACTIVE', label: 'Faol' },
    { value: 'ON_HOLD', label: 'Kutilmoqda' },
    { value: 'COMPLETED', label: 'Yakunlangan' },
    { value: 'CANCELLED', label: 'Bekor qilingan' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Loyihani tahrirlash' : 'Yangi loyiha yaratish'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register('name')}
              label="Loyiha nomi"
              placeholder="Mas: FitTrack Mobile App"
              error={errors.name?.message}
            />
            <Input
              {...register('client')}
              label="Mijoz"
              placeholder="Mas: FitTech Inc"
              error={errors.client?.message}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              {...register('type')}
              label="Loyiha turi"
              placeholder="Turini tanlang"
              options={projectTypes}
              error={errors.type?.message}
            />
            <Select
              {...register('status')}
              label="Status"
              options={statusOptions}
              error={errors.status?.message}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register('deadline')}
              type="date"
              label="Tugash muddati"
              error={errors.deadline?.message}
            />
            <Input
              {...register('startDate')}
              type="date"
              label="Boshlanish sanasi"
            />
          </div>
          <Input
            {...register('budget', { valueAsNumber: true })}
            type="number"
            label="Byudjet (so'm)"
            placeholder="Mas: 50000000"
            error={errors.budget?.message}
          />
          <Textarea
            {...register('description')}
            label="Tavsif"
            placeholder="Loyiha haqida qisqacha ma'lumot..."
            rows={3}
          />
          <DialogFooter>
            {isEdit && onDelete && (
              <Button type="button" variant="ghost" onClick={onDelete} disabled={isLoading} className="mr-auto text-[var(--color-error)]">
                O'chirish
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Bekor qilish
            </Button>
            <Button type="submit" variant="primary" loading={isLoading}>
              {isEdit ? 'Saqlash' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}