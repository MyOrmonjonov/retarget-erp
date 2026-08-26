import { api } from '@/shared/lib/api';
import { getAuthStore } from '@/features/auth/store/authStore';
import type { AttendanceStatus } from '@/shared/types';

export interface AttendanceRecordDto {
  id: number;
  workspaceId: number;
  employeeId: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function currentWorkspaceId(): number {
  const { activeWorkspaceId } = getAuthStore();
  if (activeWorkspaceId == null) throw new Error('Ish maydoni tanlanmagan');
  return activeWorkspaceId;
}

export const attendanceApi = {
  listForDate: async (date: Date): Promise<AttendanceRecordDto[]> => {
    const day = formatDate(date);
    const response = await api.get<AttendanceRecordDto[]>('/attendance', { from: day, to: day });
    return response.data;
  },

  listForEmployeeRange: async (employeeId: string, from: Date, to: Date): Promise<AttendanceRecordDto[]> => {
    const response = await api.get<AttendanceRecordDto[]>('/attendance', {
      employeeId,
      from: formatDate(from),
      to: formatDate(to),
    });
    return response.data;
  },

  checkIn: async (employeeId: string, time: string): Promise<AttendanceRecordDto> => {
    const response = await api.post<AttendanceRecordDto>('/attendance', {
      workspaceId: currentWorkspaceId(),
      userId: Number(employeeId),
      date: formatDate(new Date()),
      checkIn: time,
      status: 'PRESENT',
    });
    return response.data;
  },

  checkOut: async (employeeId: string, time: string): Promise<AttendanceRecordDto> => {
    const today = await attendanceApi.listForEmployeeRange(employeeId, new Date(), new Date());
    const existing = today[0];
    const response = await api.post<AttendanceRecordDto>('/attendance', {
      workspaceId: currentWorkspaceId(),
      userId: Number(employeeId),
      date: formatDate(new Date()),
      checkIn: existing?.checkIn ?? time,
      checkOut: time,
      status: existing?.status ?? 'PRESENT',
    });
    return response.data;
  },
};
