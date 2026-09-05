'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/ui/dialog';
import type { WorkspaceRoleCode } from '../api/workspaceMembersApi';

interface InviteMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (telegramId: number, roleCode: WorkspaceRoleCode) => Promise<void>;
  isLoading?: boolean;
}

export function InviteMemberForm({ isOpen, onClose, onSubmit, isLoading }: InviteMemberFormProps) {
  const [telegramId, setTelegramId] = useState('');
  const [roleCode, setRoleCode] = useState<WorkspaceRoleCode>('MEMBER');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (isOpen) {
      setTelegramId('');
      setRoleCode('MEMBER');
      setError(undefined);
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = Number(telegramId);
    if (!telegramId.trim() || !Number.isInteger(parsed) || parsed <= 0) {
      setError("Telegram ID musbat butun son bo'lishi kerak");
      return;
    }
    await onSubmit(parsed, roleCode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Jamoaga a'zo taklif qilish</DialogTitle>
          <DialogDescription>
            Telegram ID'si allaqachon ro'yxatdan o'tgan foydalanuvchi darhol qo'shiladi; aks holda, u ilovaga birinchi
            marta kirganda avtomatik jamoangizga qo'shiladi.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          <Input
            value={telegramId}
            onChange={(e) => { setTelegramId(e.target.value); setError(undefined); }}
            label="Telegram ID"
            placeholder="Mas: 123456789"
            inputMode="numeric"
            error={error}
            autoFocus
          />
          <Select
            value={roleCode}
            onChange={(e) => setRoleCode(e.target.value as WorkspaceRoleCode)}
            label="Rol"
            options={[
              { value: 'MEMBER', label: "A'zo (MEMBER)" },
              { value: 'OWNER', label: 'Egasi (OWNER)' },
            ]}
          />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Bekor qilish
            </Button>
            <Button type="submit" variant="primary" loading={isLoading}>
              Taklif yuborish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
