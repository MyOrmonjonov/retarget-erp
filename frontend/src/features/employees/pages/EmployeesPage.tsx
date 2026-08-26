'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { EmployeeForm } from '../components/EmployeeForm';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';
import { ROLE_BADGE_STYLE, ROLE_LABELS, type UserRole, type EmployeeStatus } from '@/shared/types';

interface EmployeeData {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
  status: EmployeeStatus;
  hireDate: string;
  kpiScore: number;
  projectCount: number;
  avatar?: string;
}

const mockEmployees: EmployeeData[] = [
  { id: '1', fullName: 'Sardor Aliyev', email: 'sardor@retarget.uz', role: 'CEO', department: 'Boshqaruv', position: 'CEO', status: 'ACTIVE', hireDate: '2022-01-10', kpiScore: 95, projectCount: 8, avatar: undefined },
  { id: '2', fullName: 'Malika Yusupova', email: 'malika@retarget.uz', role: 'MENEJER', department: 'Project Management', position: 'Menejer', status: 'ACTIVE', hireDate: '2022-05-15', kpiScore: 92, projectCount: 6, avatar: undefined },
  { id: '3', fullName: 'Aziz Karimov', email: 'aziz@retarget.uz', role: 'BOSHQARUVCHI', department: 'Boshqaruv', position: 'Boshqaruvchi', status: 'ACTIVE', hireDate: '2022-08-01', kpiScore: 84, projectCount: 5, avatar: undefined },
  { id: '4', fullName: 'Bekzod Tursunov', email: 'bekzod@retarget.uz', role: 'MONTAJOR', department: "Media bo'limi", position: 'Montajor', status: 'ACTIVE', hireDate: '2023-02-20', kpiScore: 78, projectCount: 3, avatar: undefined },
  { id: '5', fullName: 'Nodira Rashidova', email: 'nodira@retarget.uz', role: 'HODIM', department: "SMM bo'limi", position: 'Xodim', status: 'ACTIVE', hireDate: '2023-04-10', kpiScore: 88, projectCount: 4, avatar: undefined },
  { id: '6', fullName: 'Jasur Nazarov', email: 'jasur@retarget.uz', role: 'OPERATOR', department: "Media bo'limi", position: 'Operator', status: 'ACTIVE', hireDate: '2023-09-01', kpiScore: 70, projectCount: 2, avatar: undefined },
];

export function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeData[]>(mockEmployees);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeData | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Delete confirmation states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<EmployeeData | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleOpenCreateForm = useCallback(() => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditForm = useCallback((employee: EmployeeData) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  }, []);

  const handleFormSubmit = useCallback(async (data: EmployeeFormData) => {
    setIsFormLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const kpiScore = data.kpiScore ? Number(data.kpiScore) : 0;

    if (editingEmployee) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === editingEmployee.id
            ? { ...e, ...data, kpiScore, status: data.status as EmployeeData['status'] }
            : e
        )
      );
    } else {
      const newEmployee: EmployeeData = {
        id: String(Date.now()),
        ...data,
        kpiScore,
        projectCount: 0,
        status: data.status as EmployeeData['status'],
      };
      setEmployees((prev) => [newEmployee, ...prev]);
    }
    handleCloseForm();
    setIsFormLoading(false);
  }, [editingEmployee, handleCloseForm]);

  const handleOpenDelete = useCallback((employee: EmployeeData) => {
    setDeletingEmployee(employee);
    setIsDeleteOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setIsDeleteOpen(false);
    setDeletingEmployee(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingEmployee) return;
    setIsDeleteLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setEmployees((prev) => prev.filter((e) => e.id !== deletingEmployee.id));
    handleCloseDelete();
    setIsDeleteLoading(false);
  }, [deletingEmployee, handleCloseDelete]);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-end">
        <Button variant="primary" onClick={handleOpenCreateForm}>
          <Plus className="h-4 w-4" />
          Xodim qo'shish
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
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
                  {emp.position} · {emp.department}
                </p>
              </div>
            </div>
            <Badge style={ROLE_BADGE_STYLE[emp.role]} size="sm">
              {ROLE_LABELS[emp.role]}
            </Badge>
            <div className="flex items-center gap-5 mt-4">
              <span className="text-caption text-[var(--color-text-secondary)]">
                KPI: <span className="text-[var(--color-text-primary)] font-medium">{emp.kpiScore}%</span>
              </span>
              <span className="text-caption text-[var(--color-text-secondary)]">
                Loyihalar: <span className="text-[var(--color-text-primary)] font-medium">{emp.projectCount}</span>
              </span>
            </div>
          </Card>
        ))}
      </div>

      {employees.length === 0 && (
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
        isLoading={isFormLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleteLoading}
        title="Xodimni o'chirish"
        description="Bu xodim doimiy o'chiriladi. Davom etishni xohlaysizmi?"
        itemName={deletingEmployee?.fullName}
      />
    </div>
  );
}

// Import type for the form data
import type { EmployeeFormData } from '../components/EmployeeForm';