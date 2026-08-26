'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
  title?: string;
  description?: string;
  itemName?: string;
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title = 'O\'chirishni tasdiqlang',
  description = 'Bu amalni qaytarib bo\'lmaydi. Davom etishni xohlaysizmi?',
  itemName,
}: DeleteConfirmationProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[var(--color-error)]/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-[var(--color-error)]" />
            </div>
            <DialogTitle className="text-h4">{title}</DialogTitle>
          </div>
          <DialogDescription>
            {itemName ? `"${itemName}" ${description.toLowerCase()}` : description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Bekor qilish
          </Button>
          <Button variant="destructive" onClick={onConfirm} loading={isLoading}>
            O'chirish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}