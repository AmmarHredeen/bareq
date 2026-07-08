import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type BadgeColor = 'green' | 'red' | 'yellow' | 'gray' | 'indigo';

const colors: Record<BadgeColor, string> = {
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  gray: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
};

export function Badge({
  color = 'gray',
  children,
}: {
  color?: BadgeColor;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colors[color]
      )}
    >
      {children}
    </span>
  );
}
