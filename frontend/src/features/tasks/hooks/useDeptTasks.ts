import { useMemo } from 'react';
import { useTasks } from './useTasks';
import { useEmployees } from '@/features/employees/hooks/useEmployees';

/** Scopes the shared task list to one department's team, matched by the employee's free-text
 * `department` field (set on the Hodimlar page) containing one of the given keywords. There's
 * no backend "department" concept on a task itself - a task belongs here only via its assignee. */
export function useDeptTasks(keywords: string[]) {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();

  const deptEmployees = useMemo(
    () => employees.filter((e) => keywords.some((k) => e.department?.toLowerCase().includes(k))),
    [employees, keywords]
  );
  const deptEmployeeIds = useMemo(() => new Set(deptEmployees.map((e) => e.userId)), [deptEmployees]);
  const byUserId = useMemo(() => new Map(employees.map((e) => [e.userId, e])), [employees]);

  const displayTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.assigneeIds.some((id) => deptEmployeeIds.has(id)))
        .map((t) => {
          if (t.assigneeName || !t.assigneeId) return t;
          const employee = byUserId.get(t.assigneeId);
          return employee ? { ...t, assigneeName: employee.fullName, assigneeAvatar: employee.avatar } : t;
        }),
    [tasks, deptEmployeeIds, byUserId]
  );

  const assigneeOptions = useMemo(
    () => deptEmployees.map((e) => ({ value: e.userId, label: e.fullName })),
    [deptEmployees]
  );

  return {
    displayTasks,
    assigneeOptions,
    hasDeptEmployees: deptEmployees.length > 0,
    isLoading: tasksLoading || employeesLoading,
  };
}
