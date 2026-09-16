// Values are i18n keys (see shared/i18n/translations.ts), resolved via useT() in Header - not
// literal display text.
export const PAGE_TITLES: Record<string, string> = {
  '/': 'nav.dashboard',
  '/dashboard': 'nav.dashboard',
  '/projects': 'nav.projects',
  '/tasks': 'nav.tasks',
  '/employees': 'nav.employees',
  '/employees/profile': 'page.my_profile',
  '/attendance': 'nav.attendance',
  '/kpi': 'nav.kpi',
  '/groups': 'nav.groups',
  '/design-dept': 'nav.design_dept',
  '/editing-dept': 'nav.editing_dept',
  '/shooting': 'nav.shooting',
  '/target': 'nav.target',
  '/finance': 'page.finance_dashboard',
  '/mapping': 'nav.mapping',
  '/reports': 'nav.reports',
  '/settings': 'page.settings',
};

export function getPageTitle(pathname: string): string {
  return PAGE_TITLES[pathname] ?? 'page.default';
}
