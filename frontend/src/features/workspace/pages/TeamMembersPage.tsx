'use client';

import { useState } from 'react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/table';
import { Select } from '@/shared/ui/select';
import { EmptyState } from '@/shared/components/EmptyState';
import { DeleteConfirmation } from '@/shared/components/DeleteConfirmation';
import { InviteMemberForm } from '../components/InviteMemberForm';
import { UserPlus, Users, X } from 'lucide-react';
import {
  useWorkspaceMembers,
  useWorkspaceInvitations,
  useInviteMember,
  useChangeMemberRole,
  useRemoveMember,
  useRevokeInvitation,
} from '../hooks/useWorkspaceMembers';
import type { WorkspaceMember, WorkspaceRoleCode } from '../api/workspaceMembersApi';
import { useUser } from '@/features/auth/store/authStore';

function memberName(member: WorkspaceMember): string {
  return member.lastName ? `${member.firstName} ${member.lastName}` : member.firstName;
}

export function TeamMembersPage() {
  const currentUser = useUser();
  const { data: members = [], isLoading } = useWorkspaceMembers();
  const { data: invitations = [], isLoading: isLoadingInvitations } = useWorkspaceInvitations();

  const inviteMember = useInviteMember();
  const changeRole = useChangeMemberRole();
  const removeMember = useRemoveMember();
  const revokeInvitation = useRevokeInvitation();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [removingMember, setRemovingMember] = useState<WorkspaceMember | null>(null);

  const handleInvite = async (telegramId: number, roleCode: WorkspaceRoleCode) => {
    await inviteMember.mutateAsync({ telegramId, roleCode });
    setIsInviteOpen(false);
  };

  const handleRoleChange = (member: WorkspaceMember, roleCode: WorkspaceRoleCode) => {
    if (roleCode === member.roleCode) return;
    changeRole.mutate({ userId: member.id, roleCode });
  };

  const handleConfirmRemove = async () => {
    if (!removingMember) return;
    await removeMember.mutateAsync(removingMember.id);
    setRemovingMember(null);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-end">
        <Button variant="primary" onClick={() => setIsInviteOpen(true)}>
          <UserPlus className="h-4 w-4" />
          A'zo taklif qilish
        </Button>
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-[var(--color-bg-border)]">
          <h3 className="text-h4 font-semibold text-[var(--color-text-primary)]">Faol a'zolar</h3>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <EmptyState icon={Users} title="A'zolar topilmadi" description="Hali hech kim jamoaga qo'shilmagan." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ism</TableHead>
                <TableHead>Telegram</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Holat</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const isSelf = currentUser != null && String(member.id) === currentUser.id;
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={memberName(member)} src={member.photoUrl} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--color-text-primary)] truncate">
                            {memberName(member)}
                            {isSelf && <span className="ml-1.5 text-caption text-[var(--color-text-muted)]">(siz)</span>}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-caption text-[var(--color-text-secondary)]">
                        {member.username ? `@${member.username}` : member.telegramId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={member.roleCode}
                        onChange={(e) => handleRoleChange(member, e.target.value as WorkspaceRoleCode)}
                        disabled={isSelf || changeRole.isPending}
                        className="w-36 h-8 text-caption py-1"
                        options={[
                          { value: 'MEMBER', label: "A'zo" },
                          { value: 'OWNER', label: 'Egasi' },
                        ]}
                      />
                    </TableCell>
                    <TableCell>
                      {member.temporarilyBlocked ? (
                        <Badge variant="warning" size="sm">Vaqtincha bloklangan</Badge>
                      ) : (
                        <Badge variant="success" size="sm">Faol</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[var(--color-error)]"
                        disabled={isSelf}
                        onClick={() => setRemovingMember(member)}
                        aria-label="Jamoadan chiqarish"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {(isLoadingInvitations || invitations.length > 0) && (
        <Card>
          <div className="px-6 py-4 border-b border-[var(--color-bg-border)]">
            <h3 className="text-h4 font-semibold text-[var(--color-text-primary)]">Kutilayotgan takliflar</h3>
          </div>
          {isLoadingInvitations ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Telegram ID</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Yuborilgan sana</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.telegramId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" size="sm">{invitation.roleCode === 'OWNER' ? 'Egasi' : "A'zo"}</Badge>
                    </TableCell>
                    <TableCell className="text-caption text-[var(--color-text-secondary)]">
                      {new Date(invitation.createdAt).toLocaleDateString('uz-UZ')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--color-error)]"
                        loading={revokeInvitation.isPending}
                        onClick={() => revokeInvitation.mutate(invitation.id)}
                      >
                        Bekor qilish
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      <InviteMemberForm
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSubmit={handleInvite}
        isLoading={inviteMember.isPending}
      />

      <DeleteConfirmation
        isOpen={removingMember != null}
        onClose={() => setRemovingMember(null)}
        onConfirm={handleConfirmRemove}
        isLoading={removeMember.isPending}
        title="A'zoni jamoadan chiqarish"
        description="Bu foydalanuvchi ish maydoniga kira olmay qoladi. Davom etishni xohlaysizmi?"
        itemName={removingMember ? memberName(removingMember) : undefined}
      />
    </div>
  );
}
