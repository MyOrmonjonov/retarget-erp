import { api } from '@/shared/lib/api';
import type { Employee, EmployeeStatus, UserRole } from '@/shared/types';

interface EmployeeDto {
  id: number;
  workspaceId: number;
  userId: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  department: string | null;
  position: string | null;
  status: EmployeeStatus;
  hireDate: string | null;
  kpiScore: number | null;
  projectCount: number;
  taskCount: number;
  completedTasks: number;
  overdueTasks: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: number;
  telegramId: number;
  firstName: string;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  roleCode: string;
  active: boolean;
  temporarilyBlocked: boolean;
}

function toEmployee(dto: EmployeeDto): Employee & { userId: string } {
  return {
    id: String(dto.id),
    userId: String(dto.userId),
    fullName: dto.fullName,
    email: dto.email ?? undefined,
    phone: dto.phone ?? undefined,
    avatar: dto.avatar ?? undefined,
    role: dto.role,
    department: dto.department ?? '',
    position: dto.position ?? '',
    status: dto.status,
    hireDate: dto.hireDate ?? '',
    kpiScore: dto.kpiScore ?? 0,
    projectCount: dto.projectCount,
    taskCount: dto.taskCount,
    completedTasks: dto.completedTasks,
    overdueTasks: dto.overdueTasks,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export interface EmployeeProfileInput {
  orgRole: UserRole;
  department?: string;
  position?: string;
  hireDate?: string;
  email?: string;
  phone?: string;
}

export const employeesApi = {
  list: async (): Promise<(Employee & { userId: string })[]> => {
    const response = await api.get<EmployeeDto[]>('/employees');
    return response.data.map(toEmployee);
  },

  /** Workspace members who don't have an employee profile yet, for the "new employee" picker. */
  listAvailableMembers: async (workspaceId: number): Promise<WorkspaceMember[]> => {
    const [membersRes, employeesRes] = await Promise.all([
      api.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`),
      api.get<EmployeeDto[]>('/employees'),
    ]);
    const assignedUserIds = new Set(employeesRes.data.map((e) => e.userId));
    return membersRes.data.filter((m) => !assignedUserIds.has(m.id));
  },

  create: async (userId: number, input: EmployeeProfileInput, workspaceId: number): Promise<Employee> => {
    const response = await api.post<EmployeeDto>('/employees', {
      workspaceId,
      userId,
      ...input,
    });
    return toEmployee(response.data);
  },

  update: async (id: string, input: EmployeeProfileInput): Promise<Employee> => {
    const response = await api.put<EmployeeDto>(`/employees/${id}`, input);
    return toEmployee(response.data);
  },

  changeStatus: async (id: string, status: EmployeeStatus): Promise<Employee> => {
    const response = await api.patch<EmployeeDto>(`/employees/${id}/status`, { status });
    return toEmployee(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/employees/${id}`);
  },
};
