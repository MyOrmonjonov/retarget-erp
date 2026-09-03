'use client';

import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import { findPlan, findDuration, calculatePlanPrice, formatSom } from '../data/plans';

type PaymentMethod = 'click' | 'payme';

export function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const plan = findPlan(searchParams.get('plan'));
  const duration = findDuration(Number(searchParams.get('months')) || 1);

  const [orgName, setOrgName] = useState('');
  const [firstProjectName, setFirstProjectName] = useState('');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!plan) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-in">
        <p className="text-body text-[var(--color-text-secondary)]">Tarif topilmadi.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/subscription')}>
          Tariflarga qaytish
        </Button>
      </div>
    );
  }

  const price = calculatePlanPrice(plan.monthlyPrice, duration);

  const handlePay = () => {
    if (!orgName.trim()) {
      toast.error("Tashkilot nomini kiriting");
      return;
    }
    if (!method) {
      toast.error("To'lov usulini tanlang");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(
        method === 'click'
          ? "Click orqali to'lov so'rovi qabul qilindi (demo rejim)"
          : "Payme orqali to'lov so'rovi qabul qilindi (demo rejim)"
      );
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      <Link
        to="/subscription"
        className="inline-flex items-center gap-1.5 text-caption font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tariflarga qaytish
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-6 items-start">
        {/* Order summary */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Buyurtma tafsilotlari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body font-bold text-[var(--color-text-primary)]">{plan.name} tarifi</p>
                <p className="text-caption text-[var(--color-text-secondary)]">{plan.tagline}</p>
              </div>
              {plan.highlighted && <Badge variant="accent">Ommabop</Badge>}
            </div>

            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-caption text-[var(--color-text-secondary)]">
                  <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-[var(--color-success)]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-[var(--color-bg-border)] pt-4 space-y-2">
              <div className="flex items-center justify-between text-caption text-[var(--color-text-secondary)]">
                <span>Muddat</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{duration.label}</span>
              </div>
              {duration.discountPercent > 0 && (
                <div className="flex items-center justify-between text-caption text-[var(--color-success)]">
                  <span>Chegirma</span>
                  <span className="font-semibold">-{duration.discountPercent}% ({formatSom(price.savings)})</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-body font-bold text-[var(--color-text-primary)]">Jami to'lov</span>
                <span className="text-h2 font-extrabold text-[var(--color-text-primary)] tabular-nums">
                  {formatSom(price.discountedTotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment form */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>To'lov ma'lumotlari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              label="Tashkilot nomi"
              placeholder="Masalan: Retarget Agency"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
            <Input
              label="Birinchi loyiha nomi"
              placeholder="Masalan: Instagram targetolog xizmati"
              value={firstProjectName}
              onChange={(e) => setFirstProjectName(e.target.value)}
              helperText="Ixtiyoriy — hisobingiz yaratilgach birinchi loyihangiz shu nom bilan qo'shiladi"
            />

            <div>
              <p className="block text-body font-medium text-[var(--color-text-primary)] mb-1.5">To'lov usuli</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('click')}
                  className={cn(
                    'flex items-center gap-3 rounded-[var(--radius-md)] border-2 px-4 py-3 transition-all duration-150 text-left',
                    method === 'click'
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]'
                      : 'border-[var(--color-bg-border)] hover:border-[var(--color-text-muted)]'
                  )}
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#0067FF] text-[11px] font-black text-white">
                    Click
                  </span>
                  <span>
                    <span className="block text-body font-semibold text-[var(--color-text-primary)]">Click</span>
                    <span className="block text-[11px] text-[var(--color-text-muted)]">orqali to'lash</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('payme')}
                  className={cn(
                    'flex items-center gap-3 rounded-[var(--radius-md)] border-2 px-4 py-3 transition-all duration-150 text-left',
                    method === 'payme'
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]'
                      : 'border-[var(--color-bg-border)] hover:border-[var(--color-text-muted)]'
                  )}
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#00C0DE] text-[10px] font-black text-white">
                    Payme
                  </span>
                  <span>
                    <span className="block text-body font-semibold text-[var(--color-text-primary)]">Payme</span>
                    <span className="block text-[11px] text-[var(--color-text-muted)]">orqali to'lash</span>
                  </span>
                </button>
              </div>
            </div>

            <Button variant="primary" size="lg" className="w-full" loading={submitting} onClick={handlePay}>
              {formatSom(price.discountedTotal)} to'lash
            </Button>

            <p className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
              <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
              Haqiqiy to'lov tizimi hozircha ulanmagan — bu sahifa namoyish (demo) rejimida ishlaydi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
