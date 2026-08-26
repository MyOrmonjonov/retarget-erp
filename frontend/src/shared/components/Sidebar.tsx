'use client';

import * as React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { NAV_ITEMS, filterNavByRole } from '@/shared/constants/navigation';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { useAuthStore } from '@/features/auth/store/authStore';

export function Sidebar() {
  const { user, isSidebarCollapsed, toggleSidebar } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

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
        <div className={cn('flex items-center justify-between h-16 px-4', isSidebarCollapsed && 'justify-center')}>
          {!isSidebarCollapsed && (
            <Link to="/dashboard" aria-label="Retarget ERP - Bosh sahifa">
              <span className="text-[16px] font-bold text-[var(--color-text-primary)]">Retarget ERP</span>
            </Link>
          )}
          {isSidebarCollapsed && (
            <Link to="/dashboard" className="flex items-center justify-center" aria-label="Retarget ERP - Bosh sahifa">
              <span className="text-h3 font-bold text-[var(--color-accent)]">R</span>
            </Link>
          )}

          {/* Collapse/Expand & Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn('lg:hidden', isSidebarCollapsed && 'hidden')}
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? 'Kengaytirish' : 'Yashirish'}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Yopish"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 overflow-y-auto px-2 py-3">
          <nav aria-label="Asosiy menyu">
            {navItems.map((section) => (
              <div key={section.label} className="mb-6">
                {!isSidebarCollapsed && (
                  <h4 className="px-3 py-1.5 text-[10px] font-normal text-[var(--color-text-muted)] uppercase tracking-wider">
                    {section.label}
                  </h4>
                )}
                <ul className="space-y-1" role="list">
                  {section.children?.map((item) => (
                    <li key={item.href}>
                      <NavLink
                        to={item.href!}
                        className={({ isActive }: { isActive: boolean }) =>
                          cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
                            'text-[#E6E6E6] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]',
                            isActive
                              ? 'bg-[#C6FF3D26] text-[var(--color-accent)]'
                              : '',
                            isSidebarCollapsed && 'justify-center'
                          )
                        }
                        aria-current="page"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        {isSidebarCollapsed && <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />}
                        {!isSidebarCollapsed && <span className="text-[14px] font-normal truncate">{item.label}</span>}
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

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 left-4 z-[var(--z-sticky)] lg:hidden"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Menyuni ochish"
      >
        <Menu className="h-6 w-6" />
      </Button>
    </>
  );
}