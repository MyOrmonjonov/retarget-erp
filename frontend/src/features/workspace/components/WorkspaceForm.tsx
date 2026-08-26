'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';

interface WorkspaceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  initialName?: string;
  isLoading?: boolean;
}

export function WorkspaceForm({ isOpen, onClose, onSubmit, initialName, isLoading }: WorkspaceFormProps) {
  const isEdit = initialName != null;
  const [name, setName] = useState(initialName ?? '');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (isOpen) {
      setName(initialName ?? '');
      setError(undefined);
    }
  }, [isOpen, initialName]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Nomi kamida 2 ta belgi bo'lishi kerak");
      return;
    }
    await onSubmit(name.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Ish maydoni nomini o\'zgartirish' : 'Yangi ish maydoni yaratish'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); setError(undefined); }}
            label="Nomi"
            placeholder="Mas: Mening agentligim"
            error={error}
            autoFocus
          />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Bekor qilish
            </Button>
            <Button type="submit" variant="primary" loading={isLoading}>
              {isEdit ? 'Saqlash' : 'Yaratish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
