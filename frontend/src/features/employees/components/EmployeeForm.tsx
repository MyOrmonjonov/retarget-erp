'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import { Avatar } from '@/shared/ui/avatar';
import type { Employee, EmployeeStatus, UserRole } from '@/shared/types';
import type { WorkspaceMember } from '../api/employeesApi';
import { DESIGN_DEPT_KEYWORDS, EDITING_DEPT_KEYWORDS } from '@/shared/constants/departmentKeywords';

const DEPT_BOARD_KEYWORDS: { boardLabel: string; keywords: string[] }[] = [
  { boardLabel: "Dizayn bo'limi", keywords: DESIGN_DEPT_KEYWORDS },
  { boardLabel: "Montaj bo'limi", keywords: EDITING_DEPT_KEYWORDS },
];

/** The department boards (useDeptTasks) only show a task if the assignee's free-text
 * `department` matches one of their keywords - so an unmatched department silently hides that
 * person's tasks from every such board. Surface that here instead of letting it be a mystery. */
function matchingBoards(department: string): string[] {
  const normalized = department.trim().toLowerCase();
  if (!normalized) return [];
  return DEPT_BOARD_KEYWORDS.filter((b) => b.keywords.some((k) => normalized.includes(k))).map((b) => b.boardLabel);
}

const employeeSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email("Noto'g'ri email formati").optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.enum(['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM', 'OPERATOR']),
  department: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  initialData?: (Employee & { userId: string }) | null;
  availableMembers: WorkspaceMember[];
  isLoading?: boolean;
}

export function EmployeeForm({ isOpen, onClose, onSubmit, initialData, availableMembers, isLoading }: EmployeeFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      userId: '',
      email: '',
      phone: '',
      role: 'HODIM' as UserRole,
      department: '',
      position: '',
      hireDate: '',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      reset({
        userId: initialData.userId,
        email: initialData.email || '',
        phone: initialData.phone || '',
        role: initialData.role,
        department: initialData.department,
        position: initialData.position,
        hireDate: initialData.hireDate?.split('T')[0] || '',
      });
    } else {
      reset({
        userId: '',
        email: '',
        phone: '',
        role: 'HODIM' as UserRole,
        department: '',
        position: '',
        hireDate: '',
      });
    }
  }, [isOpen, initialData, reset]);

  const roleOptions = [
    { value: 'CEO', label: 'CEO' },
    { value: 'MENEJER', label: 'Menejer' },
    { value: 'BOSHQARUVCHI', label: 'Boshqaruvchi' },
    { value: 'MONTAJOR', label: 'Montajor' },
    { value: 'HODIM', label: 'Hodim' },
    { value: 'OPERATOR', label: 'Operator' },
  ];

  const statusLabel: Record<EmployeeStatus, string> = {
    ACTIVE: 'Faol',
    ON_LEAVE: 'Dam olishda',
    TERMINATED: "Ishdan bo'shatilgan",
    PROBATION: 'Sinov muddatida',
  };

  const memberOptions = availableMembers.map((m) => ({
    value: String(m.id),
    label: [m.firstName, m.lastName].filter(Boolean).join(' ') + (m.username ? ` (@${m.username})` : ''),
  }));

  const departmentValue = watch('department') ?? '';
  const matchedBoards = matchingBoards(departmentValue);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Xodimni tahrirlash' : "Yangi xodim qo'shish"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6">
          {isEdit ? (
            <div className="flex items-center gap-3 rounded-[10px] bg-[var(--color-bg-hover)] px-4 py-3">
              <Avatar name={initialData!.fullName} src={initialData!.avatar} size="md" />
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">{initialData!.fullName}</p>
                <p className="text-caption text-[var(--color-text-muted)]">{statusLabel[initialData!.status]}</p>
              </div>
            </div>
          ) : (
            <Controller
              control={control}
              name="userId"
              render={({ field }) => (
                <Select
                  {...field}
                  label="Ish maydoni a'zosi"
                  placeholder={memberOptions.length ? "A'zoni tanlang" : "Barcha a'zolar allaqachon xodim sifatida qo'shilgan"}
                  options={memberOptions}
                  error={errors.userId?.message}
                  disabled={memberOptions.length === 0}
                />
              )}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register('email')}
              type="email"
              label="Email (ixtiyoriy)"
              placeholder="Mas: aziz@retarget.uz"
              error={errors.email?.message}
            />
            <Input
              {...register('phone')}
              label="Telefon (ixtiyoriy)"
              placeholder="+998 XX XXX XX XX"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              {...register('role')}
              label="Rol"
              options={roleOptions}
              error={errors.role?.message}
            />
            <div>
              <Input
                {...register('department')}
                label="Bo'lim"
                placeholder="Mas: SMM bo'limi"
              />
              {departmentValue.trim() && (
                matchedBoards.length > 0 ? (
                  <p className="mt-1 text-caption text-[var(--color-text-muted)]">
                    Vazifalari ko'rinadi: {matchedBoards.join(', ')}
                  </p>
                ) : (
                  <p className="mt-1 text-caption text-[var(--color-warning)]">
                    Bu nom hech qaysi bo'lim doskasiga (Dizayn/Montaj) mos kelmaydi - xodimning vazifalari faqat umumiy Vazifalar sahifasida ko'rinadi
                  </p>
                )
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register('position')}
              label="Lavozim"
              placeholder="Mas: Art Director"
            />
            <Input
              {...register('hireDate')}
              type="date"
              label="Ishga qabul sanasi"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Bekor qilish
            </Button>
            <Button type="submit" variant="primary" loading={isLoading} disabled={!isEdit && memberOptions.length === 0}>
              {isEdit ? 'Saqlash' : "Qo'shish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
