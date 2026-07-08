import { Check, Truck, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';
import { ORDER_FULFILLMENT_META } from '@/constants/app';

import type { OrderWithRelations } from '@/types/order.types';

// ...
interface OrderDetailsProps {
  order: OrderWithRelations;
  onConfirm: () => void;
  onDeliver: () => void;   // سيفتح مودال اختيار طريقة التسليم في الصفحة
  onReject: () => void;
  isBusy?: boolean;
}


function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-left font-medium text-slate-800 dark:text-slate-200">
        {value ?? '—'}
      </span>
    </div>
  );
}


export function OrderDetails({
  order,
  onConfirm,
  onDeliver,
  onReject,
  isBusy,
}: OrderDetailsProps) {
  const items = order.items ?? [];

  // الإجراءات المتاحة حسب الحالة الحالية
  const canConfirm = order.status === 'pending';
  const canDeliver = order.status === 'confirmed';
  const canReject = order.status === 'pending';


  return (
    <div className="space-y-5">
      {/* رأس */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
            {order.order_number}
          </p>
          <p className="text-xs text-slate-400">
            {formatDate(order.created_at)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* بيانات العميل والتسليم */}
      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <h4 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          العميل والتسليم
        </h4>
        <Row
          label="العميل"
          value={
            order.customer?.full_name ?? order.customer?.shop_name ?? '—'
          }
        />
        <Row label="الهاتف" value={order.delivery_phone ?? order.customer?.phone} />
        <Row
          label="نوع التسليم"
          value={
            ORDER_FULFILLMENT_META[order.fulfillment_type]?.label ??
            order.fulfillment_type
          }
        />
        <Row label="العنوان" value={order.delivery_address} />
        <Row label="المدينة" value={order.delivery_city} />
        <Row label="ملاحظات التوصيل" value={order.delivery_notes} />
        <Row label="ملاحظات العميل" value={order.customer_notes} />
      </div>



      {/* العناصر */}
      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          عناصر الطلب ({items.length})
        </h4>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50"
            >
              <div className="flex flex-col">
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {item.product_name}
                </span>
                <span className="text-xs text-slate-400">
                  {[item.storage_label]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="tabular-nums">
                  {item.quantity} × {formatCurrency(item.unit_price)}
                </span>
                <span className="font-semibold text-slate-800 tabular-nums dark:text-slate-200">
                  {formatCurrency(item.total_price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* الملخّص المالي */}
      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <Row label="المجموع الفرعي" value={formatCurrency(order.subtotal)} />
        <Row label="رسوم التوصيل" value={formatCurrency(order.delivery_fee)} />
        <Row label="الخصم" value={formatCurrency(order.discount)} />
        <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 dark:border-slate-700">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            الإجمالي
          </span>
          <span className="font-bold text-indigo-600 tabular-nums dark:text-indigo-400">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      {/* سبب الرفض/الإلغاء إن وُجد */}
      {order.reject_reason && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          سبب الرفض: {order.reject_reason}
        </div>
      )}
      {order.cancel_reason && (
        <div className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          سبب الإلغاء: {order.cancel_reason}
        </div>
      )}
      {/* أزرار الإجراءات */}
      {(canConfirm || canDeliver || canReject) && (
        <div className="sticky bottom-0 -mx-6 -mb-6 mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          {canReject && (
            <Button variant="outline" onClick={onReject} disabled={isBusy}>
              <X className="h-4 w-4" />
              رفض
            </Button>
          )}
          {canConfirm && (
            <Button onClick={onConfirm} isLoading={isBusy}>
              <Check className="h-4 w-4" />
              تأكيد الطلب
            </Button>
          )}
          {canDeliver && (
            <Button onClick={onDeliver} isLoading={isBusy}>
              <Truck className="h-4 w-4" />
              تم التسليم
            </Button>
          )}
        </div>
      )}


    </div>
  );
}
