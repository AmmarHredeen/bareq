import { Link } from 'react-router-dom';
import { ArrowLeft, Smartphone, Package } from 'lucide-react';
import { Card, Badge, EmptyState } from '@/components/ui';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/format';
import { PRODUCT_STATUS_META } from '@/constants/app';
import { ROUTES } from '@/constants/routes';
import { useRecentProducts } from '../hooks/useDashboardStats';

export function RecentProducts() {
  const { data, isLoading } = useRecentProducts();
  const products = data ?? [];

  return (
    <Card className="animate-slide-up overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Package className="h-4.5 w-4.5" />
          </span>
          <div>
            <h2 className="text-base font-semibold leading-tight text-slate-900 dark:text-white">
              آخر المنتجات
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              أحدث المنتجات المضافة للمتجر
            </p>
          </div>
        </div>
        <Link
          to={ROUTES.PRODUCTS}
          className="group inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
        >
          عرض الكل
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title="لا توجد منتجات بعد"
          description="ابدأ بإضافة منتجات لتظهر هنا"
        />
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {products.map((product) => {
            const statusMeta = PRODUCT_STATUS_META[product.status];
            return (
              <li
                key={product.id}
                className="group flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-500 dark:bg-slate-800 dark:text-slate-500 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-400">
                    <Smartphone className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                      {product.name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {[product.brand?.name, product.storage_option?.label]
                        .filter(Boolean)
                        .join(' • ') || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                    {formatCurrency(product.price)}
                  </span>
                  <Badge color={statusMeta.color}>{statusMeta.label}</Badge>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
