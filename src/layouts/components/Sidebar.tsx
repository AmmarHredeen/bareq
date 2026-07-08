import { NavLink } from 'react-router-dom';
import { X, Smartphone } from 'lucide-react';
import { NAV_ITEMS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { usePendingOrdersCount } from '@/features/orders/hooks/useOrders';
import { cn } from '@/utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: pendingCount = 0 } = usePendingOrdersCount();

  return (
    <>
      {/* خلفية معتمة على الجوال */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-40 flex w-64 flex-col border-l transition-transform duration-300 lg:static lg:translate-x-0',
          'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
      {/* الشعار */}
<div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
  <div className="flex items-center gap-2.5">
    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 dark:ring-slate-700">
      <img
        src="/logo.jpeg"
        alt="Bareq"
        className="h-full w-full object-cover"
      />
    </div>
    <div>
      <h1 className="text-sm font-bold text-slate-900 dark:text-white">
        Bareq
      </h1>
      <p className="text-xs text-slate-500">لوحة الإدارة</p>
    </div>
  </div>
  <button
    onClick={onClose}
    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
    aria-label="إغلاق القائمة"
  >
    <X className="h-5 w-5" />
  </button>
</div>


        {/* عناصر التنقل */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isOrders = item.path === ROUTES.ORDERS;
            const showDot = isOrders && pendingCount > 0;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === ROUTES.DASHBOARD}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}

                {/* نقطة نابضة بجانب "الطلبات" عند وجود طلبات قيد الانتظار */}
                {showDot && (
                  <span className="ms-auto inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}

              </NavLink>
            );
          })}
        </nav>

        {/* تذييل */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <p className="text-center text-xs text-slate-400">
            Bareq Dashboard v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
