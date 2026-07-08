import { Pencil, Trash2, Smartphone, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatCurrency } from '@/utils/format';
import { PRODUCT_STATUS_META, PRODUCT_STATUS_FALLBACK } from '@/constants/app';
import { cn } from '@/utils/cn';
import type { ProductWithRelations } from '@/types/entities.types';

interface ProductTableProps {
  products: ProductWithRelations[];
  onEdit: (product: ProductWithRelations) => void;
  onDelete: (product: ProductWithRelations) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
            <th className="px-4 py-3 font-medium">المنتج</th>
            <th className="px-4 py-3 font-medium">العلامة</th>
            <th className="px-4 py-3 font-medium">الفئة</th>
            <th className="px-4 py-3 font-medium">الذاكرة</th>
            <th className="px-4 py-3 font-medium">مفرق / جملة</th>
            <th className="px-4 py-3 font-medium">الظهور</th>
            <th className="px-4 py-3 font-medium">الحالة</th>
            <th className="px-4 py-3 text-left font-medium">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {products.map((product) => {
const statusMeta = PRODUCT_STATUS_META[product.status] ?? PRODUCT_STATUS_FALLBACK;
            return (
              <tr
                key={product.id}
                className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      <Smartphone className="h-4.5 w-4.5" />
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {product.brand?.name ?? '—'}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {product.category?.name ?? '—'}
                </td>
                <td className="px-4 py-3">
                  {product.storage_option?.label ? (
                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {product.storage_option.label}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-xs text-slate-500 tabular-nums">
                      جملة: {formatCurrency(product.wholesale_price)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      title="يظهر في التطبيق"
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-md',
                        product.show_in_app
                          ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400'
                          : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600'
                      )}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                    </span>
                    <span
                      title="يظهر في النشرة"
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-md',
                        product.show_in_newsletter
                          ? 'bg-amber-50 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600'
                      )}
                    >
                      <Megaphone className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge color={statusMeta.color}>{statusMeta.label}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => onEdit(product)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
                      aria-label="تعديل"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
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
