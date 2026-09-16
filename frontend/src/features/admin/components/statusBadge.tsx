import { Badge } from '@/shared/ui/badge';
import type { SubscriptionStatus } from '../api/adminApi';

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: 'Faol',
  EXPIRED: "Muddati o'tgan",
  NEW: "To'lanmagan",
};

const STATUS_VARIANTS: Record<SubscriptionStatus, 'success' | 'error' | 'warning'> = {
  ACTIVE: 'success',
  EXPIRED: 'error',
  NEW: 'warning',
};

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]} size="sm">{STATUS_LABELS[status]}</Badge>;
}
