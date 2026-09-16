'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';
import { MessagesSquare, Plus, Send, Users, AlertTriangle, Link2, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { groupsApi, type Group } from '../api/groupsApi';
import { useGroups, useAvailableGroups, useLinkGroup, useInviteGroupMembers, useUpdateGroupRules, useUnlinkGroup, useSyncGroupMembers } from '../hooks/useGroups';
import { getTelegramWebApp } from '@/shared/lib/telegram';
import { useQueryClient } from '@tanstack/react-query';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';

function GroupCard({ group }: { group: Group }) {
  const inviteMembers = useInviteGroupMembers();
  const updateRules = useUpdateGroupRules();
  const unlinkGroup = useUnlinkGroup();
  const syncMembers = useSyncGroupMembers();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center flex-shrink-0">
            <MessagesSquare className="h-5 w-5 text-[var(--color-accent)]" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[var(--color-text-primary)] truncate">{group.title}</p>
            <p className="text-caption text-[var(--color-text-muted)]">
              <Users className="inline h-3 w-3 mr-1" />{group.members} a'zo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!group.botConnected && (
            <Badge variant="error" className="gap-1">
              <AlertTriangle className="h-3 w-3" /> Bot guruhda yo'q
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setConfirmDeleteOpen(true)}
            aria-label="Guruhni o'chirish"
          >
            <Trash2 className="h-4 w-4 text-[var(--color-error)]" />
          </Button>
        </div>
      </div>

      <DeleteConfirmation
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={async () => {
          await unlinkGroup.mutateAsync(group.id);
          setConfirmDeleteOpen(false);
        }}
        isLoading={unlinkGroup.isPending}
        title="Guruhni o'chirish"
        description="Guruh ish maydonidan uziladi. Telegram guruhining o'zi o'zgarmaydi, kerak bo'lsa qayta ulash mumkin."
        itemName={group.title}
      />

      {group.memberList.length > 0 && (
        <div className="flex -space-x-2">
          {group.memberList.slice(0, 8).map((member) => (
            <Avatar key={member.id} name={member.name} src={member.photoUrl ?? undefined} size="sm" className="ring-2 ring-[var(--color-bg-surface)]" />
          ))}
          {group.memberList.length > 8 && (
            <div className="w-8 h-8 rounded-full bg-[var(--color-bg-hover)] flex items-center justify-center text-caption text-[var(--color-text-muted)] ring-2 ring-[var(--color-bg-surface)]">
              +{group.memberList.length - 8}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1 border-t border-[var(--color-bg-border)]">
        <div className="flex items-center gap-1.5 pt-3">
          {(['EVERYONE', 'OWNER_ONLY'] as const).map((policy) => (
            <button
              key={policy}
              type="button"
              onClick={() => updateRules.mutate({ groupId: group.id, policy })}
              className={`px-2.5 py-1 rounded-full text-caption transition-colors ${
                group.taskCreationPolicy === policy
                  ? 'bg-[var(--color-accent)] text-white font-medium'
                  : 'bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]'
              }`}
            >
              {policy === 'EVERYONE' ? 'Hamma vazifa yarata oladi' : 'Faqat egasi'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => syncMembers.mutate(group.id)}
            disabled={syncMembers.isPending}
            title="Guruh adminlarini qayta o'qish"
          >
            <RefreshCw className="h-3.5 w-3.5" /> A'zolarni yangilash
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => inviteMembers.mutate(group.id)}
            disabled={inviteMembers.isPending}
          >
            <Send className="h-3.5 w-3.5" /> Taklif
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function GroupsPage() {
  const { data: groups = [], isLoading } = useGroups();
  const { data: availableGroups = [] } = useAvailableGroups(true);
  const linkGroup = useLinkGroup();
  const queryClient = useQueryClient();
  const [pickerBusy, setPickerBusy] = useState(false);

  const openTelegramGroupPicker = async () => {
    const webApp = getTelegramWebApp();
    if (!webApp?.initData) {
      toast.error("Guruh qo'shish uchun ilovani Telegram orqali oching");
      return;
    }
    if (pickerBusy) return;
    setPickerBusy(true);
    const previousIds = new Set(groups.map((g) => g.id));

    try {
      const prepared = await groupsApi.prepare();

      if (!webApp.requestChat || (webApp.isVersionAtLeast && !webApp.isVersionAtLeast('9.6'))) {
        // Older Telegram client: fall back to the bot sending a pick-a-chat message directly in the chat.
        await groupsApi.fallback(prepared.requestId);
        setPickerBusy(false);
        toast.info('Guruh tanlash uchun bot sizga xabar yubordi - shu yerda tanlang');
        return;
      }

      let finished = false;
      const timeout = window.setTimeout(async () => {
        if (finished) return;
        finished = true;
        try {
          await groupsApi.fallback(prepared.requestId);
          toast.info('Guruh tanlash uchun bot sizga xabar yubordi - shu yerda tanlang');
        } catch {
          // ignore - the request may have already been consumed
        } finally {
          setPickerBusy(false);
        }
      }, 8000);

      webApp.requestChat(prepared.preparedButtonId, (selected) => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timeout);
        if (!selected) {
          setPickerBusy(false);
          return;
        }
        void (async () => {
          for (let attempt = 0; attempt < 10; attempt += 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 900));
            const refreshed = await groupsApi.list();
            queryClient.setQueryData(['groups'], refreshed);
            if (refreshed.some((g) => !previousIds.has(g.id))) {
              setPickerBusy(false);
              toast.success('Guruh ulandi');
              return;
            }
          }
          setPickerBusy(false);
          toast.info("Guruh tanlandi - ro'yxatni yangilab ko'ring");
        })();
      });
    } catch (error) {
      setPickerBusy(false);
      toast.error(error instanceof Error ? error.message : "Guruh qo'shishda xatolik yuz berdi");
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <p className="text-caption text-[var(--color-text-secondary)] max-w-md">
          Telegram guruhini ulang - guruhga yozgan har bir a'zo ish maydoningiz ro'yxatiga qo'shiladi.
          Ularni xodim sifatida rasmiylashtirish uchun "Hodimlar" bo'limida rolini belgilang.
        </p>
        <Button variant="primary" onClick={openTelegramGroupPicker} loading={pickerBusy}>
          <Plus className="h-4 w-4" /> Guruh qo'shish
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-[180px] w-full rounded-[14px]" />
          ))}
        </div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center">
          <MessagesSquare className="h-8 w-8 mx-auto text-[var(--color-text-muted)] mb-2" />
          <p className="text-[var(--color-text-secondary)]">Hali guruh ulanmagan</p>
        </Card>
      )}

      {availableGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="!text-[16px] !font-bold">Ulanishi mumkin bo'lgan guruhlar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--color-bg-border)]">
              {availableGroups.map((group) => (
                <div key={group.chatId} className="px-6 py-3 flex items-center justify-between gap-4">
                  <span className="text-body text-[var(--color-text-primary)] truncate">{group.title}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => linkGroup.mutate(group.chatId)}
                    disabled={linkGroup.isPending}
                  >
                    <Link2 className="h-3.5 w-3.5" /> Ulash
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
