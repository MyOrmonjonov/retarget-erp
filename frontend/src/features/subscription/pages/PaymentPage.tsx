'use client';

import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Check, ShieldCheck, Copy, CreditCard, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { findPlan, findDuration, calculatePlanPrice, formatSom } from '../data/plans';
import { subscriptionApi } from '../api/subscriptionApi';

type PaymentMethod = 'click' | 'payme' | 'card';

// Card-to-card transfer target - there is no payment gateway behind this option: the customer
// transfers manually, then an admin confirms the transfer in the admin panel (see
// AdminDashboardPage's "Tasdiqlanishi kerak bo'lgan to'lovlar" section) before the subscription
// actually extends.
const PAYMENT_CARD_NUMBER = '9860170105680129';
const PAYMENT_CARD_HOLDER = 'Retarget ERP';

function formatCardNumber(raw: string): string {
  return raw.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const plan = findPlan(searchParams.get('plan'));
  const duration = findDuration(Number(searchParams.get('months')) || 1);

  const [orgName, setOrgName] = useState('');
  const [firstProjectName, setFirstProjectName] = useState('');
  // Click/Payme are temporarily hidden (not connected yet) - card-to-card is the only method
  // for now, so it starts pre-selected instead of making the customer pick from a list of one.
  const [method] = useState<PaymentMethod | null>('card');
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

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

  const handlePay = async () => {
    if (!orgName.trim()) {
      toast.error("Tashkilot nomini kiriting");
      return;
    }
    if (!method) {
      toast.error("To'lov usulini tanlang");
      return;
    }

    setSubmitting(true);
    try {
      await subscriptionApi.createPaymentRequest({
        planCode: plan.id,
        periodMonths: duration.months,
        amount: price.discountedTotal,
      });
      setRequestSent(true);
      toast.success("So'rovingiz yuborildi - admin tasdiqlaguncha kuting");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "So'rov yuborishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const copyCardNumber = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT_CARD_NUMBER);
      toast.success('Karta raqami nusxalandi');
    } catch {
      toast.error('Nusxalab bo\'lmadi');
    }
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
          {requestSent ? (
            <CardContent className="py-10 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success-muted)]">
                <Clock className="h-7 w-7 text-[var(--color-success)]" />
              </div>
              <p className="text-h3 font-bold text-[var(--color-text-primary)]">So'rovingiz qabul qilindi</p>
              <p className="text-body text-[var(--color-text-secondary)] max-w-sm mx-auto">
                Admin to'lovni tekshirib tasdiqlagach, obunangiz avtomatik faollashadi. Odatda bu bir necha soat ichida amalga oshadi.
              </p>
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Bosh sahifaga qaytish
              </Button>
            </CardContent>
          ) : (
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
                <p className="flex items-center gap-2 text-body font-medium text-[var(--color-text-primary)] mb-2">
                  <CreditCard className="h-4 w-4" /> Karta orqali to'lov
                </p>
                <div className="rounded-[var(--radius-md)] border-2 border-[var(--color-accent)]/30 bg-[var(--color-accent-muted)] p-4 space-y-3">
                  <p className="text-caption text-[var(--color-text-secondary)]">
                    Ko'rsatilgan summani quyidagi kartaga o'tkazing, so'ng "To'lov qildim" tugmasini bosing. Admin tekshirib tasdiqlagach obuna faollashadi.
                  </p>
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-[var(--color-bg-surface)] px-4 py-3">
                    <div>
                      <p className="text-h3 font-bold text-[var(--color-text-primary)] tabular-nums tracking-wider">
                        {formatCardNumber(PAYMENT_CARD_NUMBER)}
                      </p>
                      <p className="text-caption text-[var(--color-text-muted)] mt-0.5">{PAYMENT_CARD_HOLDER}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={copyCardNumber}>
                      <Copy className="h-3.5 w-3.5" /> Nusxalash
                    </Button>
                  </div>
                </div>
              </div>

              <Button variant="primary" size="lg" className="w-full" loading={submitting} onClick={handlePay}>
                To'lov qildim
              </Button>

              <p className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                Karta orqali to'lov admin tomonidan qo'lda tasdiqlanadi.
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
