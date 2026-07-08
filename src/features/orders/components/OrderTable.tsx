import { Eye } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';
import {
  ORDER_FULFILLMENT_META,
} from '@/constants/app';
import type { OrderWithRelations } from '@/types/database.types';

interface OrderTableProps {
  orders: OrderWithRelations[];
  onView: (order: OrderWithRelations) => void;
}

export function OrderTable({ orders, onView }: OrderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
            <th className="px-4 py-3 font-medium">رقم الطلب</th>
            <th className="px-4 py-3 font-medium">العميل</th>
            <th className="px-4 py-3 font-medium">التسليم</th>
            <th className="px-4 py-3 font-medium">الإجمالي</th>
            <th className="px-4 py-3 font-medium">الحالة</th>
            <th className="px-4 py-3 font-medium">التاريخ</th>
            <th className="px-4 py-3 text-left font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {orders.map((order) => {
            const fulfillMeta =
              ORDER_FULFILLMENT_META[order.fulfillment_type];
            return (
              <tr
                key={order.id}
                className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
                    {order.order_number}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {order.customer?.full_name ??
                        order.customer?.shop_name ??
                        '—'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {order.delivery_phone ?? order.customer?.phone ?? ''}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {fulfillMeta?.label ?? order.fulfillment_type}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {formatCurrency(order.total)}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 tabular-nums">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => onView(order)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
                      aria-label="عرض التفاصيل"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
