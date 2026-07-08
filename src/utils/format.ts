/** تنسيق العملة (دولار أمريكي). */
export function formatCurrency(value: number): string {
  const num = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
  return `$${num}`;
}

/** تنسيق رقم عادي بفواصل الآلاف. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ar').format(value);
}

/** تنسيق التاريخ بصيغة مقروءة. */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ar', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}
