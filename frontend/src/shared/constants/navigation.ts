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
  CreditCard,
  Map,
  MessagesSquare,
  TrendingUp,
  Sparkles,
  UserPlus,
} from 'lucide-react';

// `label` holds an i18n key (see shared/i18n/translations.ts), rendered via useT() - not literal
// display text, so it's Uzbek-looking but must never be printed directly.
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'nav.section_main',
    icon: LayoutDashboard,
    children: [
      {
        label: 'nav.dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM', 'OPERATOR'],
      },
      {
        label: 'nav.projects',
        icon: FolderKanban,
        href: '/projects',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM'],
      },
      {
        label: 'nav.tasks',
        icon: CheckSquare,
        href: '/tasks',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM', 'OPERATOR'],
      },
    ],
  },
  {
    label: 'nav.section_team',
    icon: Users,
    children: [
      {
        label: 'nav.employees',
        icon: Users,
        href: '/employees',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI'],
      },
      {
        label: 'nav.my_profile',
        icon: User,
        href: '/employees/profile',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM', 'OPERATOR'],
      },
      {
        label: 'nav.attendance',
        icon: Calendar,
        href: '/attendance',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI'],
      },
      {
        label: 'nav.kpi',
        icon: BarChart,
        href: '/kpi',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI'],
      },
      {
        label: 'nav.groups',
        icon: MessagesSquare,
        href: '/groups',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI'],
      },
      {
        label: 'nav.team_members',
        icon: UserPlus,
        href: '/team-members',
        roles: ['CEO'],
      },
    ],
  },
  {
    label: 'nav.section_production',
    icon: Palette,
    children: [
      {
        label: 'nav.design_dept',
        icon: Palette,
        href: '/design-dept',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM'],
      },
      {
        label: 'nav.editing_dept',
        icon: Video,
        href: '/editing-dept',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI', 'MONTAJOR', 'HODIM'],
      },
      {
        label: 'nav.shooting',
        icon: Camera,
        href: '/shooting',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI', 'HODIM'],
      },
    ],
  },
  {
    label: 'nav.section_sales',
    icon: Target,
    children: [
      {
        label: 'nav.target',
        icon: Target,
        href: '/target',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI'],
      },
    ],
  },
  {
    label: 'nav.section_management',
    icon: CreditCard,
    children: [
      {
        label: 'nav.finance',
        icon: CreditCard,
        href: '/finance',
        roles: ['CEO', 'MENEJER'],
      },
      {
        label: 'nav.mapping',
        icon: Map,
        href: '/mapping',
        roles: ['CEO', 'MENEJER', 'BOSHQARUVCHI'],
      },
      {
        label: 'nav.reports',
        icon: TrendingUp,
        href: '/reports',
        roles: ['CEO'],
      },
      {
        label: 'nav.subscription',
        icon: Sparkles,
        href: '/subscription',
        roles: ['CEO'],
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
