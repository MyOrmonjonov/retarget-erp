'use client';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers';
import { Layout } from '@/shared/components/Layout';
import { RequireAuth } from './routes/guards';
import { NotFoundPage } from './routes/NotFoundPage';

// Import pages
import { AuthGatePage } from '@/features/auth/components/AuthGatePage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { ProjectsPage } from '@/features/projects/pages/ProjectsPage';
import { TasksPage } from '@/features/tasks/pages/TasksPage';
import { EmployeesPage } from '@/features/employees/pages/EmployeesPage';
import { EmployeeProfilePage } from '@/features/employees/pages/EmployeeProfilePage';
import { AttendancePage } from '@/features/employees/pages/AttendancePage';
import { KPIPage } from '@/features/employees/pages/KPIPage';
import { DesignDeptPage } from '@/features/design-dept/pages/DesignDeptPage';
import { EditingDeptPage } from '@/features/editing-dept/pages/EditingDeptPage';
import { ShootingPage } from '@/features/shooting/pages/ShootingPage';
import { TargetPage } from '@/features/sales/pages/TargetPage';
import { SalesPage } from '@/features/sales/pages/SalesPage';
import { FinancePage } from '@/features/finance/pages/FinancePage';
import { MappingPage } from '@/features/mapping/pages/MappingPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';

const router = createBrowserRouter([
  {
    element: <AppProviders />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: '/login',
        element: <AuthGatePage />,
      },
      {
        element: <Layout />,
        children: [
          {
            path: '/',
            element: (
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            ),
          },
          {
            path: '/dashboard',
            element: (
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            ),
          },
          {
            path: '/projects',
            element: (
              <RequireAuth>
                <ProjectsPage />
              </RequireAuth>
            ),
          },
          {
            path: '/tasks',
            element: (
              <RequireAuth>
                <TasksPage />
              </RequireAuth>
            ),
          },
          {
            path: '/employees',
            element: (
              <RequireAuth allowedRoles={['CEO', 'MENEJER', 'BOSHQARUVCHI']}>
                <EmployeesPage />
              </RequireAuth>
            ),
          },
          {
            path: '/employees/profile',
            element: (
              <RequireAuth>
                <EmployeeProfilePage />
              </RequireAuth>
            ),
          },
          {
            path: '/attendance',
            element: (
              <RequireAuth allowedRoles={['CEO', 'MENEJER', 'BOSHQARUVCHI']}>
                <AttendancePage />
              </RequireAuth>
            ),
          },
          {
            path: '/kpi',
            element: (
              <RequireAuth allowedRoles={['CEO', 'MENEJER', 'BOSHQARUVCHI']}>
                <KPIPage />
              </RequireAuth>
            ),
          },
          {
            path: '/design-dept',
            element: (
              <RequireAuth allowedRoles={['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM']}>
                <DesignDeptPage />
              </RequireAuth>
            ),
          },
          {
            path: '/editing-dept',
            element: (
              <RequireAuth allowedRoles={['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM']}>
                <EditingDeptPage />
              </RequireAuth>
            ),
          },
          {
            path: '/shooting',
            element: (
              <RequireAuth allowedRoles={['CEO', 'MENEJER', 'BOSHQARUVCHI', 'HODIM']}>
                <ShootingPage />
              </RequireAuth>
            ),
          },
          {
            path: '/target',
            element: (
              <RequireAuth allowedRoles={['CEO', 'MENEJER', 'BOSHQARUVCHI']}>
                <TargetPage />
              </RequireAuth>
            ),
          },
          {
            path: '/sales',
            element: (
              <RequireAuth allowedRoles={['CEO', 'MENEJER', 'BOSHQARUVCHI']}>
                <SalesPage />
              </RequireAuth>
            ),
          },
          {
            path: '/finance',
            element: (
              <RequireAuth allowedRoles={['CEO', 'MENEJER']}>
                <FinancePage />
              </RequireAuth>
            ),
          },
          {
            path: '/mapping',
            element: (
              <RequireAuth allowedRoles={['CEO', 'MENEJER', 'BOSHQARUVCHI']}>
                <MappingPage />
              </RequireAuth>
            ),
          },
          {
            path: '/settings',
            element: (
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            ),
          },
          {
            path: '*',
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}