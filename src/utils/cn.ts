import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** دمج كلاسات Tailwind بذكاء (يحل تعارض الكلاسات تلقائياً). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
