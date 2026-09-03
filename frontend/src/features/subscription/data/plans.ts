export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  highlighted?: boolean;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'start',
    name: 'Start',
    tagline: 'Kichik jamoalar uchun',
    monthlyPrice: 199000,
    features: [
      "5 tagacha xodim",
      "10 tagacha loyiha",
      "Vazifalar va Kanban board",
      'Telegram bot integratsiyasi',
      'Asosiy hisobotlar',
    ],
  },
  {
    id: 'biznes',
    name: 'Biznes',
    tagline: "O'sib borayotgan kompaniyalar uchun",
    monthlyPrice: 349000,
    highlighted: true,
    features: [
      '20 tagacha xodim',
      'Cheklanmagan loyihalar',
      "Dizayn, Montaj, Syomka, Target bo'limlari",
      'KPI nazorat va davomat',
      'Moliya va to\'lovlar moduli',
      'Ustuvor qo\'llab-quvvatlash',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Yirik jamoalar uchun',
    monthlyPrice: 599000,
    features: [
      'Cheklanmagan xodimlar',
      'Barcha Biznes tarif imkoniyatlari',
      "Maxsus onboarding va o'qitish",
      'API kirish huquqi',
      '24/7 shaxsiy qo\'llab-quvvatlash',
    ],
  },
];

export interface DurationOption {
  months: 1 | 3 | 6 | 12;
  label: string;
  discountPercent: number;
}

export const DURATION_OPTIONS: DurationOption[] = [
  { months: 1, label: '1 oy', discountPercent: 0 },
  { months: 3, label: '3 oy', discountPercent: 10 },
  { months: 6, label: '6 oy', discountPercent: 20 },
  { months: 12, label: '12 oy', discountPercent: 30 },
];

export function findPlan(planId: string | null): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
}

export function findDuration(months: number | null): DurationOption {
  return DURATION_OPTIONS.find((option) => option.months === months) ?? DURATION_OPTIONS[0];
}

export interface PlanPriceBreakdown {
  fullTotal: number;
  discountedTotal: number;
  discountedMonthly: number;
  savings: number;
}

export function calculatePlanPrice(monthlyPrice: number, duration: DurationOption): PlanPriceBreakdown {
  const fullTotal = monthlyPrice * duration.months;
  const discountedTotal = Math.round((fullTotal * (1 - duration.discountPercent / 100)) / 1000) * 1000;
  const discountedMonthly = Math.round(discountedTotal / duration.months / 1000) * 1000;
  return {
    fullTotal,
    discountedTotal,
    discountedMonthly,
    savings: fullTotal - discountedTotal,
  };
}

export function formatSom(value: number): string {
  return `${new Intl.NumberFormat('uz-UZ').format(value)} so'm`;
}
