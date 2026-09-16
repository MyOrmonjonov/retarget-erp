'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Moon, Sun, Monitor, Languages, Bell, HelpCircle,
  Settings2, ShieldCheck, FolderKanban, SlidersHorizontal, Archive, LogOut, ChevronRight, ChevronDown, Check,
} from 'lucide-react';
import { Sheet, SheetContent } from '@/shared/ui/sheet';
import { Avatar } from '@/shared/ui/avatar';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useWorkspaceMembers } from '@/features/workspace/hooks/useWorkspaceMembers';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { preferencesApi } from '@/features/settings/api/preferencesApi';
import { useT } from '@/shared/i18n/useT';

const THEME_CYCLE = ['system', 'dark', 'light'] as const;
const THEME_LABEL_KEY: Record<(typeof THEME_CYCLE)[number], string> = {
  system: 'profile.theme_system',
  dark: 'profile.theme_dark',
  light: 'profile.theme_light',
};
const THEME_ICON = { system: Monitor, dark: Moon, light: Sun };

const LANGUAGE_CYCLE = ['uz', 'ru', 'en'] as const;
const LANGUAGE_LABEL_KEY: Record<(typeof LANGUAGE_CYCLE)[number], string> = {
  uz: 'profile.language_uz',
  ru: 'profile.language_ru',
  en: 'profile.language_en',
};

function MenuRow({
  icon: Icon,
  iconBg,
  title,
  subtitle,
  onClick,
  destructive,
  expanded,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  title: string;
  subtitle: string;
  onClick: () => void;
  destructive?: boolean;
  /** When set (true/false, not undefined), the trailing chevron rotates to reflect an
   *  expand/collapse state instead of implying "navigates elsewhere". */
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-bg-hover)] transition-colors"
    >
      <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <Icon className="h-[18px] w-[18px] text-white" />
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-body font-semibold ${destructive ? 'text-[var(--color-error)]' : 'text-[var(--color-text-primary)]'}`}>
          {title}
        </span>
        <span className="block text-caption text-[var(--color-text-muted)] truncate">{subtitle}</span>
      </span>
      {!destructive && expanded === undefined && <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--color-text-muted)]" />}
      {expanded !== undefined && (
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-[var(--color-text-muted)] transition-transform ${expanded ? 'rotate-180' : ''}`} />
      )}
    </button>
  );
}

function OptionList<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: { value: T; label: string }[];
  value: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="bg-[var(--color-bg-hover)] pb-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          className="flex w-full items-center gap-3 pl-[52px] pr-4 py-2.5 text-left hover:bg-[var(--color-bg-border)]/40 transition-colors"
        >
          <span className="flex-1 text-body text-[var(--color-text-primary)]">{option.label}</span>
          {option.value === value && <Check className="h-4 w-4 flex-shrink-0 text-[var(--color-accent)]" />}
        </button>
      ))}
    </div>
  );
}

