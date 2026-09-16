'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import type { RecordPaymentInput } from '../api/adminApi';

interface RecordPaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecordPaymentInput) => Promise<void>;
  isLoading?: boolean;
}

const PLAN_OPTIONS = [
  { value: 'START', label: 'Start' },
  { value: 'BIZNES', label: 'Biznes' },
  { value: 'PREMIUM', label: 'Premium' },
];

const PERIOD_OPTIONS = [
  { value: '1', label: '1 oy' },
  { value: '3', label: '3 oy' },
  { value: '6', label: '6 oy' },
  { value: '12', label: '12 oy' },
];

export function RecordPaymentForm({ isOpen, onClose, onSubmit, isLoading }: RecordPaymentFormProps) {
  const [amount, setAmount] = useState('');
  const [planCode, setPlanCode] = useState('START');
  const [periodMonths, setPeriodMonths] = useState('1');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("To'g'ri summa kiriting");
      return;
    }
    setError('');
    await onSubmit({
      amount: numericAmount,
      currency: 'UZS',
      planCode,
      periodMonths: Number(periodMonths),
      note: note.trim() || undefined,
    });
    setAmount('');
    setNote('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>To'lovni qayd etish</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          <Input
            label="Summa (so'm)"
            type="number"
            min={0}
            placeholder="Mas: 500000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={error}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tarif" options={PLAN_OPTIONS} value={planCode} onChange={(e) => setPlanCode(e.target.value)} />
            <Select label="Muddat" options={PERIOD_OPTIONS} value={periodMonths} onChange={(e) => setPeriodMonths(e.target.value)} />
          </div>
          <Textarea label="Izoh (ixtiyoriy)" placeholder="Mas: Click orqali to'landi" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
              Bekor qilish
            </Button>
            <Button type="submit" variant="primary" loading={isLoading}>
              Saqlash
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
