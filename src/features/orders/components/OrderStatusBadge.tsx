import { Badge } from '@/components/ui';
import { ORDER_STATUS_META, ORDER_STATUS_FALLBACK } from '@/constants/app';
import type { OrderStatus } from '@/types/order.types';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_META[status] ?? ORDER_STATUS_FALLBACK;
  return <Badge color={meta.color}>{meta.label}</Badge>;
}