export function ProfileMenuSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, workspaces, activeWorkspaceId, uiLanguage, themePreference, setUiLanguage, setThemePreference } = useAuthStore();
  const t = useT();
  const navigate = useNavigate();
  const logout = useLogout();
  const queryClient = useQueryClient();

  const { data: preferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: preferencesApi.get,
    enabled: open,
  });
  const updatePreferences = useMutation({
    mutationFn: preferencesApi.update,
    onSuccess: (data) => {
      queryClient.setQueryData(['preferences'], data);
      setUiLanguage(data.uiLanguage);
      setThemePreference(data.theme);
    },
    onError: (error: { message?: string }) => toast.error(error.message || t('common.error')),
  });

  const { data: members = [] } = useWorkspaceMembers();
  const { data: groups = [] } = useGroups();
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const [expanded, setExpanded] = useState<'theme' | 'language' | null>(null);

  const theme = (themePreference || 'system') as (typeof THEME_CYCLE)[number];
  const language = (uiLanguage || 'uz') as (typeof LANGUAGE_CYCLE)[number];
  const ThemeIcon = THEME_ICON[theme] ?? Monitor;

  const selectTheme = (next: (typeof THEME_CYCLE)[number]) => {
    setThemePreference(next);
    updatePreferences.mutate({ theme: next });
    setExpanded(null);
  };
  const selectLanguage = (next: (typeof LANGUAGE_CYCLE)[number]) => {
    setUiLanguage(next);
    updatePreferences.mutate({ uiLanguage: next });
    setExpanded(null);
  };
  const toggleReminders = () => {
    updatePreferences.mutate({ remindersEnabled: !(preferences?.remindersEnabled ?? true) });
  };

  const goTo = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {/* Profile header */}
        <div className="flex items-center gap-3 p-5 border-b border-[var(--color-bg-border)]">
          <Avatar name={user?.fullName} src={user?.avatar} size="lg" />
          <div className="min-w-0">
            <p className="text-body font-bold text-[var(--color-text-primary)] truncate">{user?.fullName}</p>
            <p className="text-caption text-[var(--color-text-muted)]">{user ? t(`role.${user.role}`) : ''}</p>
          </div>
        </div>

        {/* Personal settings */}
        <div className="py-2">
          <MenuRow
            icon={ThemeIcon}
            iconBg="bg-[#6E56CF]"
            title={t('profile.appearance')}
            subtitle={t(THEME_LABEL_KEY[theme])}
            onClick={() => setExpanded((cur) => (cur === 'theme' ? null : 'theme'))}
            expanded={expanded === 'theme'}
          />
          {expanded === 'theme' && (
            <OptionList
              value={theme}
              onSelect={selectTheme}
              options={THEME_CYCLE.map((value) => ({ value, label: t(THEME_LABEL_KEY[value]) }))}
            />
          )}
          <MenuRow
            icon={Languages}
            iconBg="bg-[#0EA5E9]"
            title={t('profile.language')}
            subtitle={t(LANGUAGE_LABEL_KEY[language])}
            onClick={() => setExpanded((cur) => (cur === 'language' ? null : 'language'))}
            expanded={expanded === 'language'}
          />
          {expanded === 'language' && (
            <OptionList
              value={language}
              onSelect={selectLanguage}
              options={LANGUAGE_CYCLE.map((value) => ({ value, label: t(LANGUAGE_LABEL_KEY[value]) }))}
            />
          )}
          <MenuRow
            icon={Bell}
            iconBg="bg-[#F43F5E]"
            title={t('profile.notifications')}
            subtitle={preferences?.remindersEnabled === false ? t('profile.notifications_off') : t('profile.notifications_on')}
            onClick={toggleReminders}
          />
          <MenuRow
            icon={HelpCircle}
            iconBg="bg-[#3B82F6]"
            title={t('profile.help')}
            subtitle={t('profile.help_subtitle')}
            onClick={() => toast.info(t('profile.help_toast'))}
          />
        </div>

        {/* Workspace settings */}
        <p className="px-4 pt-3 pb-1 text-caption font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
          {t('profile.workspace_settings')}
        </p>
        <div className="py-2">
          <MenuRow
            icon={Settings2}
            iconBg="bg-[var(--color-text-muted)]"
            title={t('profile.workspace')}
            subtitle={activeWorkspace?.name ?? '—'}
            onClick={() => goTo('/settings')}
          />
          <MenuRow
            icon={ShieldCheck}
            iconBg="bg-[#0EA5E9]"
            title={t('profile.access_members')}
            subtitle={`${members.length} ${t('profile.members_unit')}`}
            onClick={() => goTo('/team-members')}
          />
          <MenuRow
            icon={FolderKanban}
            iconBg="bg-[#22C55E]"
            title={t('profile.groups')}
            subtitle={`${groups.length} ${t('profile.groups_unit')}`}
            onClick={() => goTo('/groups')}
          />
          <MenuRow
            icon={SlidersHorizontal}
            iconBg="bg-[#6E56CF]"
            title={t('profile.task_rules')}
            subtitle={t('profile.task_rules_subtitle')}
            onClick={() => goTo('/groups')}
          />
          <MenuRow
            icon={Archive}
            iconBg="bg-[var(--color-text-muted)]"
            title={t('profile.archive')}
            subtitle={t('profile.coming_soon')}
            onClick={() => toast.info(t('profile.archive_toast'))}
          />
        </div>

        <div className="py-2 border-t border-[var(--color-bg-border)]">
          <MenuRow icon={LogOut} iconBg="bg-[var(--color-error)]" title={t('profile.logout')} subtitle={t('profile.logout_subtitle')} onClick={logout} destructive />
        </div>
      </SheetContent>
    </Sheet>
  );
}
