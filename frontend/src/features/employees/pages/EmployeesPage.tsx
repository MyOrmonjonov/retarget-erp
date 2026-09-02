'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { EmployeeForm, type EmployeeFormData } from '../components/EmployeeForm';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';
import { ROLE_BADGE_STYLE, ROLE_LABELS, type Employee } from '@/shared/types';
import { useEmployees, useAvailableMembers, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '../hooks/useEmployees';
import { employeesApi } from '../api/employeesApi';
import { useUser } from '@/features/auth/store/authStore';

type EmployeeWithUserId = Employee & { userId: string };

function workloadVariant(pct: number): 'success' | 'warning' | 'error' {
  if (pct >= 75) return 'error';
  if (pct >= 40) return 'warning';
  return 'success';
}

/** Inline-editable number, used for CEO-only base salary / KPI-base cells. */
function InlineNumberField({ value, onSave, suffix }: { value: number; onSave: (next: number) => void; suffix?: string }) {
  const [draft, setDraft] = useState(String(value));
  const commit = () => {
    const parsed = Number(draft);
    if (Number.isNaN(parsed) || parsed < 0 || parsed === value) {
      setDraft(String(value));
      return;
    }
    onSave(parsed);
  };
  return (
    <span className="inline-flex items-center gap-1">
      <Input
        type="number"
        min={0}
        value={draft}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className="w-24 h-7 text-caption"
      />
      {suffix && <span className="text-caption text-[var(--color-text-muted)]">{suffix}</span>}
    </span>
  );
}

export function EmployeesPage() {
  const { data: employees = [], isLoading } = useEmployees();
  const user = useUser();
  const isCeo = user?.role === 'CEO';
  const queryClient = useQueryClient();

  const salaryMutation = useMutation({
    mutationFn: ({ id, baseSalary }: { id: string; baseSalary: number }) => employeesApi.updateSalary(id, baseSalary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Maosh yangilandi');
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'Maoshni yangilashda xatolik yuz berdi'),
  });

  const kpiBaseMutation = useMutation({
    mutationFn: ({ id, kpiBase }: { id: string; kpiBase: number }) => employeesApi.updateKpiBase(id, kpiBase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('KPI bazasi yangilandi');
    },
    onError: (error: { message?: string }) => toast.error(error.message || 'KPI bazasini yangilashda xatolik yuz berdi'),
  });

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeWithUserId | null>(null);
  const { data: availableMembers = [] } = useAvailableMembers(isFormOpen && !editingEmployee);

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  // Delete confirmation states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeWithUserId | null>(null);

  const handleOpenCreateForm = useCallback(() => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditForm = useCallback((employee: EmployeeWithUserId) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  }, []);

  const handleFormSubmit = useCallback(async (data: EmployeeFormData) => {
    const input = {
      orgRole: data.role,
      department: data.department || undefined,
      position: data.position || undefined,
      hireDate: data.hireDate || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
    };
    if (editingEmployee) {
      await updateEmployee.mutateAsync({ id: String(editingEmployee.id), input });
    } else {
      if (!data.userId) {
        toast.error("Iltimos, ish maydoni a'zosini tanlang");
        return;
      }
      await createEmployee.mutateAsync({ userId: Number(data.userId), input });
    }
    handleCloseForm();
  }, [editingEmployee, createEmployee, updateEmployee, handleCloseForm]);

  const handleOpenDelete = useCallback((employee: EmployeeWithUserId) => {
    setDeletingEmployee(employee);
    setIsDeleteOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setIsDeleteOpen(false);
    setDeletingEmployee(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingEmployee) return;
    await deleteEmployee.mutateAsync(String(deletingEmployee.id));
    handleCloseDelete();
  }, [deletingEmployee, deleteEmployee, handleCloseDelete]);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-end">
        <Button variant="primary" onClick={handleOpenCreateForm}>
          <Plus className="h-4 w-4" />
          Xodim qo'shish
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(employees as EmployeeWithUserId[]).map((emp) => (
            <Card key={emp.id} className="p-5 relative group">
              <div className="absolute top-3 right-3 hidden group-hover:flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEditForm(emp)} aria-label="Tahrirlash">
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenDelete(emp)} aria-label="O'chirish">
                  <Trash2 className="h-3.5 w-3.5 text-[var(--color-error)]" />
                </Button>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={emp.fullName} src={emp.avatar} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--color-text-primary)] truncate">{emp.fullName}</p>
                  <p className="text-caption text-[var(--color-text-secondary)] truncate">
                    {emp.position || 'Lavozim ko\'rsatilmagan'} · {emp.department || 'Bo\'lim ko\'rsatilmagan'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge style={ROLE_BADGE_STYLE[emp.role]} size="sm">
                  {ROLE_LABELS[emp.role]}
                </Badge>
                <Badge variant={workloadVariant(emp.workload)} size="sm">
                  Yuklanish: {emp.workload}%
                </Badge>
              </div>
              <div className="flex items-center gap-5 mt-4">
                <span className="text-caption text-[var(--color-text-secondary)]">
                  KPI: <span className="text-[var(--color-text-primary)] font-medium">{emp.kpiScore}%</span>
                </span>
                <span className="text-caption text-[var(--color-text-secondary)]">
                  Loyihalar: <span className="text-[var(--color-text-primary)] font-medium">{emp.projectCount}</span>
                </span>
              </div>
              {isCeo && (
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--color-bg-border)]">
                  <div>
                    <p className="text-caption text-[var(--color-text-muted)] mb-1">Maosh</p>
                    <InlineNumberField
                      value={emp.baseSalary}
                      onSave={(next) => salaryMutation.mutate({ id: String(emp.id), baseSalary: next })}
                      suffix="so'm"
                    />
                  </div>
                  <div>
                    <p className="text-caption text-[var(--color-text-muted)] mb-1">KPI bazasi</p>
                    <InlineNumberField
                      value={emp.kpiBase}
                      onSave={(next) => kpiBaseMutation.mutate({ id: String(emp.id), kpiBase: next })}
                      suffix="%"
                    />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {!isLoading && employees.length === 0 && (
        <Card variant="default" className="py-12 text-center">
          <p className="text-[var(--color-text-secondary)]">Hodimlar topilmadi</p>
        </Card>
      )}

      {/* Create/Edit Form Modal */}
      <EmployeeForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingEmployee}
        availableMembers={availableMembers}
        isLoading={createEmployee.isPending || updateEmployee.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteEmployee.isPending}
        title="Xodimni o'chirish"
        description="Bu xodim doimiy o'chiriladi. Davom etishni xohlaysizmi?"
        itemName={deletingEmployee?.fullName}
      />
    </div>
  );
}
