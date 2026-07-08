import {
  Smartphone,
  Tags,
  Award,
  Megaphone,
  CheckCircle2,
} from 'lucide-react';
import { StatsCard } from '@/features/dashboard/components/StatsCard';
import { RecentProducts } from '@/features/dashboard/components/RecentProducts';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { Card, ErrorState } from '@/components/ui';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';

export function DashboardPage() {
  const { profile } = useAuth();
  const { data: stats, isLoading, isError, refetch } = useDashboardStats();

  const statCards = [
    { label: 'إجمالي المنتجات', value: stats?.total_products ?? 0, icon: Smartphone, color: 'indigo' as const },
    { label: 'المنتجات المتاحة', value: stats?.active_products ?? 0, icon: CheckCircle2, color: 'emerald' as const },
    { label: 'في التطبيق', value: stats?.in_app ?? 0, icon: Smartphone, color: 'sky' as const },
    { label: 'في النشرة', value: stats?.in_newsletter ?? 0, icon: Megaphone, color: 'amber' as const },
    { label: 'الفئات', value: stats?.total_categories ?? 0, icon: Tags, color: 'violet' as const },
    { label: 'العلامات التجارية', value: stats?.total_brands ?? 0, icon: Award, color: 'rose' as const },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* الترحيب */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {/* زخرفة خلفية متدرّجة */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 blur-3xl dark:from-indigo-500/20 dark:to-violet-500/20"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-gradient-to-br from-sky-500/10 to-emerald-500/10 blur-3xl dark:from-sky-500/10 dark:to-emerald-500/10"
        />

        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20">
            لوحة تحكم Bareq
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            مرحباً بك 👋
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {profile?.email ? (
              <>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {profile.email}
                </span>{' '}
                — نظرة عامة على متجر Bareq
              </>
            ) : (
              'نظرة عامة على متجر Bareq'
            )}
          </p>
        </div>
      </div>

      {/* البطاقات الإحصائية */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          نظرة عامة
        </h2>

        {isError ? (
          <Card>
            <ErrorState onRetry={refetch} />
          </Card>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map((card, i) => (
              <StatsCard key={card.label} {...card} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* آخر المنتجات */}
      <RecentProducts />
    </div>
  );
}
