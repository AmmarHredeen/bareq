import { Select } from '@/components/ui';
import { ORDER_STATUS_OPTIONS, ORDER_FULFILLMENT_OPTIONS } from '@/constants/app';
import type { OrderStatus, OrderFulfillmentType } from '@/types/database.types';

interface OrderFiltersProps {
  status: OrderStatus | '';
  fulfillmentType: OrderFulfillmentType | '';
  onStatusChange: (v: OrderStatus | '') => void;
  onFulfillmentChange: (v: OrderFulfillmentType | '') => void;
}

export function OrderFilters({
  status,
  fulfillmentType,
  onStatusChange,
  onFulfillmentChange,
}: OrderFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Select
        value={status}
        placeholder="كل الحالات"
        options={ORDER_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        onChange={(e) => onStatusChange(e.target.value as OrderStatus | '')}
      />
      <Select
        value={fulfillmentType}
        placeholder="كل أنواع التسليم"
        options={ORDER_FULFILLMENT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        onChange={(e) => onFulfillmentChange(e.target.value as OrderFulfillmentType | '')}
      />
    </div>
  );
}
