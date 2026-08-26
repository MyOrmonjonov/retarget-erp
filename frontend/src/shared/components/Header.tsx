'use client';

import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronRight, ChevronLeft, Building2, Check, LogOut, User, Settings } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/shared/ui/tooltip';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSwitchWorkspace } from '@/features/auth/hooks/useAuth';
import { ROLE_LABELS } from '@/shared/types';
import { getPageTitle } from '@/shared/constants/pageTitles';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isSidebarCollapsed, toggleSidebar, workspaces, activeWorkspaceId } = useAuthStore();
  const switchWorkspace = useSwitchWorkspace();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <TooltipProvider>
      <header
        className={cn(
          'fixed top-0 right-0 z-[var(--z-sticky)] h-[72px] bg-[var(--color-bg-primary)] border-b border-[var(--color-bg-border)] transition-all duration-300',
          isSidebarCollapsed ? 'left-16' : 'left-60',
          'lg:left-60'
        )}
        role="banner"
      >
        <div className="flex h-full items-center justify-between px-4 gap-4">
          {/* Left: Mobile Menu Toggle */}
          <div className="flex items-center gap-3 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label={isSidebarCollapsed ? 'Kengaytirish' : 'Yashirish'}
              className="lg:hidden"
            >
              {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          <h1 className="flex-1 text-[20px] font-bold text-[var(--color-text-primary)] truncate">
            {getPageTitle(location.pathname)}
          </h1>

          {/* Right: Notifications + User Menu */}
          <div className="flex items-center gap-2">
            {/* Workspace Switcher (only when the user belongs to more than one workspace) */}
            {workspaces.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 max-w-[180px]">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span className="truncate">{activeWorkspace?.name ?? 'Workspace'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal text-caption text-[var(--color-text-muted)]">
                    Ish maydonlari
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {workspaces.map((workspace) => (
                    <DropdownMenuItem
                      key={workspace.id}
                      onClick={() => switchWorkspace(workspace.id)}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{workspace.name}</span>
                      {workspace.id === activeWorkspaceId && <Check className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Notifications */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  aria-label="Bildirishnomalar"
                  aria-expanded={notificationsOpen}
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end">
                Bildirishnomalar
              </TooltipContent>
            </Tooltip>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full" aria-label="Profil menyusi">
                  <Avatar name={user.fullName} src={user.avatar} size="md" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-body font-medium text-[var(--color-text-primary)]">{user.fullName}</p>
                    {user.email && <p className="text-caption text-[var(--color-text-muted)]">{user.email}</p>}
                    <Badge variant="outline" className="w-fit">{ROLE_LABELS[user.role]}</Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/employees/profile" className="flex w-full items-center gap-2" onClick={() => setNotificationsOpen(false)}>
                    <User className="h-4 w-4" />
                    Profilim
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex w-full items-center gap-2" onClick={() => setNotificationsOpen(false)}>
                    <Settings className="h-4 w-4" />
                    Sozlamalar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-[var(--color-error)] focus:text-[var(--color-error)]">
                  <LogOut className="h-4 w-4 mr-2" />
                  Tizimdan chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}