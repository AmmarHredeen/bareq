import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose' | 'violet';
  /** ترتيب البطاقة لتأثير الظهور المتتابع (اختياري) */
  index?: number;
}

const colorClasses: Record<
  StatsCardProps['color'],
  { icon: string; accent: string; glow: string }
> = {
  indigo: {
    icon: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/25',
    accent: 'bg-indigo-500',
    glow: 'from-indigo-500/5',
  },
  emerald: {
    icon: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25',
    accent: 'bg-emerald-500',
    glow: 'from-emerald-500/5',
  },
  amber: {
    icon: 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-amber-500/25',
    accent: 'bg-amber-500',
    glow: 'from-amber-500/5',
  },
  sky: {
    icon: 'bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-sky-500/25',
    accent: 'bg-sky-500',
    glow: 'from-sky-500/5',
  },
  rose: {
    icon: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-500/25',
    accent: 'bg-rose-500',
    glow: 'from-rose-500/5',
  },
  violet: {
    icon: 'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-violet-500/25',
    accent: 'bg-violet-500',
    glow: 'from-violet-500/5',
  },
};

export function StatsCard({ label, value, icon: Icon, color, index = 0 }: StatsCardProps) {
  const c = colorClasses[color];

  return (
    <Card
      hoverable
      className="group relative animate-slide-up overflow-hidden p-5"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
    >
      {/* توهّج خلفي عند المرور */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          c.glow
        )}
      />

      {/* مؤشر لوني جانبي */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-y-0 right-0 w-1 origin-center scale-y-0 rounded-full transition-transform duration-300 group-hover:scale-y-100',
          c.accent
        )}
      />

      <div className="relative flex items-center justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
            {formatNumber(value)}
          </p>
        </div>
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3',
            c.icon
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
