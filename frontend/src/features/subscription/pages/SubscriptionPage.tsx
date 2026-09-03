'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import {
  SUBSCRIPTION_PLANS,
  DURATION_OPTIONS,
  calculatePlanPrice,
  formatSom,
  type DurationOption,
} from '../data/plans';

export function SubscriptionPage() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState<DurationOption>(DURATION_OPTIONS[0]);

  return (
    <div className="max-w-6xl space-y-8 animate-in">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-h1 font-extrabold text-[var(--color-text-primary)]">Tarifni tanlang</h1>
        <p className="mt-2 text-body text-[var(--color-text-secondary)]">
          Jamoangiz hajmiga mos tarifni tanlang. Istalgan vaqtda tarifni almashtirishingiz mumkin.
        </p>
      </div>

      {/* Duration selector */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg-hover)] p-1 border border-[var(--color-bg-border)]">
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.months}
              type="button"
              onClick={() => setDuration(option)}
              className={cn(
                'relative flex items-center gap-1.5 px-4 py-2 rounded-full text-[13.5px] font-semibold transition-all duration-150',
                duration.months === option.months
                  ? 'bg-[var(--color-accent)] text-white shadow-[var(--shadow-sm)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              )}
            >
              {option.label}
              {option.discountPercent > 0 && (
                <span
                  className={cn(
                    'text-[10.5px] font-bold px-1.5 py-0.5 rounded-full',
                    duration.months === option.months
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--color-success-muted)] text-[var(--color-success)]'
                  )}
                >
                  -{option.discountPercent}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const price = calculatePlanPrice(plan.monthlyPrice, duration);
          return (
            <Card
              key={plan.id}
              variant={plan.highlighted ? 'bordered' : 'default'}
              className={cn(
                'relative flex flex-col p-6',
                plan.highlighted && 'border-[var(--color-accent)] shadow-[var(--shadow-lg)] md:-translate-y-2'
              )}
            >
              {plan.highlighted && (
                <Badge
                  variant="accent"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-[var(--shadow-sm)]"
                >
                  <Sparkles className="h-3 w-3" />
                  Eng ommabop
                </Badge>
              )}

              <div className="mb-4">
                <h3 className="text-h3 font-extrabold text-[var(--color-text-primary)]">{plan.name}</h3>
                <p className="mt-1 text-caption text-[var(--color-text-secondary)]">{plan.tagline}</p>
              </div>

              <div className="mb-1 flex items-end gap-1.5">
                <span className="text-h1 font-extrabold text-[var(--color-text-primary)] tabular-nums">
                  {formatSom(price.discountedMonthly)}
                </span>
                <span className="pb-1.5 text-caption text-[var(--color-text-muted)]">/ oyiga</span>
              </div>
              {duration.discountPercent > 0 ? (
                <p className="mb-4 text-caption text-[var(--color-success)] font-semibold">
                  {formatSom(price.discountedTotal)} — {duration.label} uchun ({formatSom(price.savings)} tejaysiz)
                </p>
              ) : (
                <p className="mb-4 text-caption text-[var(--color-text-muted)]">1 oylik obuna</p>
              )}

              <ul className="mb-6 space-y-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-body text-[var(--color-text-secondary)]">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--color-success)]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? 'primary' : 'secondary'}
                size="lg"
                className="w-full"
                onClick={() =>
                  navigate(`/subscription/payment?plan=${plan.id}&months=${duration.months}`)
                }
              >
                Tanlash
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
