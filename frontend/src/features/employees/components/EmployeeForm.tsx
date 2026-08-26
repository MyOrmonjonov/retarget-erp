'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import type { UserRole, EmployeeStatus } from '@/shared/types';

const employeeSchema = z.object({
  fullName: z.string().min(2, 'Ism kamida 2 ta belgi bo\'lishi kerak'),
  email: z.string().email('Noto\'g\'ri email formati'),
  phone: z.string().optional(),
  role: z.enum(['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM', 'OPERATOR']),
  department: z.string().min(1, 'Bo\'limni tanlang'),
  position: z.string().min(1, 'Lavozimni kiriting'),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'PROBATION']),
  hireDate: z.string().min(1, 'Ishga qabul sanasini kiriting'),
  avatar: z.string().url().optional().or(z.literal('')),
  kpiScore: z.number().min(0).max(100).optional().or(z.string().refine(val => val === '' || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), '0-100 oralig\'ida bo\'lishi kerak')),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  initialData?: EmployeeData | null;
  isLoading?: boolean;
}

interface EmployeeData {
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  department: string;
  position: string;
  status: EmployeeStatus;
  hireDate: string;
  avatar?: string;
  kpiScore?: number;
}

export function EmployeeForm({ isOpen, onClose, onSubmit, initialData, isLoading }: EmployeeFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: 'HODIM' as UserRole,
      department: '',
      position: '',
      status: 'ACTIVE' as EmployeeStatus,
      hireDate: '',
      avatar: '',
      kpiScore: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          fullName: initialData.fullName,
          email: initialData.email,
          phone: initialData.phone || '',
          role: initialData.role,
          department: initialData.department,
          position: initialData.position,
          status: initialData.status,
          hireDate: initialData.hireDate.split('T')[0],
          avatar: initialData.avatar || '',
          kpiScore: initialData.kpiScore?.toString() || '',
        });
      } else {
        reset({
          fullName: '',
          email: '',
          phone: '',
          role: 'HODIM' as UserRole,
          department: '',
          position: '',
          status: 'ACTIVE' as EmployeeStatus,
          hireDate: '',
          avatar: '',
          kpiScore: '',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: EmployeeFormData) => {
    await onSubmit(data);
  };

  const roleOptions = [
    { value: 'CEO', label: 'CEO' },
    { value: 'MENEJER', label: 'Menejer' },
    { value: 'BOSHQARUVCHI', label: 'Boshqaruvchi' },
    { value: 'MONTAJOR', label: 'Montajor' },
    { value: 'HODIM', label: 'Hodim' },
    { value: 'OPERATOR', label: 'Operator' },
  ];

  const departmentOptions = [
    { value: 'Dizayn', label: 'Dizayn' },
    { value: 'Montaj', label: 'Montaj' },
    { value: 'Shooting', label: 'Shooting' },
    { value: 'Savdo', label: 'Savdo' },
    { value: 'Boshqaruv', label: 'Boshqaruv' },
    { value: 'Maliya', label: 'Maliya' },
    { value: 'HR', label: 'HR' },
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Faol' },
    { value: 'ON_LEAVE', label: 'Dam olishda' },
    { value: 'TERMINATED', label: 'Ishdan bo\'shatilgan' },
    { value: 'PROBATION', label: 'Sinov muddatida' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register('fullName')}
              label="To'liq ism"
              placeholder="Mas: Aziz Karimov"
              error={errors.fullName?.message}
            />
            <Input
              {...register('email')}
              type="email"
              label="Email"
              placeholder="Mas: aziz@retarget.uz"
              error={errors.email?.message}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register('phone')}
              label="Telefon"
              placeholder="+998 XX XXX XX XX"
            />
            <Input
              {...register('avatar')}
              label="Avatar URL"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              {...register('role')}
              label="Rol"
              options={roleOptions}
              error={errors.role?.message}
            />
            <Select
              {...register('department')}
              label="Bo'lim"
              placeholder="Bo'limni tanlang"
              options={departmentOptions}
              error={errors.department?.message}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register('position')}
              label="Lavozim"
              placeholder="Mas: Art Director"
              error={errors.position?.message}
            />
            <Select
              {...register('status')}
              label="Holati"
              options={statusOptions}
              error={errors.status?.message}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register('hireDate')}
              type="date"
              label="Ishga qabul sanasi"
              error={errors.hireDate?.message}
            />
            <Input
              {...register('kpiScore', { valueAsNumber: true })}
              type="number"
              label="KPI ball (%)"
              placeholder="Mas: 85"
              min="0"
              max="100"
              error={errors.kpiScore?.message}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Bekor qilish
            </Button>
            <Button type="submit" variant="primary" loading={isLoading}>
              {isEdit ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}