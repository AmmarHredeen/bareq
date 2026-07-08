import { useState } from 'react';
import { Button, Select } from '@/components/ui';
import { ORDER_FULFILLMENT_OPTIONS } from '@/constants/app';
import type { OrderFulfillmentType } from '@/types/database.types';

interface DeliverFormProps {
  defaultValue: OrderFulfillmentType;
  onSubmit: (fulfillmentType: OrderFulfillmentType) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeliverForm({
  defaultValue,
  onSubmit,
  onCancel,
  isLoading,
}: DeliverFormProps) {
  const [value, setValue] = useState<OrderFulfillmentType>(defaultValue);

  return (
    <div className="space-y-5">
      <Select
        label="طريقة التسليم"
        value={value}
        options={ORDER_FULFILLMENT_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        }))}
        onChange={(e) => setValue(e.target.value as OrderFulfillmentType)}
      />

      <div className="flex gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          إلغاء
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={() => onSubmit(value)}
          isLoading={isLoading}
        >
          تأكيد التسليم
        </Button>
      </div>
    </div>
  );
}
