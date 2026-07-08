/** ثوابت عامة للتطبيق. */
export const APP = {
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  SEARCH_DEBOUNCE_MS: 350,
  THEME_STORAGE_KEY: 'bareq-theme',
} as const;

/**
 * خيارات الحالة المتاحة للمستخدم في النماذج والفلاتر.
 * محصورة في قيمتين فقط: متاح / مخفي.
 */
export const PRODUCT_STATUS_OPTIONS = [
  { value: 'active', label: 'متاح' },
  { value: 'inactive', label: 'مخفي' },
] as const;

export const USER_ROLE_OPTIONS = [
  { value: 'customer', label: 'زبون عادي' },
  { value: 'wholesaler', label: 'تاجر' },
  { value: 'admin', label: 'مدير' },
] as const;

/** خريطة لون وتسمية كل دور (للشارات). */
export const USER_ROLE_META: Record<
  string,
  { label: string; color: 'gray' | 'indigo' | 'green' }
> = {
  customer: { label: 'زبون عادي', color: 'gray' },
  wholesaler: { label: 'تاجر', color: 'indigo' },
  admin: { label: 'مدير', color: 'green' },
};

/**
 * خريطة لون وتسمية كل حالة منتج (للشارات).
 * نُبقي القيم الأربع كلها حتى تُعرض المنتجات القديمة بشكل صحيح،
 * حتى لو لم تعد بعض القيم قابلة للاختيار في الواجهة.
 */
export const PRODUCT_STATUS_META: Record<
  string,
  { label: string; color: 'green' | 'gray' | 'red' | 'yellow' }
> = {
  active: { label: 'متاح', color: 'green' },
  inactive: { label: 'مخفي', color: 'gray' },
  out_of_stock: { label: 'نفد المخزون', color: 'red' },
  discontinued: { label: 'متوقف', color: 'yellow' },
};

/** بيانات احتياطية لأي قيمة حالة غير متوقّعة. */
export const PRODUCT_STATUS_FALLBACK = {
  label: 'غير معروف',
  color: 'gray' as const,
};

export const NEWSLETTER_AUDIENCE = {
  CUSTOMER: 'customer',
  WHOLESALER: 'wholesaler',
} as const;

export type NewsletterAudience =
  (typeof NEWSLETTER_AUDIENCE)[keyof typeof NEWSLETTER_AUDIENCE];

export const NEWSLETTER_AUDIENCE_META: Record<
  NewsletterAudience,
  { label: string; priceLabel: string; priceField: 'price' | 'wholesale_price' }
> = {
  customer: {
    label: 'نشرة الزبائن',
    priceLabel: 'سعر المفرق',
    priceField: 'price',
  },
  wholesaler: {
    label: 'نشرة التجار',
    priceLabel: 'سعر الجملة',
    priceField: 'wholesale_price',
  },
};
/* ============ الطلبات (Orders) ============ */

/** خريطة لون وتسمية كل حالة طلب (للشارات). */
export const ORDER_STATUS_META: Record<
  string,
  { label: string; color: 'green' | 'gray' | 'red' | 'yellow' | 'indigo' }
> = {
  pending: { label: 'قيد الانتظار', color: 'yellow' },
  confirmed: { label: 'مؤكّد', color: 'indigo' },
  delivered: { label: 'تم التسليم', color: 'green' },
  rejected: { label: 'مرفوض', color: 'red' },
  cancelled: { label: 'ملغي', color: 'gray' },
};

export const ORDER_STATUS_FALLBACK = {
  label: 'غير معروف',
  color: 'gray' as const,
};

/** خيارات فلتر حالة الطلب. */
export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'confirmed', label: 'مؤكّد' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'rejected', label: 'مرفوض' },
  { value: 'cancelled', label: 'ملغي' },
] as const;

/** حالة الدفع — ⚠️ طابق القيم مع enum order_payment_status. */
export const ORDER_PAYMENT_STATUS_META: Record<
  string,
  { label: string; color: 'green' | 'gray' | 'red' | 'yellow' }
> = {
  pending: { label: 'غير مدفوع', color: 'yellow' },
  paid: { label: 'مدفوع', color: 'green' },
  refunded: { label: 'مُسترجع', color: 'gray' },
  failed: { label: 'فشل الدفع', color: 'red' },
};

export const ORDER_PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'غير مدفوع' },
  { value: 'paid', label: 'مدفوع' },
  { value: 'refunded', label: 'مُسترجع' },
  { value: 'failed', label: 'فشل الدفع' },
] as const;

/** نوع التسليم — ⚠️ طابق القيم مع enum order_fulfillment_type. */
export const ORDER_FULFILLMENT_META: Record<string, { label: string }> = {
  delivery: { label: 'توصيل' },
  pickup: { label: 'استلام من المحل' },
};

export const ORDER_FULFILLMENT_OPTIONS = [
  { value: 'delivery', label: 'توصيل' },
  { value: 'pickup', label: 'استلام من المحل' },
] as const;

/** طريقة الدفع — ⚠️ طابق القيم مع enum order_payment_method. */
export const ORDER_PAYMENT_METHOD_META: Record<string, { label: string }> = {
  cash: { label: 'نقداً' },
  card: { label: 'بطاقة' },
};
