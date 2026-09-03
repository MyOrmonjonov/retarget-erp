'use client';

import { Link, NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { NAV_ITEMS, filterNavByRole } from '@/shared/constants/navigation';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { useAuthStore } from '@/features/auth/store/authStore';

export function Sidebar() {
  const { user, isSidebarCollapsed, toggleSidebar, isMobileNavOpen, setMobileNavOpen } = useAuthStore();
  const isMobileOpen = isMobileNavOpen;
  const setIsMobileOpen = setMobileNavOpen;

  const navItems = user ? filterNavByRole(NAV_ITEMS, user.role) : [];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[var(--z-fixed)] bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-[var(--z-fixed)] flex flex-col bg-[var(--color-bg-sidebar)] border-r border-[var(--color-bg-border)] transition-all duration-300 ease-in-out',
          isSidebarCollapsed ? 'w-16' : 'w-60',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Asosiy navigatsiya"
      >
        {/* Header / Brand */}
        <div
          className={cn(
            'flex items-center h-16 px-4',
            isSidebarCollapsed ? 'flex-col justify-center gap-2 py-3 h-auto' : 'justify-between'
          )}
        >
          {!isSidebarCollapsed && (
            <Link to="/dashboard" aria-label="Retarget ERP - Bosh sahifa" className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-accent)] text-[11px] font-black text-white">
                CRM
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-extrabold text-[var(--color-text-primary)] truncate">Retarget ERP</span>
                <span className="block text-[11px] text-[var(--color-text-muted)] truncate">Boshqaruv tizimi</span>
              </span>
            </Link>
          )}
          {isSidebarCollapsed && (
            <Link
              to="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)] transition-transform duration-150 hover:scale-105"
              aria-label="Retarget ERP - Bosh sahifa"
            >
              <span className="text-[16px] font-bold text-white">R</span>
            </Link>
          )}

          {/* Collapse/Expand toggle - always reachable, at every viewport size */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? 'Kengaytirish' : 'Yashirish'}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
          {!isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Yopish"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 overflow-y-auto px-2 py-3">
          <nav aria-label="Asosiy menyu">
            {navItems.map((section) => (
              <div key={section.label} className="mb-6">
                {!isSidebarCollapsed && (
                  <h4 className="px-3 py-1.5 text-[10.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                    {section.label}
                  </h4>
                )}
                <ul className={cn('space-y-1', isSidebarCollapsed && 'space-y-1.5 flex flex-col items-center')} role="list">
                  {section.children?.map((item) => (
                    <li key={item.href} className={isSidebarCollapsed ? 'w-full flex justify-center' : undefined}>
                      <NavLink
                        to={item.href!}
                        title={isSidebarCollapsed ? item.label : undefined}
                        className={({ isActive }: { isActive: boolean }) =>
                          cn(
                            isSidebarCollapsed
                              ? 'group flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-150 active:scale-95'
                              : 'group flex items-center gap-2.5 px-3 py-[9px] rounded-[10px] transition-colors',
                            isActive
                              ? isSidebarCollapsed
                                ? 'bg-[var(--color-accent)] text-white shadow-[0_2px_10px_-2px_rgba(37,99,235,0.4)]'
                                : 'bg-[var(--color-accent)] text-white'
                              : cn(
                                  'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                                  'hover:bg-[var(--color-bg-hover)]'
                                )
                          )
                        }
                        aria-current="page"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <item.icon
                          className={cn(
                            'flex-shrink-0 transition-transform duration-150',
                            isSidebarCollapsed ? 'h-[19px] w-[19px] group-hover:scale-110' : 'h-[17px] w-[17px]'
                          )}
                          aria-hidden="true"
                        />
                        {!isSidebarCollapsed && <span className="text-[13.5px] font-semibold truncate">{item.label}</span>}
                        {item.badge && !isSidebarCollapsed && (
                          <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[var(--color-error)] text-white">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}