'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import type { Deal } from '@/shared/types';

const dealSchema = z.object({
  title: z.string().min(2, "Nomi kamida 2 ta belgi bo'lishi kerak"),
  client: z.string().min(2, "Mijoz nomi kamida 2 ta belgi bo'lishi kerak"),
  value: z.number().min(0),
  probability: z.number().min(0).max(100),
  expectedCloseDate: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Noto'g'ri email formati").optional().or(z.literal('')),
  description: z.string().optional(),
});

export type DealFormData = z.infer<typeof dealSchema>;

interface DealFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DealFormData) => Promise<void>;
  onDelete?: () => void;
  initialData?: Deal | null;
  isLoading?: boolean;
}

export function DealForm({ isOpen, onClose, onSubmit, onDelete, initialData, isLoading }: DealFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: '', client: '', value: 0, probability: 10, expectedCloseDate: '',
      contactPerson: '', contactPhone: '', contactEmail: '', description: '',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      reset({
        title: initialData.title,
        client: initialData.client,
        value: initialData.value,
        probability: initialData.probability,
        expectedCloseDate: initialData.expectedCloseDate?.split('T')[0] || '',
        contactPerson: initialData.contactPerson || '',
        contactPhone: initialData.contactPhone || '',
        contactEmail: initialData.contactEmail || '',
        description: initialData.description || '',
      });
    } else {
      reset({ title: '', client: '', value: 0, probability: 10, expectedCloseDate: '', contactPerson: '', contactPhone: '', contactEmail: '', description: '' });
    }
  }, [isOpen, initialData, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Bitimni tahrirlash' : 'Yangi lid'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input {...register('title')} label="Bitim nomi" placeholder="Mas: GreenLeaf Cafe" error={errors.title?.message} />
            <Input {...register('client')} label="Mijoz" placeholder="Mas: GreenLeaf Cafe" error={errors.client?.message} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input {...register('value', { setValueAs: (v) => (v === '' ? 0 : Number(v)) })} type="number" label="Qiymati ($)" error={errors.value?.message} />
            <Input {...register('probability', { setValueAs: (v) => (v === '' ? 0 : Number(v)) })} type="number" min="0" max="100" label="Ehtimollik (%)" error={errors.probability?.message} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input {...register('contactPerson')} label="Aloqa shaxsi" placeholder="Mas: Umar Rahimov" />
            <Input {...register('expectedCloseDate')} type="date" label="Yopilishi kutilayotgan sana" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input {...register('contactPhone')} label="Telefon (ixtiyoriy)" placeholder="+998 XX XXX XX XX" />
            <Input {...register('contactEmail')} type="email" label="Email (ixtiyoriy)" error={errors.contactEmail?.message} />
          </div>
          <Textarea {...register('description')} label="Tavsif" rows={3} />
          <DialogFooter>
            {isEdit && onDelete && (
              <Button type="button" variant="ghost" onClick={onDelete} disabled={isLoading} className="mr-auto text-[var(--color-error)]">
                O'chirish
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Bekor qilish</Button>
            <Button type="submit" variant="primary" loading={isLoading}>{isEdit ? 'Saqlash' : 'Yaratish'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
