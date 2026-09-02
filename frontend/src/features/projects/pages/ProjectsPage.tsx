'use client';

import { useMemo, useState, useCallback } from 'react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { CircularProgress } from '@/shared/components/CircularProgress';
import { Skeleton } from '@/shared/ui/skeleton';
import { FilterPills } from '@/shared/components/FilterPills';
import { Plus, Search } from 'lucide-react';
import type { Project, ProjectStatus } from '@/shared/types';
import { PROJECT_STATUS_LABELS, PROJECT_PRIORITY_LABELS, PROJECT_PRIORITY_COLORS } from '@/shared/types';
import { ProjectForm, type ProjectFormData } from '../components/ProjectForm';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject, useChangeProjectStatus } from '../hooks/useProjects';
import { useEmployees } from '@/features/employees/hooks/useEmployees';
import { formatShortDate } from '@/shared/lib/utils';

const STATUS_OPTIONS: ProjectStatus[] = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];

const STATUS_SELECT_STYLE: Record<ProjectStatus, { backgroundColor: string; color: string }> = {
  PLANNING: { backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)' },
  ACTIVE: { backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success)' },
  ON_HOLD: { backgroundColor: 'var(--color-warning-muted)', color: 'var(--color-warning)' },
  COMPLETED: { backgroundColor: 'var(--color-success-muted)', color: 'var(--color-success)' },
  CANCELLED: { backgroundColor: 'var(--color-error-muted)', color: 'var(--color-error)' },
};

function InlineStatusSelect({ project, onChange }: { project: Project; onChange: (status: ProjectStatus) => void }) {
  return (
    <select
      value={project.status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value as ProjectStatus)}
      className="text-caption font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      style={STATUS_SELECT_STYLE[project.status]}
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>{PROJECT_STATUS_LABELS[status]}</option>
      ))}
    </select>
  );
}

function ProjectCard({ project, onOpen, onChangeStatus }: {
  project: Project;
  onOpen: () => void;
  onChangeStatus: (status: ProjectStatus) => void;
}) {
  return (
    <Card className="p-5 cursor-pointer hover:border-[var(--color-text-muted)] transition-colors" onClick={onOpen}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <CircularProgress value={project.progress} size={56} strokeWidth={4} variant="accent" fillColor="var(--color-bg-hover)" />
          <div className="min-w-0">
            <p className="font-medium text-[var(--color-text-primary)] truncate">{project.name}</p>
            <p className="text-caption text-[var(--color-text-muted)] truncate">{project.client}</p>
          </div>
        </div>
        <Badge variant={PROJECT_PRIORITY_COLORS[project.priority]} size="sm">
          {PROJECT_PRIORITY_LABELS[project.priority]}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-3">
        <InlineStatusSelect project={project} onChange={onChangeStatus} />
        {project.budget != null && (
          <span className="text-caption text-[var(--color-text-muted)]">
            {project.budget.toLocaleString('en-US')} so'm
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-bg-border)]">
        <span className="flex items-center gap-1.5 text-caption text-[var(--color-text-secondary)]">
          <Avatar name={project.managerName} src={project.managerAvatar} size="xs" />
          {project.managerName}
        </span>
        {project.team.length > 0 && (
          <div className="flex items-center">
            {project.team.slice(0, 4).map((member, index) => (
              <div key={member.userId} style={{ marginLeft: index ? -8 : 0 }} className="ring-2 ring-[var(--color-bg-surface)] rounded-full">
                <Avatar name={member.name} src={member.avatar} size="xs" />
              </div>
            ))}
            {project.team.length > 4 && (
              <span className="ml-1 text-caption text-[var(--color-text-muted)]">+{project.team.length - 4}</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-caption text-[var(--color-text-muted)]">
        <span>{project.type}</span>
        <span>{project.deadline ? formatShortDate(project.deadline) : '—'}</span>
      </div>
    </Card>
  );
}

export function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const { data: projects = [], isLoading } = useProjects();
  const { data: employeeList = [] } = useEmployees();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const changeStatus = useChangeProjectStatus();

  const employeeOptions = useMemo(
    () => employeeList.map((e) => ({ value: e.userId, label: e.fullName })),
    [employeeList]
  );

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Delete confirmation states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

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
    if (editingProject) {
      await updateProject.mutateAsync({ id: String(editingProject.id), data });
    } else {
      await createProject.mutateAsync(data);
    }
    handleCloseForm();
  }, [editingProject, createProject, updateProject, handleCloseForm]);

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
    await deleteProject.mutateAsync(String(deletingProject.id));
    handleCloseDelete();
  }, [deletingProject, deleteProject, handleCloseDelete]);

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

      {/* Card grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[180px] rounded-[14px]" />)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-[var(--color-text-secondary)]">Loyihalar topilmadi</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={() => handleOpenEditForm(project)}
              onChangeStatus={(status) => changeStatus.mutate({ id: String(project.id), status })}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        onDelete={editingProject ? () => handleOpenDelete(editingProject) : undefined}
        initialData={editingProject}
        isLoading={createProject.isPending || updateProject.isPending}
        employees={employeeOptions}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        isLoading={deleteProject.isPending}
        title="Loyihani o'chirish"
        description="Bu loyiha doimiy o'chiriladi. Davom etishni xohlaysizmi?"
        itemName={deletingProject?.name}
      />
    </div>
  );
}
