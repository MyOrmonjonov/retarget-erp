'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { FilterPills } from '@/shared/components/FilterPills';
import { Plus, Search } from 'lucide-react';
import type { Project } from '@/shared/types';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/shared/types';
import { ProjectForm } from '../components/ProjectForm';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';

const mockProjects: Project[] = [
  { id: '1', name: 'Instagram Rebrand', client: 'Coffee Lab', type: 'SMM', status: 'ACTIVE', progress: 82, managerId: '1', managerName: 'Malika Y.', deadline: '2026-08-28', createdAt: '', updatedAt: '' },
  { id: '2', name: 'Winter Campaign', client: 'UrbanFit', type: 'Reklama', status: 'PLANNING', progress: 20, managerId: '2', managerName: 'Aziz K.', deadline: '2026-09-05', createdAt: '', updatedAt: '' },
  { id: '3', name: 'Product Launch Video', client: 'NovaTech', type: 'Video', status: 'COMPLETED', progress: 100, managerId: '3', managerName: 'Bekzod T.', deadline: '2026-07-15', createdAt: '', updatedAt: '' },
  { id: '4', name: 'Corporate Rebrand', client: 'MegaGroup', type: 'Branding', status: 'CANCELLED', progress: 15, managerId: '1', managerName: 'Malika Y.', deadline: '2026-09-10', createdAt: '', updatedAt: '' },
  { id: '5', name: 'Spring Collection', client: 'Trendy Wear', type: 'Foto', status: 'ON_HOLD', progress: 80, managerId: '2', managerName: 'Aziz K.', deadline: '2026-09-10', createdAt: '', updatedAt: '' },
];

export function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Delete confirmation states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreateForm = useCallback(() => {
    setEditingProject(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditForm = useCallback((project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingProject(null);
  }, []);

  const handleFormSubmit = useCallback(async (data: ProjectFormData) => {
    setIsFormLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const budgetNumber = data.budget ? Number(data.budget) : undefined;

    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id ? { ...p, ...data, budget: budgetNumber, updatedAt: new Date().toISOString() } : p
        )
      );
    } else {
      const newProject: Project = {
        id: String(Date.now()),
        ...data,
        budget: budgetNumber,
        progress: 0,
        managerId: '1',
        managerName: 'Siz',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects((prev) => [newProject, ...prev]);
    }
    handleCloseForm();
    setIsFormLoading(false);
  }, [editingProject, handleCloseForm]);

  const handleOpenDelete = useCallback((project: Project) => {
    setDeletingProject(project);
    setIsDeleteOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setIsDeleteOpen(false);
    setDeletingProject(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingProject) return;
    setIsDeleteLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
    handleCloseDelete();
    setIsDeleteLoading(false);
  }, [deletingProject, handleCloseDelete]);

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button variant="primary" onClick={handleOpenCreateForm}>
          <Plus className="h-4 w-4" />
          Yangi loyiha
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            placeholder="Loyiha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <FilterPills
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'ALL', label: 'Barchasi' },
            { value: 'ACTIVE', label: 'Faol' },
            { value: 'COMPLETED', label: 'Yakunlangan' },
          ]}
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loyiha</TableHead>
                <TableHead>Mijoz</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Menejer</TableHead>
                <TableHead>Muddat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id} className="cursor-pointer" onClick={() => handleOpenEditForm(project)}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)] truncate">{project.name}</p>
                      <p className="text-caption text-[var(--color-text-muted)]">{project.type}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">{project.client}</TableCell>
                  <TableCell>
                    <Badge variant={PROJECT_STATUS_COLORS[project.status]}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="w-28">
                      <p className="text-body font-medium text-[var(--color-text-primary)] mb-1">{project.progress}%</p>
                      <div className="h-1.5 bg-[var(--color-bg-border)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--color-accent)] transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar name={project.managerName} size="sm" />
                      <span className="text-body">{project.managerName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-caption text-[var(--color-text-secondary)]">
                    {new Date(project.deadline).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredProjects.length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-[var(--color-text-secondary)]">Loyihalar topilmadi</p>
        </Card>
      )}

      {/* Create/Edit Form Modal */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        onDelete={editingProject ? () => handleOpenDelete(editingProject) : undefined}
        initialData={editingProject}
        isLoading={isFormLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleteLoading}
        title="Loyihani o'chirish"
        description="Bu loyiha doimiy o'chiriladi. Davom etishni xohlaysizmi?"
        itemName={deletingProject?.name}
      />
    </div>
  );
}

// Import type for the form data
import type { ProjectFormData } from '../components/ProjectForm';
