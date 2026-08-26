/** Base entity with common fields */
export interface BaseEntity {
  id: string | number;
  createdAt: string;
  updatedAt: string;
}

/** Pagination */
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/** API Error */
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

/** User Roles */
export type UserRole = 'CEO' | 'MENEJER' | 'BOSHQARUVCHI' | 'MONTAJOR' | 'HODIM' | 'OPERATOR';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  CEO: 6,
  MENEJER: 5,
  BOSHQARUVCHI: 4,
  MONTAJOR: 3,
  HODIM: 2,
  OPERATOR: 1,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  CEO: 'CEO',
  MENEJER: 'Menejer',
  BOSHQARUVCHI: 'Boshqaruvchi',
  MONTAJOR: 'Montajor',
  HODIM: 'Hodim',
  OPERATOR: 'Operator',
};

/** Inline badge style per role (roles need arbitrary brand colors outside Badge's fixed variant set) */
export const ROLE_BADGE_STYLE: Record<UserRole, { backgroundColor: string; color: string }> = {
  CEO: { backgroundColor: '#C6FF3D33', color: '#C6FF3D' },
  MENEJER: { backgroundColor: '#34C75933', color: '#34C759' },
  BOSHQARUVCHI: { backgroundColor: '#007AFF33', color: '#007AFF' },
  MONTAJOR: { backgroundColor: '#FF9F0A33', color: '#FF9F0A' },
  HODIM: { backgroundColor: '#AF52DE33', color: '#AF52DE' },
  OPERATOR: { backgroundColor: '#FF3B3033', color: '#FF3B30' },
};

/** Auth */
export interface User {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  kpiScore?: number;
  projectCount?: number;
}

/** A workspace the authenticated user belongs to (one workspace = one subscriber/agency) */
export interface AuthWorkspace {
  id: number;
  name: string;
  /** Workspace membership role: OWNER | MEMBER (system access level, distinct from UserRole org role) */
  role: string;
}

export interface TelegramAuthUser {
  id: number;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  uiLanguage: string;
  theme: string;
  remindersEnabled: boolean;
}

/** Response from POST /api/auth/telegram */
export interface TelegramAuthResponse {
  accessToken: string;
  user: TelegramAuthUser;
  workspaces: AuthWorkspace[];
}

/** Project */
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: 'Rejalashtirildi',
  ACTIVE: 'Jarayonda',
  ON_HOLD: "Ko'rib chiqilmoqda",
  COMPLETED: 'Yakunlandi',
  CANCELLED: "To'xtatildi",
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, 'default' | 'success' | 'warning' | 'error'> = {
  PLANNING: 'default',
  ACTIVE: 'success',
  ON_HOLD: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

export interface Project extends BaseEntity {
  name: string;
  client: string;
  clientId?: string;
  type: string;
  status: ProjectStatus;
  progress: number; // 0-100
  managerId: string;
  managerName: string;
  deadline: string;
  startDate?: string;
  budget?: number;
  description?: string;
}

/** Task */
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED';

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Past',
  MEDIUM: 'O\'rta',
  HIGH: 'Yuqori',
  URGENT: 'Shoshilinch',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, 'default' | 'warning' | 'error'> = {
  LOW: 'default',
  MEDIUM: 'warning',
  HIGH: 'error',
  URGENT: 'error',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'Yangi',
  IN_PROGRESS: 'Jarayonda',
  REVIEW: 'Ko\'rib chiqilmoqda',
  DONE: 'Bajarildi',
  BLOCKED: 'Bloklangan',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, 'default' | 'success' | 'warning' | 'error'> = {
  BACKLOG: 'default',
  TODO: 'default',
  IN_PROGRESS: 'success',
  REVIEW: 'warning',
  DONE: 'success',
  BLOCKED: 'error',
};

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  projectId: string;
  projectName: string;
  dueDate: string;
  estimatedHours?: number;
  loggedHours?: number;
  tags?: string[];
}

/** Employee */
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'PROBATION';

export interface Employee extends BaseEntity {
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  department: string;
  position: string;
  status: EmployeeStatus;
  hireDate: string;
  kpiScore: number; // 0-100
  projectCount: number;
  taskCount: number;
  completedTasks: number;
  overdueTasks: number;
}

/** Attendance */
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE' | 'REMOTE' | 'ON_LEAVE';

export interface AttendanceRecord extends BaseEntity {
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  notes?: string;
}

/** KPI */
export interface KPIRecord extends BaseEntity {
  employeeId: string;
  period: string; // YYYY-MM
  target: number;
  actual: number;
  score: number; // percentage
  metrics: {
    tasksCompleted: number;
    tasksOnTime: number;
    qualityScore: number;
    collaborationScore: number;
  };
}

/** Department Kanban */
export interface KanbanColumn {
  id: string;
  title: string;
  status: TaskStatus;
  color: string;
  limit?: number;
}

export interface KanbanCard extends Task {
  columnId: string;
}

/** Dashboard Stats */
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalEmployees: number;
  pendingApprovals: number;
  motivationScore: number; // 0-100
  teamLoad: {
    department: string;
    load: number; // 0-100
    employeeCount: number;
  }[];
  topEmployee: {
    id: string;
    name: string;
    avatar?: string;
    kpiScore: number;
    completedTasks: number;
  } | null;
}

/** Target / Sales */
export interface TargetRecord extends BaseEntity {
  employeeId: string;
  employeeName: string;
  period: string; // YYYY-MM
  targetAmount: number;
  actualAmount: number;
  conversionRate: number;
  callsCount: number;
  meetingsCount: number;
  dealsClosed: number;
}

export type DealStage = 'LEAD' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface Deal extends BaseEntity {
  title: string;
  client: string;
  value: number;
  stage: DealStage;
  probability: number;
  ownerId: string;
  ownerName: string;
  expectedCloseDate: string;
  description?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
}

/** Shooting */
export type ShootingEventType = 'PHOTO' | 'VIDEO' | 'EVENT' | 'INTERVIEW';
export type ShootingEventStatus = 'PLANNING' | 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface ShootingEvent extends BaseEntity {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: ShootingEventType;
  status: ShootingEventStatus;
  team: string[]; // employee IDs
  description?: string;
}

/** Finance */
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type ExpenseCategory = 'SALARY' | 'RENT' | 'EQUIPMENT' | 'SOFTWARE' | 'MARKETING' | 'TRAVEL' | 'OTHER';

export interface Payment extends BaseEntity {
  invoiceId?: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  method?: string;
  description?: string;
}

export interface Invoice extends BaseEntity {
  number: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Expense extends BaseEntity {
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  description?: string;
  receiptUrl?: string;
  approvedBy?: string;
  approvedAt?: string;
}

/** Mapping / Workflow */
export interface MappingStep extends BaseEntity {
  name: string;
  description?: string;
  order: number;
  department: string;
  responsibleRole?: UserRole;
  estimatedDays: number;
  dependencies?: string[]; // step IDs
}

export interface MappingFlow extends BaseEntity {
  name: string;
  description?: string;
  steps: MappingStep[];
  isActive: boolean;
}

/** Settings */
export interface CompanySettings {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  currency: string;
  timezone: string;
  workWeekStart: number; // 0=Sunday, 1=Monday
  workHoursPerDay: number;
}

/** Navigation */
export interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  href?: string;
  children?: NavItem[];
  roles?: UserRole[];
  badge?: number;
}