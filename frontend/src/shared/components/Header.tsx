'use client';

import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu, Building2, Check, Plus, Pencil } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/ui/avatar';
import { ProfileMenuSheet } from './ProfileMenuSheet';
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
import { WorkspaceForm } from '@/features/workspace/components/WorkspaceForm';
import { useCreateWorkspace, useRenameWorkspace } from '@/features/workspace/hooks/useWorkspace';
import { getPageTitle } from '@/shared/constants/pageTitles';
import { useT } from '@/shared/i18n/useT';

export function Header() {
  const location = useLocation();
  const t = useT();
  const { user, isSidebarCollapsed, setMobileNavOpen, workspaces, activeWorkspaceId } = useAuthStore();
  const switchWorkspace = useSwitchWorkspace();
  const createWorkspace = useCreateWorkspace();
  const renameWorkspace = useRenameWorkspace();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [workspaceFormMode, setWorkspaceFormMode] = React.useState<'create' | 'rename' | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const handleWorkspaceFormSubmit = async (name: string) => {
    if (workspaceFormMode === 'rename' && activeWorkspace) {
      await renameWorkspace.mutateAsync({ id: activeWorkspace.id, name });
    } else {
      await createWorkspace.mutateAsync(name);
    }
    setWorkspaceFormMode(null);
  };

  if (!user) return null;

  return (
    <TooltipProvider>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-[var(--z-sticky)] h-[72px] bg-[var(--color-bg-primary)] border-b border-[var(--color-bg-border)] transition-all duration-300',
          isSidebarCollapsed ? 'lg:left-16' : 'lg:left-60'
        )}
        role="banner"
      >
        <div className="flex h-full items-center justify-between px-4 gap-4">
          {/* Left: Mobile Nav Hamburger - opens the slide-over drawer, always at the top on mobile */}
          <div className="flex items-center gap-3 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Menyuni ochish"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <h1 className="flex-1 text-[20px] font-bold text-[var(--color-text-primary)] truncate">
            {t(getPageTitle(location.pathname))}
          </h1>

          {/* Right: Notifications + User Menu */}
          <div className="flex items-center gap-2">
            {/* Workspace Switcher - always visible, so a single-workspace user can still create/rename one */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 max-w-[180px]">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{activeWorkspace?.name ?? 'Workspace'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal text-caption text-[var(--color-text-muted)]">
                  {t('header.workspaces')}
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
                <DropdownMenuSeparator />
                {activeWorkspace?.role === 'OWNER' && (
                  <DropdownMenuItem onClick={() => setWorkspaceFormMode('rename')} className="gap-2">
                    <Pencil className="h-4 w-4" />
                    {t('header.rename_workspace')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setWorkspaceFormMode('create')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('header.new_workspace')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  aria-label={t('header.notifications')}
                  aria-expanded={notificationsOpen}
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="end">
                {t('header.notifications')}
              </TooltipContent>
            </Tooltip>

            {/* Profile - opens the settings sheet (theme, language, workspace, etc.) */}
            <button
              type="button"
              onClick={() => setProfileMenuOpen(true)}
              className="rounded-full"
              aria-label={t('header.profile_settings')}
            >
              <Avatar name={user.fullName} src={user.avatar} size="md" />
            </button>
          </div>
        </div>
      </header>

      <WorkspaceForm
        isOpen={workspaceFormMode !== null}
        onClose={() => setWorkspaceFormMode(null)}
        onSubmit={handleWorkspaceFormSubmit}
        initialName={workspaceFormMode === 'rename' ? activeWorkspace?.name : undefined}
        isLoading={createWorkspace.isPending || renameWorkspace.isPending}
      />

      <ProfileMenuSheet open={profileMenuOpen} onOpenChange={setProfileMenuOpen} />
    </TooltipProvider>
  );
}