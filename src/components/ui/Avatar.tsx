import { cn } from '@/utils/cn';

interface AvatarProps {
  name?: string | null;
  className?: string;
}

/** يعرض الأحرف الأولى من الاسم/البريد في دائرة ملوّنة. */
export function Avatar({ name, className }: AvatarProps) {
  const initials = (name ?? '?')
    .trim()
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
        'bg-indigo-100 text-sm font-semibold text-indigo-700',
        'dark:bg-indigo-900/50 dark:text-indigo-300',
        className
      )}
    >
      {initials || '?'}
    </div>
  );
}
