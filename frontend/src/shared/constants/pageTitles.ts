export const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/projects': 'Loyihalar',
  '/tasks': 'Vazifalar',
  '/employees': 'Hodimlar',
  '/employees/profile': 'Mening profilim',
  '/attendance': 'Davomat',
  '/kpi': 'KPI nazorat',
  '/groups': 'Guruhlar',
  '/design-dept': "Dizayn bo'limi",
  '/editing-dept': "Montaj bo'limi",
  '/shooting': 'Syomka kalendari',
  '/target': "Target bo'limi",
  '/finance': 'Moliyaviy Dashboard',
  '/mapping': 'Mapping (qadamlar)',
  '/settings': 'Sozlamalar',
};

export function getPageTitle(pathname: string): string {
  return PAGE_TITLES[pathname] ?? 'Retarget ERP';
}
