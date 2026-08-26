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
import type { Task } from '@/shared/types';
import { SelectOption } from '@/shared/ui/select';

const taskSchema = z.object({
  title: z.string().min(2, 'Nomi kamida 2 ta belgi bo\'lishi kerak'),
  description: z.string().optional(),
  assigneeId: z.string().min(1, 'Ijrochini tanlang'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED']),
  dueDate: z.string().min(1, 'Muddatni kiriting'),
});

export type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: Task | null;
  isLoading?: boolean;
  assignees?: SelectOption[];
}

export function TaskForm({ isOpen, onClose, onSubmit, initialData, isLoading, assignees = [] }: TaskFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      assigneeId: '',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: '',
    },
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const rawStatus = initialData.status;
        const status: TaskFormData['status'] = rawStatus === 'BACKLOG' ? 'TODO' : rawStatus;
        reset({
          title: initialData.title,
          description: initialData.description || '',
          assigneeId: initialData.assigneeId,
          priority: initialData.priority,
          status,
          dueDate: initialData.dueDate.split('T')[0],
        });
      } else {
        reset({
          title: '',
          description: '',
          assigneeId: '',
          priority: 'MEDIUM',
          status: 'TODO',
          dueDate: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: TaskFormData) => {
    await onSubmit(data);
  };

  const priorityOptions = [
    { value: 'LOW', label: 'Past' },
    { value: 'MEDIUM', label: 'O\'rta' },
    { value: 'HIGH', label: 'Yuqori' },
    { value: 'URGENT', label: 'Shoshilinch' },
  ];

  const statusOptions = [
    { value: 'TODO', label: 'Yangi' },
    { value: 'IN_PROGRESS', label: 'Jarayonda' },
    { value: 'REVIEW', label: 'Ko\'rib chiqilmoqda' },
    { value: 'DONE', label: 'Bajarildi' },
    { value: 'BLOCKED', label: 'Bloklangan' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Vazifani tahrirlash' : 'Yangi vazifa yaratish'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 px-6 pb-6">
          <Input
            {...register('title')}
            label="Vazifa nomi"
            placeholder="Mas: Logo design for Coffee House"
            error={errors.title?.message}
          />
          <Textarea
            {...register('description')}
            label="Tavsif"
            placeholder="Vazifa haqida batafsil ma'lumot..."
            rows={3}
          />
          <Select
            {...register('assigneeId')}
            label="Ijrochi"
            placeholder="Ijrochini tanlang"
            options={assignees}
            error={errors.assigneeId?.message}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              {...register('priority')}
              label="Prioritet"
              options={priorityOptions}
              error={errors.priority?.message}
            />
            <Select
              {...register('status')}
              label="Status"
              options={statusOptions}
              error={errors.status?.message}
            />
          </div>
          <Input
            {...register('dueDate')}
            type="date"
            label="Tugash muddati"
            error={errors.dueDate?.message}
          />
          <DialogFooter>
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
