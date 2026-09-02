import type { NavItem, UserRole } from '@/shared/types';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  User,
  Calendar,
  BarChart,
  Palette,
  Video,
  Camera,
  Target,
  DollarSign,
  CreditCard,
  Map,
  MessagesSquare,
} from 'lucide-react';

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'ASOSIY',
    icon: LayoutDashboard,
    children: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM', 'OPERATOR'],
      },
      {
        label: 'Loyihalar',
        icon: FolderKanban,
        href: '/projects',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM'],
      },
      {
        label: 'Vazifalar',
        icon: CheckSquare,
        href: '/tasks',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM', 'OPERATOR'],
      },
    ],
  },
  {
    label: 'JAMOA',
    icon: Users,
    children: [
      {
        label: 'Hodimlar',
        icon: Users,
        href: '/employees',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI'],
      },
      {
        label: 'Xodim profili',
        icon: User,
        href: '/employees/profile',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM', 'OPERATOR'],
      },
      {
        label: 'Davomat',
        icon: Calendar,
        href: '/attendance',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI'],
      },
      {
        label: 'KPI nazorat',
        icon: BarChart,
        href: '/kpi',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI'],
      },
      {
        label: 'Guruhlar',
        icon: MessagesSquare,
        href: '/groups',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI'],
      },
    ],
  },
  {
    label: 'ISHLAB CHIQARISH',
    icon: Palette,
    children: [
      {
        label: 'Dizayn bo\'limi',
        icon: Palette,
        href: '/design-dept',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM'],
      },
      {
        label: 'Montaj bo\'limi',
        icon: Video,
        href: '/editing-dept',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM'],
      },
      {
        label: 'Syomka kalendari',
        icon: Camera,
        href: '/shooting',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI', 'HODIM'],
      },
    ],
  },
  {
    label: 'SAVDO',
    icon: Target,
    children: [
      {
        label: 'Target bo\'limi',
        icon: Target,
        href: '/target',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI'],
      },
      {
        label: 'Sotuv bo\'limi',
        icon: DollarSign,
        href: '/sales',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI'],
      },
    ],
  },
  {
    label: 'BOSHQARUV',
    icon: CreditCard,
    children: [
      {
        label: 'Moliya / to\'lovlar',
        icon: CreditCard,
        href: '/finance',
        roles: ['CEO', 'MENEJER'],
      },
      {
        label: 'Mapping (qadamlar)',
        icon: Map,
        href: '/mapping',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI'],
      },
    ],
  },
];

export function filterNavByRole(items: NavItem[], role: UserRole): NavItem[] {
  return items
    .map((section) => ({
      ...section,
      children: section.children?.filter((item) =>
        !item.roles || item.roles.includes(role)
      ),
    }))
    .filter((section) => section.children && section.children.length > 0);
}